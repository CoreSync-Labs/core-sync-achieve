import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Camera, Video, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SubscriptionModal = ({ open, onOpenChange }: SubscriptionModalProps) => {
  const navigate = useNavigate();

  const tiers = [
    {
      name: 'Beginner',
      price: 10,
      upfront: 0,
      description: 'Perfect for fitness enthusiasts starting their journey',
      features: [
        'AI-powered workout recommendations',
        'Basic progress tracking',
        'Goal setting and monitoring',
        'Achievement badges',
        'Community leaderboard access',
      ],
      level: 'beginner',
    },
    {
      name: 'Fitness Athlete',
      price: 30,
      upfront: 30,
      description: 'For dedicated athletes ready to level up',
      features: [
        'All Beginner features',
        'Advanced analytics dashboard',
        'Priority AI recommendations',
        'Portable camera mailed to you',
        'Computer vision workout tracking',
        'Simple setup instructions included',
      ],
      level: 'intermediate',
      camera: 'portable',
      highlight: true,
    },
    {
      name: 'Fitness Boss',
      price: 50,
      upfront: 100,
      description: 'Elite package for serious athletes',
      features: [
        'All Fitness Athlete features',
        'Premium camera + tripod kit',
        'Enhanced computer vision tracking',
        'Professional setup guide',
        'Form analysis (Coming Soon)',
        'Multi-angle workout recording',
        'Priority support',
      ],
      level: 'advanced',
      camera: 'premium',
    },
  ];

  const handleViewDetails = () => {
    onOpenChange(false);
    navigate('/pricing');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Choose Your Plan</DialogTitle>
          <DialogDescription>
            Upgrade to unlock premium features and take your fitness to the next level
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-3 gap-4 mt-4">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={`relative border-border ${
                tier.highlight ? 'border-2 border-cyan' : ''
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-cyan to-purple text-white px-3 py-1 rounded-full text-xs font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <CardContent className="pt-6">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold mb-1">{tier.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{tier.description}</p>
                  
                  {tier.upfront > 0 && (
                    <div className="text-xs text-muted-foreground mb-2">
                      ${tier.upfront} upfront equipment
                    </div>
                  )}
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-bold">${tier.price}</span>
                    <span className="text-muted-foreground text-sm">/month</span>
                  </div>

                  {tier.camera && (
                    <div className="mt-3 p-2 bg-cyan/10 rounded-lg border border-cyan/20">
                      <div className="flex items-center justify-center gap-1 text-cyan text-xs">
                        {tier.camera === 'premium' ? (
                          <>
                            <Video className="w-4 h-4" />
                            <span>Camera + Tripod</span>
                          </>
                        ) : (
                          <>
                            <Camera className="w-4 h-4" />
                            <span>Camera Included</span>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <ul className="space-y-2 mb-4">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-xs">
                      <Check className="w-4 h-4 text-cyan shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${
                    tier.highlight
                      ? 'bg-gradient-to-r from-cyan to-purple'
                      : 'bg-secondary'
                  }`}
                  onClick={handleViewDetails}
                >
                  Start Free Trial
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-4 text-center">
          <Button
            variant="outline"
            onClick={handleViewDetails}
            className="gap-2"
          >
            View Full Details
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
