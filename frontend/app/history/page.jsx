"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { useToast } from "@/lib/toastContext";
import { getHistory } from "@/lib/api";
import Navigation from "@/components/Navigation";
import { ChevronDown, Calendar, Loader2 } from "lucide-react";
import Image from "next/image";

const API_BASE = "http://127.0.0.1:8001";

function resolveUrl(url) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${API_BASE}${url}`;
}

export default function HistoryPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [expandedId, setExpandedId] = useState(null);
  const [items, setItems] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) router.push("/");
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const data = await getHistory();

      // remove duplicates by item and date
      const seen = new Set();
      const unique = data.filter((item) => {
        const key = `${item.detected_item}-${item.created_at?.split("T")[0]}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      setItems(unique);
    } catch (err) {
      toast.error("Failed to load history");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
        <div className="p-6 lg:p-12 max-w-5xl mx-auto">
          <header className="mb-12 lg:mb-16">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-px bg-accent" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-medium">
                Archive
              </span>
            </div>
            <h1 className="font-serif text-4xl lg:text-5xl font-normal text-foreground tracking-tight leading-tight">
              Style
              <br />
              <span className="italic">History</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-4 tracking-wide max-w-md">
              A curated collection of your past outfit recommendations
            </p>
          </header>

          {isLoadingHistory ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="w-6 h-6 text-accent animate-spin mb-4" />
              <p className="text-muted-foreground text-sm tracking-wide">Loading history...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-24 border border-border/30">
              <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-sm tracking-wide mb-6">
                Your style history will appear here
              </p>
              <button
                onClick={() => router.push("/recommend")}
                className="px-8 py-3 bg-accent text-accent-foreground text-xs uppercase tracking-[0.2em] font-medium hover:bg-accent/90 transition-all duration-300"
              >
                Get Recommendations
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item, index) => {
                const resolvedUrls = (item.image_urls || []).map(resolveUrl).filter(Boolean);
                const inputUrl = resolveUrl(item.input_image_url);
                return (
                  <div
                    key={item.id}
                    className={`border border-border/20 bg-card/5 overflow-hidden transition-all duration-700 hover:border-accent/40 hover:bg-card/20 animate-in fade-in slide-in-from-left-8 duration-1000 stagger-${(index % 5) + 1}`}
                  >
                    {/* header row */}
                    <div
                      className="flex items-center gap-8 p-6 cursor-pointer group"
                      onClick={() => toggleExpand(item.id)}
                    >
                      {/* input image */}
                      {inputUrl && (
                        <div className="relative w-12 h-16 overflow-hidden border border-accent/20 group-hover:border-accent/40 transition-colors duration-700 shrink-0">
                          <Image src={inputUrl} alt="Your item" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(var(--accent),0.4)]" />
                          <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-medium">
                            {formatDate(item.created_at)}
                          </span>
                        </div>
                        <h3 className="font-serif text-xl text-foreground group-hover:text-accent transition-all duration-500 tracking-tight">
                          {item.detected_item || "Style Analysis"}
                        </h3>
                        <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mt-2 font-light">
                          {item.suggested_items?.length || 0} Curated Suggestions
                        </p>
                      </div>

                      {/* mini thumbnails */}
                      {resolvedUrls.length > 0 && (
                        <div className="hidden md:flex items-center gap-3">
                          {resolvedUrls.slice(0, 4).map((url, i) => (
                            <div key={i} className="relative w-12 h-16 overflow-hidden border border-border/20 grayscale group-hover:grayscale-0 transition-all duration-700">
                              <Image src={url} alt={`Suggestion ${i + 1}`} fill className="object-cover" />
                            </div>
                          ))}
                        </div>
                      )}

                      <div className={`p-2 transition-all duration-500 ${expandedId === item.id ? "rotate-180 text-accent" : "text-muted-foreground group-hover:text-foreground"}`}>
                        <ChevronDown className="w-5 h-5" />
                      </div>
                    </div>

                    {/* expanded content */}
                    <div
                      className={`grid transition-all duration-700 ease-in-out ${expandedId === item.id ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                        }`}
                    >
                      <div className="overflow-hidden border-t border-border/10">
                        <div className="p-8 space-y-10">
                          {item.suggested_items?.length > 0 && (
                            <div className="animate-in fade-in slide-in-from-top-4 duration-700">
                              <h4 className="text-[10px] uppercase tracking-[0.4em] text-accent mb-6 font-bold">
                                AI Stylist Recommendations
                              </h4>
                              <div className="flex flex-wrap gap-3">
                                {item.suggested_items.map((suggestion, i) => (
                                  <span key={i} className="px-5 py-2 bg-accent/5 border border-accent/10 text-accent text-[10px] uppercase tracking-widest font-medium">
                                    {suggestion}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                            {/* your item */}
                            {inputUrl && (
                              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div className="relative aspect-[3/4] overflow-hidden border-2 border-accent/40 group/img">
                                  <Image src={inputUrl} alt="Your item" fill className="object-cover transition-transform duration-1000 group-hover/img:scale-110" />
                                  <div className="absolute inset-x-0 bottom-0 bg-accent/90 py-1.5 text-center">
                                    <span className="text-[9px] uppercase tracking-[0.4em] text-white font-bold">Source</span>
                                  </div>
                                </div>
                              </div>
                            )}
                            {/* suggestions */}
                            {resolvedUrls.map((url, i) => (
                              <div key={i} className={`animate-in fade-in slide-in-from-bottom-4 duration-700 stagger-${(i % 5) + 1}`}>
                                <div className="relative aspect-[3/4] overflow-hidden border border-border/20 group/img hover:border-accent/40 transition-colors duration-500">
                                  <Image
                                    src={url}
                                    alt={`Suggestion ${i + 1}`}
                                    fill
                                    className="object-cover transition-all duration-1000 group-hover/img:scale-110"
                                  />
                                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/img:opacity-100 transition-opacity duration-700 pointer-events-none">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer" />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}