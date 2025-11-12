import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Target, Calendar, Edit, Trash2, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface GoalCardProps {
  goal: {
    id: string;
    title: string;
    description?: string;
    target_value: number;
    current_value: number;
    unit: string;
    deadline: string;
    completed: boolean;
  };
  onEdit: () => void;
  onDelete: () => void;
  onComplete: () => void;
}

export const GoalCard = ({ goal, onEdit, onDelete, onComplete }: GoalCardProps) => {
  const progress = Math.min((goal.current_value / goal.target_value) * 100, 100);
  const daysRemaining = Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysRemaining < 0;
  
  const getProgressColor = () => {
    if (goal.completed) return 'text-cyan';
    if (progress >= 75) return 'text-purple';
    if (progress >= 50) return 'text-cyan';
    return 'text-muted-foreground';
  };

  const getProgressBg = () => {
    if (goal.completed) return 'bg-cyan';
    if (progress >= 75) return 'bg-purple';
    if (progress >= 50) return 'bg-cyan';
    return 'bg-muted';
  };

  return (
    <Card className="border-border bg-card shadow-[var(--shadow-card)] relative overflow-hidden">
      {goal.completed && (
        <div className="absolute top-0 right-0 bg-gradient-to-l from-cyan to-purple text-white px-4 py-1 text-xs font-bold">
          COMPLETED
        </div>
      )}
      
      <CardHeader>
        <CardTitle className="flex items-start justify-between gap-2">
          <span className="flex items-center gap-2">
            <Target className="h-5 w-5 text-cyan" />
            {goal.title}
          </span>
          <div className="flex gap-1">
            {!goal.completed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
        {goal.description && (
          <CardDescription>{goal.description}</CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-center">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-muted"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 56}
                strokeDashoffset={2 * Math.PI * 56 * (1 - progress / 100)}
                className={getProgressColor()}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className={`text-2xl font-bold ${getProgressColor()}`}>
                {Math.round(progress)}%
              </span>
              <span className="text-xs text-muted-foreground">complete</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium text-foreground">
              {goal.current_value} / {goal.target_value} {goal.unit}
            </span>
          </div>
          <Progress value={progress} className={`h-2 ${getProgressBg()}`} />
        </div>

        <div className="flex items-center justify-between text-sm pt-2 border-t border-border">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {isOverdue ? (
              <span className="text-destructive font-medium">Overdue</span>
            ) : (
              <span>{daysRemaining} days remaining</span>
            )}
          </div>
          {!goal.completed && progress >= 100 && (
            <Button
              size="sm"
              onClick={onComplete}
              className="bg-gradient-to-r from-cyan to-purple hover:opacity-90"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Mark Complete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};