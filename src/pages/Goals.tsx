import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Plus, Target } from 'lucide-react';
import { toast } from 'sonner';
import { GoalCard } from '@/components/GoalCard';
import { GoalDialog, GoalFormData } from '@/components/GoalDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Goal {
  id: string;
  title: string;
  description?: string;
  target_value: number;
  current_value: number;
  unit: string;
  deadline: string;
  completed: boolean;
}

const Goals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>();

  const fetchGoals = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error: any) {
      console.error('Error fetching goals:', error);
      toast.error('Failed to load goals');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [user]);

  const handleCreateOrUpdate = async (formData: GoalFormData) => {
    if (!user) return;

    try {
      if (editingGoal) {
        // Update existing goal
        const { error } = await supabase
          .from('goals')
          .update({
            title: formData.title,
            description: formData.description || null,
            target_value: formData.target_value,
            current_value: formData.current_value,
            unit: formData.unit,
            deadline: formData.deadline.toISOString().split('T')[0],
          })
          .eq('id', editingGoal.id);

        if (error) throw error;
        toast.success('Goal updated successfully!');
      } else {
        // Create new goal
        const { error } = await supabase
          .from('goals')
          .insert({
            user_id: user.id,
            title: formData.title,
            description: formData.description || null,
            target_value: formData.target_value,
            current_value: formData.current_value,
            unit: formData.unit,
            deadline: formData.deadline.toISOString().split('T')[0],
          });

        if (error) throw error;
        toast.success('Goal created successfully!');
      }

      fetchGoals();
      setEditingGoal(undefined);
    } catch (error: any) {
      console.error('Error saving goal:', error);
      toast.error(error.message || 'Failed to save goal');
      throw error;
    }
  };

  const handleDelete = async (goalId: string) => {
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;
      toast.success('Goal deleted');
      fetchGoals();
    } catch (error: any) {
      console.error('Error deleting goal:', error);
      toast.error('Failed to delete goal');
    }
  };

  const handleComplete = async (goalId: string) => {
    try {
      const { error } = await supabase
        .from('goals')
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq('id', goalId);

      if (error) throw error;
      toast.success('🎉 Congratulations! Goal completed!');
      fetchGoals();
    } catch (error: any) {
      console.error('Error completing goal:', error);
      toast.error('Failed to mark goal as complete');
    }
  };

  const activeGoals = goals.filter(g => !g.completed);
  const completedGoals = goals.filter(g => g.completed);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground">Loading goals...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Target className="h-8 w-8 text-cyan mr-3" />
            <h1 className="text-3xl font-bold text-foreground">My Goals</h1>
          </div>
          <Button
            onClick={() => {
              setEditingGoal(undefined);
              setDialogOpen(true);
            }}
            className="bg-gradient-to-r from-cyan to-purple hover:opacity-90"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Goal
          </Button>
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="active">
              Active ({activeGoals.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedGoals.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            {activeGoals.length === 0 ? (
              <div className="text-center py-12">
                <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No active goals</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first goal to start tracking your progress
                </p>
                <Button
                  onClick={() => setDialogOpen(true)}
                  className="bg-gradient-to-r from-cyan to-purple hover:opacity-90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Goal
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeGoals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onEdit={() => {
                      setEditingGoal(goal);
                      setDialogOpen(true);
                    }}
                    onDelete={() => handleDelete(goal.id)}
                    onComplete={() => handleComplete(goal.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed">
            {completedGoals.length === 0 ? (
              <div className="text-center py-12">
                <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No completed goals yet</h3>
                <p className="text-muted-foreground">
                  Complete your active goals to see them here
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedGoals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onEdit={() => {}}
                    onDelete={() => handleDelete(goal.id)}
                    onComplete={() => {}}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <GoalDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSave={handleCreateOrUpdate}
          goal={editingGoal}
        />
      </div>
    </div>
  );
};

export default Goals;