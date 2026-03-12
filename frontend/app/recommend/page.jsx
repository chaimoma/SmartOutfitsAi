"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { useToast } from "@/lib/toastContext";
import { getRecommendation } from "@/lib/api";
import Navigation from "@/components/Navigation";
import { Upload, Camera, Sparkles, X, Loader2, ShoppingBag } from "lucide-react";
import Image from "next/image";

const LoadingText = () => {
  const [index, setIndex] = useState(0);
  const phrases = [
    "Detecting your item...",
    "Analyzing your style...",
    "Finding matches...",
    "Building your outfit..."
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % phrases.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <span className="animate-in fade-in slide-in-from-bottom-2 duration-500 transition-all">
      {phrases[index]}
    </span>
  );
};

import ClothingCard from "@/components/ClothingCard";

export default function RecommendPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef(null);
  const toast = useToast();

  const [uploadedImage, setUploadedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];

    if (file) {
      setSelectedFile(file);

      const reader = new FileReader();

      reader.onload = (e) => {
        setUploadedImage(e.target?.result);
      };

      reader.readAsDataURL(file);

      await analyzeImage(file);
    }
  };

  const analyzeImage = async (file) => {
    setIsAnalyzing(true);

    try {
      const data = await getRecommendation(file);
      setRecommendations(data);
      toast.success("Analysis complete");
    } catch (err) {
      toast.error("Failed to analyze image");
      resetUpload();
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetUpload = () => {
    setUploadedImage(null);
    setSelectedFile(null);
    setRecommendations(null);
    setIsAnalyzing(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-6 lg:p-12 max-w-7xl mx-auto">

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12 lg:mb-16">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-px bg-accent" />
                <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-medium">
                  AI Styling
                </span>
              </div>

              <h1 className="font-serif text-4xl lg:text-5xl font-normal text-foreground tracking-tight leading-tight">
                Your Curated
                <br />
                <span className="italic">Ensemble</span>
              </h1>
            </div>

            {/* style profile indicator */}
            <div className="flex items-center gap-4 px-6 py-3 bg-muted/20 border border-border/50 rounded-full">
              <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-medium">
                Style Profile:
              </span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-accent font-bold">
                {user?.gender === "woman" ? "Woman" : "Man"}
              </span>
            </div>
          </div>

          {/* upload section */}
          {!uploadedImage && !recommendations && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative border border-border/20 bg-card/10 p-20 lg:p-32 flex flex-col items-center justify-center cursor-pointer group transition-all duration-1000 hover:bg-card/30 hover:border-accent/40 animate-in fade-in zoom-in-95 duration-1000"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* decorative corners */}
              <div className="absolute top-0 left-0 w-12 h-12 border-t border-l border-accent/20 group-hover:border-accent group-hover:scale-110 transition-all duration-700 animate-float" />
              <div className="absolute top-0 right-0 w-12 h-12 border-t border-r border-accent/20 group-hover:border-accent group-hover:scale-110 transition-all duration-700 animate-float delay-150" />
              <div className="absolute bottom-0 left-0 w-12 h-12 border-b border-l border-accent/20 group-hover:border-accent group-hover:scale-110 transition-all duration-700 animate-float delay-300" />
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b border-r border-accent/20 group-hover:border-accent group-hover:scale-110 transition-all duration-700 animate-float delay-450" />

              <div className="w-20 h-20 rounded-full border border-border/50 flex items-center justify-center mb-10 group-hover:border-accent group-hover:gold-glow transition-all duration-700 group-hover:scale-110 relative overflow-hidden">
                <Upload className="w-7 h-7 text-muted-foreground group-hover:text-accent transition-all duration-700 relative z-10" />
                <div className="absolute inset-0 bg-accent/5 -translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
              </div>

              <h3 className="font-serif text-3xl text-foreground mb-4 tracking-tight group-hover:tracking-widest transition-all duration-700">
                Upload Your Look
              </h3>

              <p className="text-muted-foreground text-center max-w-lg mb-12 text-sm leading-relaxed tracking-widest font-light">
                Share a photo and our AI will curate the perfect pieces to complete your ensemble
              </p>

              <div className="flex gap-8">
                <button className="px-10 py-4 bg-foreground text-background text-[10px] uppercase tracking-[0.3em] font-bold flex items-center gap-4 hover:bg-foreground/90 transition-all duration-500 relative overflow-hidden group/btn">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-shimmer" />
                  <Upload className="w-4 h-4" />
                  Choose File
                </button>
                <button className="px-10 py-4 border border-border/50 text-foreground text-[10px] uppercase tracking-[0.3em] font-bold flex items-center gap-4 hover:border-accent hover:text-accent transition-all duration-500">
                  <Camera className="w-4 h-4" />
                  Take Photo
                </button>
              </div>
            </div>
          )}

          {/* analyzing state */}
          {isAnalyzing && (
            <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/95 backdrop-blur-md animate-in fade-in duration-700">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] animate-pulse" />
              </div>

              <div className="relative z-10 flex flex-col items-center max-w-md w-full px-6">
                {uploadedImage && (
                  <div className="relative w-48 h-64 mb-16 group">
                    <div className="absolute -inset-6 border border-accent/20 animate-pulse" />
                    <div className="absolute inset-0 border border-accent/40 shadow-[0_0_30px_rgba(var(--accent),0.2)]" />
                    <div className="absolute inset-2 overflow-hidden bg-muted/20">
                      <Image
                        src={uploadedImage}
                        alt="Analyzing look"
                        fill
                        className="object-cover opacity-80"
                      />
                    </div>
                    {/* scanning line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-accent/60 shadow-[0_0_20px_rgba(var(--accent),0.8)] animate-[scan_3s_ease-in-out_infinite]" />
                  </div>
                )}

                <div className="text-center space-y-8">
                  <div className="relative w-20 h-20 mx-auto">
                    <div className="absolute inset-0 border border-accent/20 rounded-full animate-[ping_3s_infinite]" />
                    <div className="absolute inset-0 border-2 border-t-accent rounded-full animate-spin" />
                    <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-accent animate-pulse" />
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-serif text-3xl text-foreground tracking-tight h-10">
                      <LoadingText />
                    </h3>
                    <p className="text-accent text-[10px] uppercase tracking-[0.4em] font-bold opacity-70">
                      Curating your style profile
                    </p>
                  </div>
                </div>
              </div>

              <style jsx global>{`
                @keyframes scan {
                  0%, 100% { top: 0%; opacity: 0; }
                  5%, 95% { opacity: 1; }
                  50% { top: 100%; }
                }
              `}</style>
            </div>
          )}

          {/* recommendations */}
          {recommendations && (
            <div className="space-y-24">
              {/* analysis summary */}
              <div className="flex items-center gap-12 mb-20 pb-12 border-b border-border/10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <div className="relative w-32 h-44 flex-shrink-0 group">
                  <div className="absolute -inset-4 border border-accent/10 group-hover:border-accent/30 transition-colors duration-700" />
                  <div className="absolute inset-0 border border-accent/40" />
                  <div className="absolute inset-2 overflow-hidden">
                    <Image
                      src={uploadedImage}
                      alt="Your look"
                      fill
                      className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_10px_rgba(var(--accent),0.6)]" />
                    <span className="text-[10px] uppercase tracking-[0.4em] text-accent font-bold">
                      Style Analysis Complete
                    </span>
                  </div>

                  {recommendations.detected && (
                    <h2 className="font-serif text-3xl text-foreground mb-2">
                      Detected: <span className="italic">{recommendations.detected.join(", ")}</span>
                    </h2>
                  )}

                  <p className="text-muted-foreground text-sm tracking-widest font-light">
                    We've curated these pieces to enhance your aesthetic
                  </p>
                </div>

                <button
                  onClick={resetUpload}
                  className="p-4 border border-border/50 hover:border-accent hover:text-accent transition-all duration-500 hover:rotate-90"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* from your wardrobe */}
              {recommendations.from_wardrobe && recommendations.from_wardrobe.length > 0 && (
                <section className="animate-in fade-in slide-in-from-bottom-8 duration-1000 stagger-2">
                  <div className="flex items-center gap-6 mb-12">
                    <h2 className="font-serif text-3xl text-foreground tracking-tight">
                      From Your <span className="italic">Wardrobe</span>
                    </h2>
                    <div className="flex-1 h-px bg-gradient-to-r from-border/50 to-transparent" />
                    <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-medium">
                      {recommendations.from_wardrobe.length} Curated Matches
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
                    {recommendations.from_wardrobe.map((item, index) => (
                      <div
                        key={index}
                        className={`animate-in fade-in slide-in-from-bottom-6 duration-1000 stagger-${(index % 5) + 1}`}
                      >
                        <ClothingCard
                          item={{
                            id: index,
                            category: item.item,
                            image: item.image_url,
                            matchScore: 98 - (index * 2)
                          }}
                          showMatchScore={true}
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* from internet */}
              {recommendations.from_internet && recommendations.from_internet.length > 0 && (
                <section className="animate-in fade-in slide-in-from-bottom-8 duration-1000 stagger-3">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="font-serif text-3xl text-foreground">
                      AI Stylist <span className="italic">Recommendations</span>
                    </h3>
                    <div className="flex items-center gap-2 px-3 py-1 bg-accent/10 border border-accent/20 rounded-full">
                      <div className="w-1 h-1 rounded-full bg-accent animate-pulse" />
                      <span className="text-[10px] uppercase tracking-[0.2em] text-accent font-medium">Market Discovery</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
                    {recommendations.from_internet.map((item, index) => (
                      <div
                        key={index}
                        className={`animate-in fade-in slide-in-from-bottom-6 duration-1000 stagger-${(index % 5) + 1}`}
                      >
                        <div className="group bg-card/10 border border-border/10 overflow-hidden hover:border-accent/30 transition-all duration-700 ease-out hover:gold-glow-hover">
                          <div className="relative aspect-[3/4] overflow-hidden bg-muted/20">
                            <Image
                              src={item.image_url}
                              alt={item.item}
                              fill
                              className="object-cover transition-all duration-1000 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60" />
                            <div className="absolute inset-0 group-hover:bg-white/5 transition-colors duration-700" />
                            {/* shimmer */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none">
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer" />
                            </div>
                          </div>

                          <div className="p-5">
                            <div className="text-[9px] uppercase tracking-[0.3em] text-accent mb-2 font-bold">
                              {item.source}
                            </div>
                            <h3 className="font-serif text-base text-foreground leading-tight tracking-tight mb-4 group-hover:tracking-wider transition-all duration-500">
                              {item.item}
                            </h3>
                            <a
                              href={`https://www.google.com/search?q=${encodeURIComponent(item.item + " buy online fashion")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-accent transition-colors duration-300 group/link"
                            >
                              <ShoppingBag className="w-3.5 h-3.5 transition-transform group-hover/link:-translate-y-0.5" />
                              <span>Shop this item</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <div className="flex justify-center pt-16 border-t border-border/10">
                <button
                  onClick={resetUpload}
                  className="px-16 py-5 border border-border/50 text-foreground text-[10px] uppercase tracking-[0.4em] font-bold hover:border-accent hover:text-accent transition-all duration-700 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-accent/5 -translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
                  <span className="relative z-10">New Style Analysis</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}