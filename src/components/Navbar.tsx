import { Button } from "@/components/ui/button";
import { Activity, Dumbbell, Target, Trophy, TrendingUp, Users, Settings, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isDashboardPage = ['/dashboard', '/workout/log', '/goals', '/achievements', '/analytics', '/leaderboard', '/recommendations', '/settings'].includes(location.pathname);

  const dashboardLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: Activity },
    { label: 'Workouts', path: '/workout/log', icon: Dumbbell },
    { label: 'Goals', path: '/goals', icon: Target },
    { label: 'Achievements', path: '/achievements', icon: Trophy },
    { label: 'Analytics', path: '/analytics', icon: TrendingUp },
    { label: 'Leaderboard', path: '/leaderboard', icon: Users },
    { label: 'Recommendations', path: '/recommendations', icon: Sparkles },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4">
      <div className="container mx-auto max-w-7xl">
        <div className="bg-card/80 backdrop-blur-xl rounded-2xl border border-navy-lighter shadow-lg px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div 
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate(user ? '/dashboard' : '/')}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan to-purple flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan to-purple bg-clip-text text-transparent">
                CoreSync
              </span>
            </div>

            {/* Navigation links */}
            {isDashboardPage ? (
              <div className="hidden lg:flex items-center gap-6">
                {dashboardLinks.map((link) => (
                  <button
                    key={link.path}
                    onClick={() => navigate(link.path)}
                    className={cn(
                      "flex items-center gap-2 text-sm font-medium transition-colors",
                      location.pathname === link.path 
                        ? "text-cyan" 
                        : "text-foreground hover:text-cyan"
                    )}
                  >
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-8">
                <a 
                  href="#features" 
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-foreground hover:text-cyan transition-colors cursor-pointer"
                >
                  Features
                </a>
                <button 
                  onClick={() => navigate('/pricing')}
                  className="text-foreground hover:text-cyan transition-colors cursor-pointer"
                >
                  Pricing
                </button>
              </div>
            )}

            {/* CTA buttons */}
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="hidden sm:inline-flex hover:text-purple"
                    onClick={() => navigate('/settings')}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="hover:text-cyan"
                    onClick={() => signOut()}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    className="hidden sm:inline-flex hover:text-cyan"
                    onClick={() => navigate('/auth')}
                  >
                    Sign In
                  </Button>
                  <Button 
                    className="bg-gradient-to-r from-cyan to-purple hover:shadow-cyan text-white rounded-full"
                    onClick={() => navigate('/auth')}
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
