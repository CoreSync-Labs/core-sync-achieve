import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Lock, Calendar } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface AchievementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  achievement: {
    title: string;
    description: string;
    icon: string;
    rarity: 'common' | 'rare' | 'legendary';
    category: string;
    requirement_value: number;
    progress?: number;
    unlocked?: boolean;
    unlocked_at?: string;
  } | null;
}

export const AchievementModal = ({ open, onOpenChange, achievement }: AchievementModalProps) => {
  if (!achievement) return null;

  const IconComponent = (LucideIcons as any)[achievement.icon] || LucideIcons.Trophy;
  const progress = achievement.progress || 0;
  const isUnlocked = achievement.unlocked || false;
  const progressPercentage = Math.min((progress / achievement.requirement_value) * 100, 100);

  const getRarityColor = () => {
    switch (achievement.rarity) {
      case 'legendary':
        return 'from-purple via-cyan to-purple';
      case 'rare':
        return 'from-cyan to-purple';
      case 'common':
      default:
        return 'from-muted to-muted-foreground';
    }
  };

  const getRarityBadgeColor = () => {
    switch (achievement.rarity) {
      case 'legendary':
        return 'bg-gradient-to-r from-purple to-cyan text-white';
      case 'rare':
        return 'bg-purple text-white';
      case 'common':
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getCategoryLabel = () => {
    switch (achievement.category) {
      case 'workout':
        return 'Workout Achievement';
      case 'streak':
        return 'Streak Achievement';
      case 'goal':
        return 'Goal Achievement';
      case 'milestone':
        return 'Milestone Achievement';
      default:
        return 'Achievement';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="sr-only">{achievement.title}</DialogTitle>
          <DialogDescription className="sr-only">{achievement.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Icon and Status */}
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'w-32 h-32 rounded-full flex items-center justify-center mb-4',
                isUnlocked
                  ? `bg-gradient-to-br ${getRarityColor()} animate-scale-in`
                  : 'bg-muted'
              )}
            >
              {isUnlocked ? (
                <IconComponent className="w-16 h-16 text-white" />
              ) : (
                <Lock className="w-16 h-16 text-muted-foreground" />
              )}
            </div>

            <Badge className={cn('mb-2 text-xs font-bold uppercase', getRarityBadgeColor())}>
              {achievement.rarity}
            </Badge>

            <h2 className="text-2xl font-bold text-center text-foreground mb-2">
              {achievement.title}
            </h2>

            <p className="text-center text-muted-foreground mb-2">
              {achievement.description}
            </p>

            <Badge variant="outline" className="text-xs">
              {getCategoryLabel()}
            </Badge>
          </div>

          {/* Progress Section */}
          <div className="space-y-4 border-t border-border pt-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium text-foreground">
                  {progress} / {achievement.requirement_value}
                </span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
              <p className="text-xs text-center text-muted-foreground">
                {isUnlocked ? (
                  'Achievement unlocked! 🎉'
                ) : (
                  `${achievement.requirement_value - progress} more to unlock`
                )}
              </p>
            </div>

            {/* Unlocked Date */}
            {isUnlocked && achievement.unlocked_at && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground border-t border-border pt-4">
                <Calendar className="h-4 w-4" />
                <span>
                  Unlocked on {format(new Date(achievement.unlocked_at), 'PPP')}
                </span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};