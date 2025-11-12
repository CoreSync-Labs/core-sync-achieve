import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface GoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (goal: GoalFormData) => Promise<void>;
  goal?: {
    id: string;
    title: string;
    description?: string;
    target_value: number;
    current_value: number;
    unit: string;
    deadline: string;
  };
}

export interface GoalFormData {
  title: string;
  description: string;
  target_value: number;
  current_value: number;
  unit: string;
  deadline: Date;
}

export const GoalDialog = ({ open, onOpenChange, onSave, goal }: GoalDialogProps) => {
  const [formData, setFormData] = useState<GoalFormData>({
    title: '',
    description: '',
    target_value: 0,
    current_value: 0,
    unit: 'workouts',
    deadline: new Date(),
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title,
        description: goal.description || '',
        target_value: goal.target_value,
        current_value: goal.current_value,
        unit: goal.unit,
        deadline: new Date(goal.deadline),
      });
    } else {
      setFormData({
        title: '',
        description: '',
        target_value: 0,
        current_value: 0,
        unit: 'workouts',
        deadline: new Date(),
      });
    }
  }, [goal, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSave(formData);
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{goal ? 'Edit Goal' : 'Create New Goal'}</DialogTitle>
          <DialogDescription>
            {goal ? 'Update your fitness goal' : 'Set a new fitness goal to track your progress'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Goal Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Complete 30 workouts"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add more details about your goal..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current_value">Current Value *</Label>
              <Input
                id="current_value"
                type="number"
                min="0"
                value={formData.current_value || ''}
                onChange={(e) => setFormData({ ...formData, current_value: parseInt(e.target.value) || 0 })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_value">Target Value *</Label>
              <Input
                id="target_value"
                type="number"
                min="1"
                value={formData.target_value || ''}
                onChange={(e) => setFormData({ ...formData, target_value: parseInt(e.target.value) || 0 })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit">Unit *</Label>
            <Input
              id="unit"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              placeholder="e.g., workouts, minutes, pounds"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Deadline *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !formData.deadline && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.deadline ? format(formData.deadline, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.deadline}
                  onSelect={(date) => date && setFormData({ ...formData, deadline: date })}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-cyan to-purple hover:opacity-90"
            >
              {isLoading ? 'Saving...' : goal ? 'Update Goal' : 'Create Goal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};