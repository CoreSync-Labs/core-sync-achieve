import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { AchievementBadge } from '@/components/AchievementBadge';
import { AchievementModal } from '@/components/AchievementModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'legendary';
  category: 'workout' | 'streak' | 'goal' | 'milestone';
  requirement_value: number;
  requirement_type: string;
  progress?: number;
  unlocked?: boolean;
  unlocked_at?: string;
}

const Achievements = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchAchievements = async () => {
    if (!user) return;

    try {
      // Fetch all achievements
      const { data: allAchievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .order('requirement_value', { ascending: true });

      if (achievementsError) throw achievementsError;

      // Fetch user's achievement progress
      const { data: userAchievements, error: userAchievementsError } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id);

      if (userAchievementsError) throw userAchievementsError;

      // Merge the data
      const mergedAchievements = allAchievements.map((achievement) => {
        const userProgress = userAchievements?.find(
          (ua) => ua.achievement_id === achievement.id
        );

        return {
          ...achievement,
          progress: userProgress?.progress || 0,
          unlocked: userProgress?.unlocked || false,
          unlocked_at: userProgress?.unlocked_at,
        };
      });

      setAchievements(mergedAchievements);
    } catch (error: any) {
      console.error('Error fetching achievements:', error);
      toast.error('Failed to load achievements');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, [user]);

  const handleAchievementClick = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setModalOpen(true);
  };

  const filterByCategory = (category: string) => {
    if (category === 'all') return achievements;
    return achievements.filter((a) => a.category === category);
  };

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;
  const completionPercentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground">Loading achievements...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Trophy className="h-8 w-8 text-cyan mr-3" />
            <h1 className="text-3xl font-bold text-foreground">Achievements</h1>
          </div>
        </div>

        {/* Stats Card */}
        <Card className="border-border bg-card shadow-[var(--shadow-card)] mb-8">
          <CardHeader>
            <CardTitle>Your Progress</CardTitle>
            <CardDescription>Track your achievement milestones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-cyan">{unlockedCount}</p>
                <p className="text-sm text-muted-foreground">Unlocked</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple">{totalCount - unlockedCount}</p>
                <p className="text-sm text-muted-foreground">Locked</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">{completionPercentage}%</p>
                <p className="text-sm text-muted-foreground">Completion</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievement Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-5 mb-8">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="workout">Workout</TabsTrigger>
            <TabsTrigger value="streak">Streak</TabsTrigger>
            <TabsTrigger value="goal">Goal</TabsTrigger>
            <TabsTrigger value="milestone">Milestone</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {achievements.map((achievement) => (
                <AchievementBadge
                  key={achievement.id}
                  achievement={achievement}
                  onClick={() => handleAchievementClick(achievement)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="workout" className="animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filterByCategory('workout').map((achievement) => (
                <AchievementBadge
                  key={achievement.id}
                  achievement={achievement}
                  onClick={() => handleAchievementClick(achievement)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="streak" className="animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filterByCategory('streak').map((achievement) => (
                <AchievementBadge
                  key={achievement.id}
                  achievement={achievement}
                  onClick={() => handleAchievementClick(achievement)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="goal" className="animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filterByCategory('goal').map((achievement) => (
                <AchievementBadge
                  key={achievement.id}
                  achievement={achievement}
                  onClick={() => handleAchievementClick(achievement)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="milestone" className="animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filterByCategory('milestone').map((achievement) => (
                <AchievementBadge
                  key={achievement.id}
                  achievement={achievement}
                  onClick={() => handleAchievementClick(achievement)}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Achievement Modal */}
        <AchievementModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          achievement={selectedAchievement}
        />
      </div>
    </div>
  );
};

export default Achievements;