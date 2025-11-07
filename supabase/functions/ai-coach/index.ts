import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.78.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId, conversationHistory } = await req.json();
    
    if (!message || typeof message !== 'string') {
      throw new Error('Invalid message');
    }
    
    if (message.length > 5000) {
      throw new Error('Message too long (max 5000 characters)');
    }

    console.log('Processing AI coach request...');

    // Check if this is a workout command
    const lowerMessage = message.toLowerCase();
    const isWorkoutCommand = 
      lowerMessage.includes('move') && (lowerMessage.includes('workout') || lowerMessage.includes('day')) ||
      lowerMessage.includes('reschedule') ||
      lowerMessage.includes('extend') && lowerMessage.includes('program');

    let workoutCommandResult = null;
    
    if (isWorkoutCommand && userId) {
      console.log('Detected workout command, processing...');
      
      const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Parse workout command using AI
      const commandParseResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            {
              role: 'system',
              content: `You are a workout command parser. Extract the following information from the user's message and respond ONLY with a JSON object:
{
  "action": "move" | "extend" | "unknown",
  "fromDay": number | null,
  "toDay": number | null,
  "extendDays": number | null
}

Examples:
- "move my workout from day 12 to day 15" → {"action":"move","fromDay":12,"toDay":15,"extendDays":null}
- "move workout from monday to wednesday" → {"action":"move","fromDay":"monday","toDay":"wednesday","extendDays":null}
- "extend program by 7 days" → {"action":"extend","fromDay":null,"toDay":null,"extendDays":7}
- "extend my program by 2 weeks" → {"action":"extend","fromDay":null,"toDay":null,"extendDays":14}`,
            },
            {
              role: 'user',
              content: message,
            },
          ],
        }),
      });

      if (commandParseResponse.ok) {
        const parseData = await commandParseResponse.json();
        const commandStr = parseData.choices?.[0]?.message?.content || '{}';
        
        try {
          const command = JSON.parse(commandStr.replace(/```json\n?|\n?```/g, '').trim());
          
          if (command.action === 'move' && command.fromDay && command.toDay) {
            // Fetch the workout to move
            const { data: workoutData } = await supabase
              .from('workout_schedule')
              .select('*')
              .eq('user_id', userId)
              .eq('day_number', command.fromDay)
              .single();

            if (workoutData) {
              const { error } = await supabase
                .from('workout_schedule')
                .upsert({
                  user_id: userId,
                  day_number: command.toDay,
                  workout_name: workoutData.workout_name,
                  exercises: workoutData.exercises,
                  duration: workoutData.duration,
                  focus: workoutData.focus
                }, { onConflict: 'user_id,day_number' });

              workoutCommandResult = error ? null : {
                action: 'move',
                fromDay: command.fromDay,
                toDay: command.toDay,
                success: !error
              };
            }
          } else if (command.action === 'extend' && command.extendDays) {
            // Extend program logic
            const { data: maxDayData } = await supabase
              .from('workout_schedule')
              .select('day_number')
              .eq('user_id', userId)
              .order('day_number', { ascending: false })
              .limit(1)
              .single();

            const maxDay = maxDayData?.day_number || 0;
            const newWorkouts = [];
            const defaultWorkouts = [
              { name: "Chest & Triceps", exercises: 5, duration: "35 min", focus: "Chest" },
              { name: "Back & Biceps", exercises: 4, duration: "40 min", focus: "Back" },
              { name: "Legs", exercises: 6, duration: "45 min", focus: "Legs" },
              { name: "Shoulders & Core", exercises: 4, duration: "30 min", focus: "Shoulders" },
              { name: "Back + Front hand", exercises: 3, duration: "28 min", focus: "Back" },
              { name: "Rest Day", exercises: 0, duration: "0 min", focus: "Rest" },
              { name: "Active Recovery", exercises: 2, duration: "20 min", focus: "Mobility" },
            ];

            for (let i = 1; i <= command.extendDays; i++) {
              const newDayNumber = maxDay + i;
              const dayOfWeek = newDayNumber % 7;
              const workout = defaultWorkouts[dayOfWeek];

              newWorkouts.push({
                user_id: userId,
                day_number: newDayNumber,
                workout_name: workout.name,
                exercises: workout.exercises,
                duration: workout.duration,
                focus: workout.focus
              });
            }

            const { error } = await supabase
              .from('workout_schedule')
              .insert(newWorkouts);

            workoutCommandResult = {
              action: 'extend',
              extendDays: command.extendDays,
              success: !error
            };
          }
        } catch (e) {
          console.error('Error parsing command:', e);
        }
      }
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build messages array with conversation history
    const messages = [
      {
        role: 'system',
        content: `You are an expert fitness coach and personal trainer with workout scheduling capabilities. 
        
Provide detailed, accurate, and motivating advice about exercise, workout routines, proper form, nutrition, and fitness goals. Be encouraging but realistic. Always emphasize safety and proper technique.

You can help users manage their workout schedules. When they ask to move workouts or extend their program, acknowledge the action and confirm what was done.

${workoutCommandResult ? `IMPORTANT: A workout command was just executed: ${JSON.stringify(workoutCommandResult)}. Acknowledge this in your response naturally.` : ''}

Keep responses concise but informative.`,
      }
    ];

    // Add conversation history if provided
    if (conversationHistory && Array.isArray(conversationHistory)) {
      messages.push(...conversationHistory.slice(-6).map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })));
    }

    messages.push({
      role: 'user',
      content: message,
    });

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI service requires additional credits. Please contact support.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || '';

    console.log('AI coach response generated successfully');

    return new Response(JSON.stringify({ 
      response: aiResponse,
      advice: aiResponse, // for backward compatibility
      workoutCommandResult 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-coach function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});