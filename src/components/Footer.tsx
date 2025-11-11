import { Activity, Github, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-navy-lighter py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan to-purple flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan to-purple bg-clip-text text-transparent">
                CoreSync
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Making fitness addictive through gamification and smart tracking.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-cyan transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-cyan transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-cyan transition-colors">Roadmap</a></li>
              <li><a href="#" className="hover:text-cyan transition-colors">Updates</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-cyan transition-colors">About</a></li>
              <li><a href="#" className="hover:text-cyan transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-cyan transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-cyan transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-cyan transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-cyan transition-colors">Terms</a></li>
              <li><a href="#" className="hover:text-cyan transition-colors">Security</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-navy-lighter">
          <p className="text-sm text-muted-foreground">
            © 2025 CoreSync. Built with passion by Adrian Ricketts, Abby Wambach, Anthony Zhou
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="w-9 h-9 rounded-full bg-navy-lighter flex items-center justify-center hover:bg-cyan/20 hover:text-cyan transition-all">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#" className="w-9 h-9 rounded-full bg-navy-lighter flex items-center justify-center hover:bg-cyan/20 hover:text-cyan transition-all">
              <Github className="w-4 h-4" />
            </a>
            <a href="#" className="w-9 h-9 rounded-full bg-navy-lighter flex items-center justify-center hover:bg-cyan/20 hover:text-cyan transition-all">
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
