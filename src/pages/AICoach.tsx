import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Brain, Loader2, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const AICoach = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    setResponse('');

    try {
      const { data, error } = await supabase.functions.invoke('ai-coach', {
        body: { message: input },
      });

      if (error) throw error;

      setResponse(data.response);
      toast({
        title: 'Response received!',
        description: 'Your AI coach has analyzed your request',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to get AI response',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    'How do I improve my squat form?',
    'Create a workout plan for building muscle',
    'What exercises target the chest?',
    'Tips for increasing my bench press',
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center space-x-3">
          <Brain className="h-10 w-10 text-primary" />
          <span>AI Fitness Coach</span>
        </h1>
        <p className="text-muted-foreground text-lg">
          Get personalized advice, workout suggestions, and form feedback
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="glass">
          <CardHeader>
            <CardTitle>Ask Your Coach</CardTitle>
            <CardDescription>
              Describe your fitness goals, ask about exercises, or request workout plans
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                placeholder="Example: I want to build upper body strength. Can you suggest a workout routine?"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-32"
                disabled={isLoading}
              />
              <Button
                type="submit"
                className="w-full gradient-primary hover:opacity-90 transition-smooth"
                disabled={isLoading || !input.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Get AI Advice
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6">
              <p className="text-sm font-medium mb-3">Quick suggestions:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {suggestions.map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    className="justify-start text-left h-auto py-2"
                    onClick={() => setInput(suggestion)}
                    disabled={isLoading}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {response && (
          <Card className="glass shadow-glow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-primary" />
                <span>AI Coach Response</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-secondary p-6 rounded-lg">
                <p className="whitespace-pre-wrap leading-relaxed">{response}</p>
              </div>
              <Button
                onClick={() => navigator.clipboard.writeText(response)}
                variant="outline"
                className="w-full mt-4"
              >
                Copy Response
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AICoach;