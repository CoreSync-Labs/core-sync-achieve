import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Camera, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

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
        '1-week free trial'
      ],
      level: 'beginner',
      highlight: false
    },
    {
      name: 'Fitness Athlete',
      price: 30,
      upfront: 30,
      description: 'For dedicated athletes ready to level up their training',
      features: [
        'All Beginner features',
        'Advanced analytics dashboard',
        'Priority AI recommendations',
        'Portable camera mailed to you',
        'Computer vision workout tracking',
        'Simple setup instructions included',
        'Automatic rep and set logging',
        '1-week free trial'
      ],
      level: 'intermediate',
      highlight: true,
      camera: 'portable'
    },
    {
      name: 'Fitness Boss',
      price: 50,
      upfront: 100,
      description: 'Elite package for serious athletes and professionals',
      features: [
        'All Fitness Athlete features',
        'Premium camera + tripod kit mailed to you',
        'Enhanced computer vision tracking',
        'Professional setup guide included',
        'Multi-angle workout recording',
        'Form analysis (Coming Soon)',
        'Unlimited workout storage',
        'Priority support',
        '1-week free trial'
      ],
      level: 'advanced',
      highlight: false,
      camera: 'premium'
    }
  ];

  const handleGetStarted = (level: string) => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan to-purple bg-clip-text text-transparent">
            Choose Your Fitness Journey
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start with a 1-week free trial on any plan. Upgrade or cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {tiers.map((tier) => (
            <Card 
              key={tier.name}
              className={`relative border-border bg-card shadow-[var(--shadow-card)] transition-all hover:scale-105 ${
                tier.highlight ? 'border-2 border-cyan' : ''
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-cyan to-purple text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl mb-2">{tier.name}</CardTitle>
                <CardDescription className="text-base">{tier.description}</CardDescription>
                
                <div className="mt-6">
                  {tier.upfront > 0 && (
                    <div className="text-sm text-muted-foreground mb-2">
                      ${tier.upfront} upfront equipment fee
                    </div>
                  )}
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-5xl font-bold text-foreground">${tier.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </div>

                {tier.camera && (
                  <div className="mt-4 p-3 bg-gradient-to-r from-cyan/10 to-purple/10 rounded-lg border border-cyan/20">
                    <div className="flex items-center justify-center gap-2 text-cyan font-medium">
                      {tier.camera === 'premium' ? (
                        <>
                          <Video className="w-5 h-5" />
                          <span>Premium Camera + Tripod</span>
                        </>
                      ) : (
                        <>
                          <Camera className="w-5 h-5" />
                          <span>Portable Camera Included</span>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </CardHeader>

              <CardContent>
                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-cyan shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleGetStarted(tier.level)}
                  className={`w-full ${
                    tier.highlight
                      ? 'bg-gradient-to-r from-cyan to-purple hover:opacity-90'
                      : 'bg-card-foreground/10 hover:bg-card-foreground/20 text-foreground'
                  }`}
                >
                  Start Free Trial
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <Card className="max-w-3xl mx-auto border-border bg-card/50 backdrop-blur">
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold mb-4 text-foreground">
                About Our Computer Vision Technology
              </h3>
              <p className="text-muted-foreground mb-4">
                Our Fitness Athlete and Fitness Boss tiers include advanced computer vision tracking technology 
                that automatically logs your workouts. Simply position the camera, and our AI will track your 
                reps, sets, and form in real-time.
              </p>
              <p className="text-sm text-muted-foreground">
                Each camera package includes professional setup instructions to help you configure the system 
                in minutes. Our support team is available to assist you every step of the way.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
