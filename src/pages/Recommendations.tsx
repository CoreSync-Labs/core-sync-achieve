import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Sparkles, Dumbbell, Clock, TrendingUp, CheckCircle, Loader2, Heart, Star, Trash2, PlayCircle } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';

interface Exercise {
  name: string;
  sets: string;
  reps: string;
  notes?: string;
}

interface Recommendation {
  title: string;
  description: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  exercises: Exercise[];
  benefits: string[];
}

interface SavedRecommendation extends Recommendation {
  id: string;
  saved_at: string;
}

interface CompletionFeedback {
  recommendationId: string;
  rating: number;
  notes: string;
  completedExercises: string[];
}

const Recommendations = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [savedRecommendations, setSavedRecommendations] = useState<SavedRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [completionDialog, setCompletionDialog] = useState<{ open: boolean; recommendation: SavedRecommendation | null }>({
    open: false,
    recommendation: null,
  });
  const [rating, setRating] = useState(0);
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      fetchSavedRecommendations();
    }
  }, [user]);

  const fetchSavedRecommendations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('saved_recommendations')
        .select('*')
        .eq('user_id', user.id)
        .order('saved_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setSavedRecommendations(data.map(rec => ({
          id: rec.id,
          title: rec.title,
          description: rec.description,
          duration: rec.duration,
          difficulty: rec.difficulty as 'beginner' | 'intermediate' | 'advanced',
          exercises: rec.exercises as unknown as Exercise[],
          benefits: rec.benefits,
          saved_at: rec.saved_at,
        })));
      }
    } catch (error: any) {
      console.error('Error fetching saved recommendations:', error);
    }
  };

  const saveRecommendation = async (recommendation: Recommendation, index: number) => {
    if (!user) {
      toast.error('You must be logged in to save recommendations');
      return;
    }

    setSavingId(`new-${index}`);
    try {
      const { data, error } = await supabase
        .from('saved_recommendations')
        .insert([{
          user_id: user.id,
          title: recommendation.title,
          description: recommendation.description,
          duration: recommendation.duration,
          difficulty: recommendation.difficulty,
          exercises: recommendation.exercises as any,
          benefits: recommendation.benefits,
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success('Workout saved to favorites!');
      fetchSavedRecommendations();
    } catch (error: any) {
      console.error('Error saving recommendation:', error);
      toast.error('Failed to save workout');
    } finally {
      setSavingId(null);
    }
  };

  const deleteSavedRecommendation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('saved_recommendations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Workout removed from favorites');
      fetchSavedRecommendations();
    } catch (error: any) {
      console.error('Error deleting recommendation:', error);
      toast.error('Failed to remove workout');
    }
  };

  const openCompletionDialog = (recommendation: SavedRecommendation) => {
    setCompletionDialog({ open: true, recommendation });
    setRating(0);
    setFeedbackNotes('');
    setCompletedExercises(new Set());
  };

  const submitCompletion = async () => {
    if (!user || !completionDialog.recommendation) return;

    if (rating === 0) {
      toast.error('Please provide a rating');
      return;
    }

    try {
      const { error } = await supabase
        .from('recommendation_completions')
        .insert([{
          user_id: user.id,
          recommendation_id: completionDialog.recommendation.id,
          rating,
          feedback_notes: feedbackNotes || null,
          exercises_completed: Array.from(completedExercises) as any,
        }]);

      if (error) throw error;

      toast.success('Feedback submitted! This will help improve future recommendations.');
      setCompletionDialog({ open: false, recommendation: null });
      setRating(0);
      setFeedbackNotes('');
      setCompletedExercises(new Set());
    } catch (error: any) {
      console.error('Error submitting completion:', error);
      toast.error('Failed to submit feedback');
    }
  };

  const toggleExerciseCompletion = (exerciseName: string) => {
    setCompletedExercises(prev => {
      const newSet = new Set(prev);
      if (newSet.has(exerciseName)) {
        newSet.delete(exerciseName);
      } else {
        newSet.add(exerciseName);
      }
      return newSet;
    });
  };

  const generateRecommendations = async () => {
    if (!user) {
      toast.error('You must be logged in to generate recommendations');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-workout-recommendations', {
        body: { userId: user.id }
      });

      if (error) {
        console.error('Edge function error:', error);
        if (error.message?.includes('429')) {
          toast.error('Rate limit exceeded. Please try again in a moment.');
        } else if (error.message?.includes('402')) {
          toast.error('AI credits depleted. Please add credits to continue.');
        } else {
          toast.error('Failed to generate recommendations');
        }
        return;
      }

      if (data?.recommendations) {
        setRecommendations(data.recommendations);
        toast.success('AI-powered recommendations generated!');
      } else {
        toast.error('No recommendations received');
      }
    } catch (error: any) {
      console.error('Error generating recommendations:', error);
      toast.error(error.message || 'Failed to generate recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-cyan text-white';
      case 'intermediate':
        return 'bg-purple text-white';
      case 'advanced':
        return 'bg-gradient-to-r from-cyan to-purple text-white';
      default:
        return 'bg-muted';
    }
  };

  const renderRecommendationCard = (rec: Recommendation, index: number, isSaved: boolean = false, savedId?: string) => (
    <Card 
      key={isSaved ? savedId : index} 
      className="border-border bg-card shadow-[var(--shadow-card)] animate-fade-in overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan/10 to-purple/10 p-6 border-b border-border">
        <div className="flex items-start justify-between mb-3">
          <h2 className="text-2xl font-bold text-foreground">{rec.title}</h2>
          <div className="flex items-center gap-2">
            <Badge className={getDifficultyColor(rec.difficulty)}>
              {rec.difficulty}
            </Badge>
            {isSaved && savedId && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteSavedRecommendation(savedId)}
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <p className="text-muted-foreground mb-4">{rec.description}</p>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1 text-cyan">
            <Clock className="h-4 w-4" />
            <span>{rec.duration}</span>
          </div>
          <div className="flex items-center gap-1 text-purple">
            <Dumbbell className="h-4 w-4" />
            <span>{rec.exercises.length} exercises</span>
          </div>
        </div>
      </div>

      <CardContent className="p-6 space-y-6">
        {/* Exercises */}
        <div>
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-cyan" />
            Exercise Plan
          </h3>
          <div className="space-y-3">
            {rec.exercises.map((exercise, exIndex) => (
              <div key={exIndex} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan to-purple flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                  {exIndex + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2 mb-1">
                    <p className="font-medium text-foreground">{exercise.name}</p>
                    <span className="text-xs text-cyan">
                      {exercise.sets} × {exercise.reps}
                    </span>
                  </div>
                  {exercise.notes && (
                    <p className="text-xs text-muted-foreground">{exercise.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Benefits */}
        <div>
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple" />
            Key Benefits
          </h3>
          <ul className="space-y-2">
            {rec.benefits.map((benefit, bIndex) => (
              <li key={bIndex} className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-cyan flex-shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex gap-2">
          {isSaved && savedId ? (
            <Button
              onClick={() => openCompletionDialog({ id: savedId, saved_at: '', ...rec } as SavedRecommendation)}
              className="flex-1 bg-gradient-to-r from-cyan to-purple hover:opacity-90"
            >
              <PlayCircle className="h-4 w-4 mr-2" />
              Mark as Completed
            </Button>
          ) : (
            <Button
              onClick={() => saveRecommendation(rec, index)}
              disabled={savingId === `new-${index}`}
              className="flex-1"
              variant="outline"
            >
              {savingId === `new-${index}` ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Heart className="h-4 w-4 mr-2" />
              )}
              Save to Favorites
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Sparkles className="h-8 w-8 text-cyan mr-3" />
            <h1 className="text-3xl font-bold text-foreground">AI Workout Recommendations</h1>
          </div>
          <Button
            onClick={generateRecommendations}
            disabled={isLoading}
            className="bg-gradient-to-r from-cyan to-purple hover:opacity-90"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate New Plans
              </>
            )}
          </Button>
        </div>

        {/* Description Card */}
        <Card className="border-border bg-card shadow-[var(--shadow-card)] mb-8">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan to-purple flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Personalized AI-Powered Plans</h3>
                <p className="text-muted-foreground text-sm">
                  Get custom workout recommendations based on your fitness level, goals, and workout history. 
                  Our AI analyzes your progress and creates progressive plans tailored just for you. Save favorites and provide feedback to improve future suggestions!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for New vs Saved */}
        <Tabs defaultValue="new" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="new">New Recommendations</TabsTrigger>
            <TabsTrigger value="saved">
              Saved Favorites ({savedRecommendations.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="new">
            {recommendations.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {recommendations.map((rec, index) => renderRecommendationCard(rec, index, false))}
              </div>
            ) : (
              <Card className="border-border bg-card shadow-[var(--shadow-card)] p-12">
                <div className="text-center">
                  <Sparkles className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No Recommendations Yet
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Click "Generate New Plans" to get AI-powered workout recommendations tailored to your fitness journey.
                  </p>
                  <Button
                    onClick={generateRecommendations}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-cyan to-purple hover:opacity-90"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Get Started
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="saved">
            {savedRecommendations.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {savedRecommendations.map((rec) => renderRecommendationCard(rec, 0, true, rec.id))}
              </div>
            ) : (
              <Card className="border-border bg-card shadow-[var(--shadow-card)] p-12">
                <div className="text-center">
                  <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No Saved Workouts
                  </h3>
                  <p className="text-muted-foreground">
                    Save your favorite AI-generated workouts to quickly access them later!
                  </p>
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Completion Feedback Dialog */}
        <Dialog open={completionDialog.open} onOpenChange={(open) => setCompletionDialog({ open, recommendation: null })}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Mark Workout as Completed</DialogTitle>
              <DialogDescription>
                Provide feedback to help us improve your future recommendations
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Rating */}
              <div className="space-y-2">
                <Label>How was this workout?</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Exercise Completion Checklist */}
              {completionDialog.recommendation && (
                <div className="space-y-2">
                  <Label>Which exercises did you complete?</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {completionDialog.recommendation.exercises.map((exercise, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`exercise-${idx}`}
                          checked={completedExercises.has(exercise.name)}
                          onChange={() => toggleExerciseCompletion(exercise.name)}
                          className="h-4 w-4 rounded border-border"
                        />
                        <label
                          htmlFor={`exercise-${idx}`}
                          className="text-sm text-foreground cursor-pointer flex-1"
                        >
                          {exercise.name} ({exercise.sets} × {exercise.reps})
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Feedback Notes */}
              <div className="space-y-2">
                <Label htmlFor="feedback">Additional Feedback (Optional)</Label>
                <Textarea
                  id="feedback"
                  placeholder="What did you like or dislike? What would you change?"
                  value={feedbackNotes}
                  onChange={(e) => setFeedbackNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setCompletionDialog({ open: false, recommendation: null })}>
                Cancel
              </Button>
              <Button
                onClick={submitCompletion}
                className="bg-gradient-to-r from-cyan to-purple hover:opacity-90"
                disabled={rating === 0}
              >
                Submit Feedback
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Recommendations;