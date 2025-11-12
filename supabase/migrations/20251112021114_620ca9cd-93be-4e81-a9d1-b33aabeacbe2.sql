-- Create enum for achievement rarity
CREATE TYPE achievement_rarity AS ENUM ('common', 'rare', 'legendary');

-- Create enum for achievement category
CREATE TYPE achievement_category AS ENUM ('workout', 'streak', 'goal', 'milestone');

-- Create achievements master table (defines all possible achievements)
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL, -- lucide icon name
  rarity achievement_rarity NOT NULL DEFAULT 'common',
  category achievement_category NOT NULL,
  requirement_value INTEGER NOT NULL, -- e.g., 10 workouts, 7 day streak
  requirement_type TEXT NOT NULL, -- e.g., 'total_workouts', 'streak_days', 'goals_completed'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_achievements table (tracks which achievements users have unlocked)
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  progress INTEGER NOT NULL DEFAULT 0,
  unlocked BOOLEAN NOT NULL DEFAULT false,
  unlocked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS policies for achievements (readable by all authenticated users)
CREATE POLICY "Achievements are viewable by authenticated users"
  ON public.achievements FOR SELECT
  TO authenticated
  USING (true);

-- RLS policies for user_achievements
CREATE POLICY "Users can view their own achievements"
  ON public.user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements"
  ON public.user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievements"
  ON public.user_achievements FOR UPDATE
  USING (auth.uid() = user_id);

-- Create trigger for user_achievements updated_at
CREATE TRIGGER update_user_achievements_updated_at
  BEFORE UPDATE ON public.user_achievements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes
CREATE INDEX idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement_id ON public.user_achievements(achievement_id);
CREATE INDEX idx_achievements_category ON public.achievements(category);
CREATE INDEX idx_achievements_rarity ON public.achievements(rarity);

-- Insert predefined achievements
INSERT INTO public.achievements (title, description, icon, rarity, category, requirement_value, requirement_type) VALUES
  -- Workout achievements
  ('First Step', 'Complete your first workout', 'Footprints', 'common', 'workout', 1, 'total_workouts'),
  ('Getting Started', 'Complete 5 workouts', 'Dumbbell', 'common', 'workout', 5, 'total_workouts'),
  ('Workout Warrior', 'Complete 10 workouts', 'Flame', 'common', 'workout', 10, 'total_workouts'),
  ('Fitness Enthusiast', 'Complete 25 workouts', 'Trophy', 'rare', 'workout', 25, 'total_workouts'),
  ('Gym Legend', 'Complete 50 workouts', 'Crown', 'rare', 'workout', 50, 'total_workouts'),
  ('Ultimate Champion', 'Complete 100 workouts', 'Star', 'legendary', 'workout', 100, 'total_workouts'),
  
  -- Streak achievements
  ('Consistency Starter', 'Maintain a 3-day workout streak', 'Zap', 'common', 'streak', 3, 'streak_days'),
  ('Week Warrior', 'Maintain a 7-day workout streak', 'Calendar', 'rare', 'streak', 7, 'streak_days'),
  ('Unstoppable Force', 'Maintain a 30-day workout streak', 'Sparkles', 'legendary', 'streak', 30, 'streak_days'),
  
  -- Goal achievements
  ('Goal Setter', 'Create your first goal', 'Target', 'common', 'goal', 1, 'goals_created'),
  ('Goal Crusher', 'Complete your first goal', 'CheckCircle', 'common', 'goal', 1, 'goals_completed'),
  ('Overachiever', 'Complete 5 goals', 'Award', 'rare', 'goal', 5, 'goals_completed'),
  ('Master Planner', 'Complete 10 goals', 'Medal', 'legendary', 'goal', 10, 'goals_completed'),
  
  -- Milestone achievements
  ('Calorie Burner', 'Burn 1,000 total calories', 'Flame', 'common', 'milestone', 1000, 'total_calories'),
  ('Endurance Master', 'Log 300 total minutes', 'Clock', 'rare', 'milestone', 300, 'total_minutes'),
  ('Iron Will', 'Lift 10,000 total pounds', 'Dumbbell', 'legendary', 'milestone', 10000, 'total_weight');