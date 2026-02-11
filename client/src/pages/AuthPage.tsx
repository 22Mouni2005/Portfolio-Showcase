import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Redirect } from "wouter";
import { Stethoscope, ShieldCheck } from "lucide-react";
import heroImg from "@assets/hero_medical.jpg"; // Placeholder asset logic

export default function AuthPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Left Panel - Branding */}
      <div className="w-full md:w-1/2 lg:w-5/12 p-8 md:p-12 lg:p-16 flex flex-col justify-between bg-white dark:bg-zinc-900 border-r border-border relative overflow-hidden">
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
           <div className="absolute -top-20 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
           <div className="absolute bottom-0 right-0 w-80 h-80 bg-accent/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/30">
              <Stethoscope className="w-7 h-7" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground">OptoCare</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground leading-tight mb-6">
            Vision Care <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              Reimagined.
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
            A comprehensive clinical management system for modern optometrists. 
            Streamlined patient records, advanced diagnostics, and intuitive workflow.
          </p>
        </div>

        <div className="relative z-10 mt-12">
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 w-fit px-4 py-2 rounded-full border border-border">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>Secure, HIPAA-compliant storage</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Login */}
      <div className="w-full md:w-1/2 lg:w-7/12 flex flex-col items-center justify-center p-8 bg-muted/10">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-muted-foreground">Sign in to access your clinic dashboard</p>
          </div>

          <Button 
            size="lg" 
            className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300"
            onClick={() => window.location.href = "/api/login"}
          >
            Log in with Replit
          </Button>

          <p className="text-xs text-center text-muted-foreground mt-8">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
