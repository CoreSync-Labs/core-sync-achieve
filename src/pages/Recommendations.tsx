import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Sparkles, Dumbbell, Clock, TrendingUp, CheckCircle, Loader2 } from 'lucide-react';
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

const Recommendations = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
                  Our AI analyzes your progress and creates progressive plans tailored just for you.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations Grid */}
        {recommendations.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {recommendations.map((rec, index) => (
              <Card 
                key={index} 
                className="border-border bg-card shadow-[var(--shadow-card)] animate-fade-in overflow-hidden"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-cyan/10 to-purple/10 p-6 border-b border-border">
                  <div className="flex items-start justify-between mb-3">
                    <h2 className="text-2xl font-bold text-foreground">{rec.title}</h2>
                    <Badge className={getDifficultyColor(rec.difficulty)}>
                      {rec.difficulty}
                    </Badge>
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
                </CardContent>
              </Card>
            ))}
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
      </main>
    </div>
  );
};

export default Recommendations;