"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { Eye, EyeOff, ArrowRight, CheckCircle } from "lucide-react";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gender, setGender] = useState("man");

  const { user, isLoading, login, register } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/recommend");
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    if (isLogin) {
      const result = await login(email, password);
      if (result.success) {
        router.push("/recommend");
      } else {
        setError("No account found with these credentials. Please check your email and password.");
      }
    } else {
      const result = await register(email, password, gender);
      if (result.success) {
        setSuccess("Account created successfully! Please sign in with your new account.");
        setIsLogin(true);
        setEmail("");
        setPassword("");
        setName("");
      } else {
        setError(result.error || "Registration failed. Please try again.");
      }
    }

    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen bg-background flex">
      {/* left side - editorial image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center animate-ken-burns transition-all duration-1000"
          style={{
            backgroundImage: "url('https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')",
          }}
        />
        <div className="absolute inset-0 bg-background/80backdrop-blur-[2px]" />

        <div className="relative z-10 flex flex-col justify-between h-full p-16">
          <div className="animate-in fade-in slide-in-from-top-8 duration-1000">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-px bg-accent shadow-[0_0_10px_rgba(var(--accent),0.5)]" />
              <span className="text-[10px] uppercase tracking-[0.4em] text-accent font-medium">
                AI Styling
              </span>
            </div>
            <h1 className="font-serif text-4xl text-foreground tracking-tight">
              Smart<span className="italic">Outfits</span>
            </h1>
          </div>

          <div className="max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <h2 className="font-serif text-6xl xl:text-7xl leading-[1.05] text-foreground tracking-tight text-balance mb-8">
              Elevate your
              <br />
              <span className="italic">personal style</span>
            </h2>
            <div className="w-20 h-0.5 bg-accent mb-8" />
            <p className="text-muted-foreground leading-relaxed max-w-md text-lg font-light tracking-wide">
              Discover perfect outfit combinations powered by artificial intelligence.
              Upload your photo and receive curated recommendations tailored to your aesthetic.
            </p>
          </div>
        </div>
      </div>

      {/* right side - form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 bg-background relative overflow-hidden">
        {/* background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

        <div className="w-full max-w-sm space-y-12 relative z-10 animate-in fade-in slide-in-from-right-12 duration-1000">
          {/* mobile logo */}
          <div className="lg:hidden text-center mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(var(--accent),0.5)]" />
              <span className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
                AI Styling
              </span>
            </div>
            <h1 className="font-serif text-3xl text-foreground tracking-tight">
              Smart<span className="italic">Outfits</span>
            </h1>
          </div>

          {/* header */}
          <div className="space-y-4">
            <h2 className="font-serif text-4xl text-foreground tracking-tight">
              {isLogin ? "Welcome back" : "Create account"}
            </h2>
            <p className="text-sm text-muted-foreground tracking-[0.1em] font-light">
              {isLogin
                ? "Sign in to continue your style journey"
                : "Begin your personalized fashion experience"}
            </p>
          </div>

          {/* error */}
          {error && (
            <div className="p-5 border border-destructive/30 bg-destructive/5 text-destructive text-xs uppercase tracking-widest animate-in fade-in zoom-in-95 duration-500">
              {error}
            </div>
          )}

          {/* success */}
          {success && (
            <div className="p-5 border border-accent/30 bg-accent/5 text-accent text-xs uppercase tracking-widest flex items-center gap-4 animate-in fade-in zoom-in-95 duration-500 font-medium">
              <CheckCircle className="w-4 h-4 shrink-0" />
              {success}
            </div>
          )}

          {/* form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {!isLogin && (
              <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-700 stagger-1">
                <label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-medium">
                  Style Profile
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setGender("man")}
                    className={`flex-1 py-4 border transition-all duration-500 text-[10px] uppercase tracking-[0.2em] font-bold ${gender === "man"
                      ? "bg-foreground text-background border-foreground shadow-[0_10px_20px_rgba(0,0,0,0.2)]"
                      : "bg-transparent text-muted-foreground border-border/50 hover:border-accent"
                      }`}
                  >
                    Man
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender("woman")}
                    className={`flex-1 py-4 border transition-all duration-500 text-[10px] uppercase tracking-[0.2em] font-bold ${gender === "woman"
                      ? "bg-foreground text-background border-foreground shadow-[0_10px_20px_rgba(0,0,0,0.2)]"
                      : "bg-transparent text-muted-foreground border-border/50 hover:border-accent"
                      }`}
                  >
                    Woman
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-700 stagger-2">
              <label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-medium">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-5 py-4 bg-muted/30 border border-border/50 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-accent focus:bg-muted/50 transition-all duration-500 text-sm tracking-wide"
                required
              />
            </div>

            <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-700 stagger-3">
              <label className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-medium">
                Password
              </label>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-5 py-4 bg-muted/30 border border-border/50 text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-accent focus:bg-muted/50 transition-all duration-500 text-sm pr-14 tracking-widest"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-accent transition-colors duration-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="text-right animate-in fade-in slide-in-from-right-4 duration-700 stagger-4">
                <button type="button" className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-accent transition-all duration-500 font-medium">
                  Forgot password?
                </button>
              </div>
            )}

            <div className="pt-4 animate-in fade-in slide-in-from-right-4 duration-700 stagger-5">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-5 bg-foreground text-background text-[10px] uppercase tracking-[0.4em] font-bold flex items-center justify-center gap-4 hover:bg-foreground/90 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
              >
                {/* shimmer */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />

                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="relative z-10">{isLogin ? "Sign In" : "Create Account"}</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-2 relative z-10" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* toggle */}
          <div className="text-center pt-8 border-t border-border/20 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
            <p className="text-xs text-muted-foreground tracking-widest font-light">
              {isLogin ? "NEW TO SMARTOUTFITS?" : "ALREADY HAVE AN ACCOUNT?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                  setSuccess("");
                }}
                className="text-foreground hover:text-accent transition-all duration-500 font-bold ml-2 underline underline-offset-4 decoration-accent/30 hover:decoration-accent"
              >
                {isLogin ? "CREATE ACCOUNT" : "SIGN IN"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}