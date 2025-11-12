-- Create table for saved workout recommendations
CREATE TABLE public.saved_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  duration TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  exercises JSONB NOT NULL,
  benefits TEXT[] NOT NULL,
  saved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for tracking completion of saved recommendations
CREATE TABLE public.recommendation_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  recommendation_id UUID NOT NULL REFERENCES public.saved_recommendations(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback_notes TEXT,
  exercises_completed JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.saved_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_completions ENABLE ROW LEVEL SECURITY;

-- Create policies for saved_recommendations
CREATE POLICY "Users can view their own saved recommendations"
ON public.saved_recommendations
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saved recommendations"
ON public.saved_recommendations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved recommendations"
ON public.saved_recommendations
FOR DELETE
USING (auth.uid() = user_id);

-- Create policies for recommendation_completions
CREATE POLICY "Users can view their own completions"
ON public.recommendation_completions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own completions"
ON public.recommendation_completions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own completions"
ON public.recommendation_completions
FOR UPDATE
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_saved_recommendations_user_id ON public.saved_recommendations(user_id);
CREATE INDEX idx_recommendation_completions_user_id ON public.recommendation_completions(user_id);
CREATE INDEX idx_recommendation_completions_recommendation_id ON public.recommendation_completions(recommendation_id);