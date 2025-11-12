import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dumbbell, Target, Trophy, TrendingUp, Users, Zap, Settings } from 'lucide-react';
import Navbar from '@/components/Navbar';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const quickActions = [
    { icon: Dumbbell, label: 'Log Workout', color: 'cyan', onClick: () => navigate('/workout/log') },
    { icon: Target, label: 'My Goals', color: 'purple', onClick: () => navigate('/goals') },
    { icon: Trophy, label: 'Achievements', color: 'pink', onClick: () => navigate('/achievements') },
    { icon: TrendingUp, label: 'Analytics', color: 'cyan', onClick: () => navigate('/analytics') },
    { icon: Users, label: 'Leaderboard', color: 'purple', onClick: () => navigate('/leaderboard') },
    { icon: Zap, label: 'Recommendations', color: 'pink', onClick: () => navigate('/recommendations') },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12 max-w-7xl">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-muted-foreground">
            Ready to crush your fitness goals today?
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-card border-cyan/30">
            <div className="text-4xl mb-2">💪</div>
            <p className="text-muted-foreground text-sm mb-1">Workouts This Week</p>
            <p className="text-3xl font-bold text-foreground">0</p>
          </Card>
          <Card className="p-6 bg-card border-purple/30">
            <div className="text-4xl mb-2">🔥</div>
            <p className="text-muted-foreground text-sm mb-1">Current Streak</p>
            <p className="text-3xl font-bold text-foreground">0 days</p>
          </Card>
          <Card className="p-6 bg-card border-pink/30">
            <div className="text-4xl mb-2">🎯</div>
            <p className="text-muted-foreground text-sm mb-1">Active Goals</p>
            <p className="text-3xl font-bold text-foreground">0</p>
          </Card>
          <Card className="p-6 bg-card border-cyan/30">
            <div className="text-4xl mb-2">🏆</div>
            <p className="text-muted-foreground text-sm mb-1">Total Workouts</p>
            <p className="text-3xl font-bold text-foreground">0</p>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-foreground">Quick Actions</h2>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/settings')}
              className="gap-2"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickActions.map((action, index) => (
              <Card
                key={index}
                className="p-6 cursor-pointer transition-all hover:scale-105 border-2 hover:shadow-lg"
                onClick={action.onClick}
              >
                <action.icon className={`w-8 h-8 mb-3 mx-auto text-${action.color}`} />
                <p className="text-foreground text-sm font-medium text-center">{action.label}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Coming Soon Sections */}
        <div className="space-y-6">
          <Card className="p-8 bg-card border-purple/30">
            <h3 className="text-xl font-semibold text-foreground mb-2">Active Goals</h3>
            <p className="text-muted-foreground">Your active goals will appear here once you create them.</p>
          </Card>
          
          <Card className="p-8 bg-card border-cyan/30">
            <h3 className="text-xl font-semibold text-foreground mb-2">Recent Workouts</h3>
            <p className="text-muted-foreground">Your recent workout history will be displayed here.</p>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
