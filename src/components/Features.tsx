import { Card } from "@/components/ui/card";
import { Dumbbell, Target, Trophy, TrendingUp, Users, Zap } from "lucide-react";
import workoutScene from "@/assets/workout-scene.jpg";
import achievements from "@/assets/achievements.jpg";

const Features = () => {
  const features = [
    {
      icon: Dumbbell,
      title: "Effortless Workout Logging",
      description: "Log exercises, sets, reps, and duration in seconds. Track cardio, strength, and flexibility workouts all in one place.",
      color: "cyan",
    },
    {
      icon: Target,
      title: "Visual Goal Tracking",
      description: "Set personalized fitness goals and watch your progress come to life with beautiful charts and completion rates.",
      color: "purple",
    },
    {
      icon: Trophy,
      title: "Achievement System",
      description: "Unlock badges for consistency streaks, workout milestones, and personal records. Make fitness feel like a game.",
      color: "pink",
    },
    {
      icon: TrendingUp,
      title: "Progress Analytics",
      description: "Visualize your fitness journey with detailed charts, trends, and insights that keep you motivated.",
      color: "cyan",
    },
    {
      icon: Users,
      title: "Social Leaderboards",
      description: "Compete with friends and the community. See where you rank and push each other to stay consistent.",
      color: "purple",
    },
    {
      icon: Zap,
      title: "Smart Recommendations",
      description: "Get personalized workout suggestions based on your goals, fitness level, and past performance.",
      color: "pink",
    },
  ];

  return (
    <section id="features" className="py-24 px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-navy-light to-background" />
      
      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Section header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-cyan to-purple bg-clip-text text-transparent">
              Stay Active
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            CoreSync combines powerful tracking tools with gamification to make fitness sustainable and fun.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index}
                className="p-6 bg-card/50 backdrop-blur-xl border-navy-lighter hover:border-cyan/30 transition-all duration-300 hover:shadow-cyan/20 hover:shadow-lg hover:scale-105 group"
              >
                <div className={`w-14 h-14 rounded-2xl bg-${feature.color}/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-7 h-7 text-${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </Card>
            );
          })}
        </div>

        {/* Feature showcase with images */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="space-y-6">
            <h3 className="text-3xl md:text-4xl font-bold">
              Track Every Rep,{" "}
              <span className="text-cyan">Every Mile</span>
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Whether you're crushing it at the gym or working out at home, CoreSync makes it easy to log your progress. Our intuitive interface adapts to your workout style.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-cyan/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-2 h-2 rounded-full bg-cyan" />
                </div>
                <span className="text-foreground">Quick exercise entry with smart suggestions</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-cyan/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-2 h-2 rounded-full bg-cyan" />
                </div>
                <span className="text-foreground">Automatic calorie and duration calculations</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-cyan/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-2 h-2 rounded-full bg-cyan" />
                </div>
                <span className="text-foreground">Edit and manage your workout history</span>
              </li>
            </ul>
          </div>
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden border border-purple/20 shadow-2xl">
              <img src={workoutScene} alt="Workout tracking" className="w-full h-auto" />
            </div>
          </div>
        </div>

        {/* Gamification section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 relative">
            <div className="relative rounded-3xl overflow-hidden border border-pink/20 shadow-2xl">
              <img src={achievements} alt="Achievement system" className="w-full h-auto" />
            </div>
          </div>
          <div className="order-1 lg:order-2 space-y-6">
            <h3 className="text-3xl md:text-4xl font-bold">
              Turn Consistency into{" "}
              <span className="text-purple">Achievement</span>
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Our gamification system rewards habit-building just like your favorite games reward progression. Every workout gets you closer to your next milestone.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card/50 backdrop-blur-xl rounded-2xl p-4 border border-cyan/20">
                <p className="text-3xl font-bold text-cyan mb-1">50+</p>
                <p className="text-sm text-muted-foreground">Unique Badges</p>
              </div>
              <div className="bg-card/50 backdrop-blur-xl rounded-2xl p-4 border border-purple/20">
                <p className="text-3xl font-bold text-purple mb-1">Unlimited</p>
                <p className="text-sm text-muted-foreground">Custom Goals</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
