-- Create workout_schedule table to store custom workout assignments
CREATE TABLE public.workout_schedule (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  day_number INTEGER NOT NULL,
  workout_name TEXT NOT NULL,
  exercises INTEGER NOT NULL,
  duration TEXT NOT NULL,
  focus TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, day_number)
);

-- Enable Row Level Security
ALTER TABLE public.workout_schedule ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own schedule" 
ON public.workout_schedule 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own schedule" 
ON public.workout_schedule 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own schedule" 
ON public.workout_schedule 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own schedule" 
ON public.workout_schedule 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_workout_schedule_updated_at
BEFORE UPDATE ON public.workout_schedule
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.workout_schedule;