import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Dumbbell, Target, Trophy, TrendingUp, Users, Zap, Settings, Calendar, Clock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { format, parseISO, startOfWeek, isWithinInterval, subDays, startOfDay } from 'date-fns';
import { toast } from 'sonner';

interface Workout {
  id: string;
  workout_date: string;
  total_duration: number;
  total_calories: number;
}

interface Goal {
  id: string;
  title: string;
  current_value: number;
  target_value: number;
  unit: string;
  deadline: string;
  completed: boolean;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const quickActions = [
    { icon: Dumbbell, label: 'Log Workout', color: 'cyan', onClick: () => navigate('/workout/log') },
    { icon: Target, label: 'My Goals', color: 'purple', onClick: () => navigate('/goals') },
    { icon: Trophy, label: 'Achievements', color: 'pink', onClick: () => navigate('/achievements') },
    { icon: TrendingUp, label: 'Analytics', color: 'cyan', onClick: () => navigate('/analytics') },
    { icon: Users, label: 'Leaderboard', color: 'purple', onClick: () => navigate('/leaderboard') },
    { icon: Zap, label: 'Recommendations', color: 'pink', onClick: () => navigate('/recommendations') },
  ];

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      // Fetch workouts
      const { data: workoutData, error: workoutError } = await supabase
        .from('workouts')
        .select('id, workout_date, total_duration, total_calories')
        .eq('user_id', user.id)
        .order('workout_date', { ascending: false })
        .limit(5);

      if (workoutError) throw workoutError;

      // Fetch active goals
      const { data: goalData, error: goalError } = await supabase
        .from('goals')
        .select('id, title, current_value, target_value, unit, deadline, completed')
        .eq('user_id', user.id)
        .eq('completed', false)
        .order('deadline', { ascending: true })
        .limit(3);

      if (goalError) throw goalError;

      setWorkouts(workoutData || []);
      setGoals(goalData || []);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate this week's workout count
  const getWorkoutsThisWeek = () => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
    return workouts.filter(w => 
      isWithinInterval(parseISO(w.workout_date), { start: weekStart, end: new Date() })
    ).length;
  };

  // Calculate current streak
  const calculateStreak = () => {
    if (workouts.length === 0) return 0;

    const sortedDates = workouts
      .map(w => format(parseISO(w.workout_date), 'yyyy-MM-dd'))
      .sort()
      .reverse();

    let streak = 0;
    let currentDate = new Date();

    for (const dateStr of sortedDates) {
      const workoutDate = parseISO(dateStr);
      const daysDiff = Math.floor((currentDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff <= streak + 1) {
        streak++;
        currentDate = workoutDate;
      } else {
        break;
      }
    }

    return streak;
  };

  const workoutsThisWeek = getWorkoutsThisWeek();
  const currentStreak = calculateStreak();
  const activeGoalsCount = goals.length;
  const totalWorkouts = workouts.length;

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-7xl">
        {/* Welcome Header with Gradient */}
        <div className="mb-12 text-center">
          <h1 className="text-6xl md:text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan via-purple to-pink animate-fade-in">
            Welcome back! 👋
          </h1>
          <p className="text-xl text-muted-foreground animate-fade-in">
            Ready to crush your fitness goals today?
          </p>
        </div>

        {/* Quick Stats - Modern Cards with Gradient Borders */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="gradient-border animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="stat-card">
              <div className="relative z-10">
                <div className="text-5xl mb-3 animate-float">💪</div>
                <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Workouts This Week</p>
                <p className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan to-purple animate-count">
                  {workoutsThisWeek}
                </p>
              </div>
            </div>
          </div>
          
          <div className="gradient-border gradient-border-purple animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="stat-card stat-card-purple">
              <div className="relative z-10">
                <div className="text-5xl mb-3 animate-float" style={{ animationDelay: '0.5s' }}>🔥</div>
                <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Current Streak</p>
                <p className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple to-pink animate-count">
                  {currentStreak}
                </p>
                <p className="text-sm text-muted-foreground mt-1">days</p>
              </div>
            </div>
          </div>
          
          <div className="gradient-border animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="stat-card stat-card-pink">
              <div className="relative z-10">
                <div className="text-5xl mb-3 animate-float" style={{ animationDelay: '1s' }}>🎯</div>
                <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Active Goals</p>
                <p className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink to-cyan animate-count">
                  {activeGoalsCount}
                </p>
              </div>
            </div>
          </div>
          
          <div className="gradient-border gradient-border-green animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="stat-card stat-card-green">
              <div className="relative z-10">
                <div className="text-5xl mb-3 animate-float" style={{ animationDelay: '1.5s' }}>🏆</div>
                <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Total Workouts</p>
                <p className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green to-cyan animate-count">
                  {totalWorkouts}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - Creative Layout */}
        <div className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan to-purple">
              Quick Actions
            </h2>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/settings')}
              className="gap-2 hover:bg-white/5"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickActions.map((action, index) => (
              <div
                key={index}
                className="quick-action animate-fade-in"
                style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                onClick={action.onClick}
              >
                <div className="relative z-10">
                  <action.icon className={`w-10 h-10 mb-4 mx-auto text-${action.color} drop-shadow-[0_0_10px_hsl(var(--${action.color})/0.5)]`} />
                  <p className="text-foreground text-sm font-semibold text-center">{action.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Goals Section - Gradient Cards */}
        <div className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple to-pink">
              Active Goals
            </h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/goals')}
              className="border-purple/30 hover:bg-purple/10"
            >
              View All
            </Button>
          </div>
          
          {goals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {goals.map((goal, index) => {
                const progress = Math.min((goal.current_value / goal.target_value) * 100, 100);
                const daysRemaining = Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                
                return (
                  <div
                    key={goal.id}
                    className="gradient-border gradient-border-purple cursor-pointer animate-fade-in hover:scale-105 transition-transform"
                    style={{ animationDelay: `${1.1 + index * 0.1}s` }}
                    onClick={() => navigate('/goals')}
                  >
                    <div className="glass-card p-6">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple to-pink flex items-center justify-center flex-shrink-0 shadow-[var(--shadow-purple)]">
                          <Target className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-foreground mb-1">{goal.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {goal.current_value} / {goal.target_value} {goal.unit}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="relative h-3 bg-muted/20 rounded-full overflow-hidden">
                          <div
                            className="progress-gradient h-full rounded-full transition-all duration-1000"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold text-purple">
                            {Math.round(progress)}% Complete
                          </span>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{daysRemaining > 0 ? `${daysRemaining}d` : 'Overdue'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="gradient-border">
              <div className="glass-card p-12">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-purple to-pink flex items-center justify-center shadow-[var(--shadow-purple)]">
                    <Target className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">No Active Goals</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Create your first goal to start tracking your progress and unlock achievements
                  </p>
                  <Button 
                    onClick={() => navigate('/goals')}
                    className="bg-gradient-to-r from-purple to-pink hover:opacity-90 shadow-[var(--shadow-purple)] text-lg px-8 py-6"
                  >
                    <Target className="mr-2 h-5 w-5" />
                    Create Your First Goal
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Recent Workouts Section - Timeline Style */}
        <div>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan to-green">
              Recent Workouts
            </h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/analytics')}
              className="border-cyan/30 hover:bg-cyan/10"
            >
              View Analytics
            </Button>
          </div>
          
          {workouts.length > 0 ? (
            <div className="space-y-4">
              {workouts.map((workout, index) => (
                <div
                  key={workout.id}
                  className="gradient-border animate-fade-in cursor-pointer"
                  style={{ animationDelay: `${1.4 + index * 0.1}s` }}
                  onClick={() => navigate('/analytics')}
                >
                  <div className="glass-card p-6 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan via-purple to-pink flex items-center justify-center flex-shrink-0 shadow-[var(--shadow-cyan)] animate-float">
                      <Dumbbell className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-lg text-foreground mb-1">
                        {format(parseISO(workout.workout_date), 'EEEE, MMMM d, yyyy')}
                      </p>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-cyan shadow-[0_0_10px_hsl(var(--cyan))]" />
                          <span className="text-sm text-muted-foreground">
                            {workout.total_duration} minutes
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-purple shadow-[0_0_10px_hsl(var(--purple))]" />
                          <span className="text-sm text-muted-foreground">
                            {workout.total_calories} calories
                          </span>
                        </div>
                      </div>
                    </div>
                    <TrendingUp className="h-6 w-6 text-green" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="gradient-border gradient-border-green">
              <div className="glass-card p-12">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-cyan to-green flex items-center justify-center shadow-[var(--shadow-cyan)]">
                    <Dumbbell className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">No Workouts Yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Start logging your workouts to track your progress and build your streak
                  </p>
                  <Button 
                    onClick={() => navigate('/workout/log')}
                    className="bg-gradient-to-r from-cyan to-purple hover:opacity-90 shadow-[var(--shadow-cyan)] text-lg px-8 py-6"
                  >
                    <Dumbbell className="mr-2 h-5 w-5" />
                    Log Your First Workout
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
