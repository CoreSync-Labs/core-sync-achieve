import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';

interface AchievementBadgeProps {
  achievement: {
    id: string;
    title: string;
    description: string;
    icon: string;
    rarity: 'common' | 'rare' | 'legendary';
    requirement_value: number;
    progress?: number;
    unlocked?: boolean;
  };
  onClick: () => void;
}

export const AchievementBadge = ({ achievement, onClick }: AchievementBadgeProps) => {
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

  return (
    <Card
      onClick={onClick}
      className={cn(
        'cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg border-border bg-card overflow-hidden',
        !isUnlocked && 'opacity-60 hover:opacity-80'
      )}
    >
      <div className="relative p-6">
        {/* Rarity Badge */}
        <div className="absolute top-2 right-2">
          <Badge className={cn('text-xs font-bold uppercase', getRarityBadgeColor())}>
            {achievement.rarity}
          </Badge>
        </div>

        {/* Icon Container */}
        <div className="flex justify-center mb-4">
          <div
            className={cn(
              'w-20 h-20 rounded-full flex items-center justify-center relative',
              isUnlocked
                ? `bg-gradient-to-br ${getRarityColor()} animate-scale-in`
                : 'bg-muted'
            )}
          >
            {isUnlocked ? (
              <IconComponent className="w-10 h-10 text-white" />
            ) : (
              <Lock className="w-10 h-10 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className={cn(
          'text-center font-bold mb-2',
          isUnlocked ? 'text-foreground' : 'text-muted-foreground'
        )}>
          {achievement.title}
        </h3>

        {/* Description */}
        <p className="text-center text-sm text-muted-foreground mb-3 line-clamp-2">
          {achievement.description}
        </p>

        {/* Progress Bar */}
        {!isUnlocked && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{progress} / {achievement.requirement_value}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all duration-500 bg-gradient-to-r',
                  getRarityColor()
                )}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Unlocked State */}
        {isUnlocked && (
          <div className="text-center">
            <Badge className="bg-gradient-to-r from-cyan to-purple text-white">
              Unlocked!
            </Badge>
          </div>
        )}
      </div>
    </Card>
  );
};