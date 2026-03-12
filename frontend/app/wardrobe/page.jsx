"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { useToast } from "@/lib/toastContext";
import { getWardrobe, addWardrobeItem, deleteWardrobeItem } from "@/lib/api";
import Navigation from "@/components/Navigation";
import ClothingCard from "@/components/ClothingCard";
import { Plus, X, Upload, Shirt, Loader2 } from "lucide-react";
import Image from "next/image";

export default function WardrobePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef(null);
  const toast = useToast();

  const [wardrobe, setWardrobe] = useState([]);
  const [isLoadingWardrobe, setIsLoadingWardrobe] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);
  const [activeCategory, setActiveCategory] = useState("ALL");

  useEffect(() => {
    if (!isLoading && !user) router.push("/");
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) fetchWardrobe();
  }, [user]);

  const fetchWardrobe = async () => {
    try {
      setIsLoadingWardrobe(true);
      const data = await getWardrobe();
      setWardrobe(data);
    } catch (err) {
      toast.error("Failed to load wardrobe");
    } finally {
      setIsLoadingWardrobe(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setIsDeleting(id);
      await deleteWardrobeItem(id);
      setWardrobe(wardrobe.filter((item) => item.id !== id));
      toast.success("Item removed from wardrobe");
    } catch (err) {
      toast.error("Failed to delete item");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAddItem = async () => {
    if (!selectedFile) return;
    try {
      setIsUploading(true);
      await addWardrobeItem(selectedFile);
      setShowAddModal(false);
      setSelectedFile(null);
      setImagePreview(null);
      toast.success("Item added to wardrobe");
      // refetch to get fresh data
      await fetchWardrobe();
    } catch (err) {
      toast.error("Failed to add item");
    } finally {
      setIsUploading(false);
    }
  };

  const categories = ["ALL", "TOPS", "BOTTOMS", "OUTERWEAR", "ACCESSORIES"];

  const seen = new Set();
  const uniqueWardrobe = wardrobe.filter((item) => {
    if (seen.has(item.image_url)) return false;
    seen.add(item.image_url);
    return true;
  });

  const filteredWardrobe =
    activeCategory === "ALL"
      ? uniqueWardrobe
      : uniqueWardrobe.filter((item) => item.category?.toUpperCase() === activeCategory);

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
          {/* header */}
          <header className="mb-12 lg:mb-16">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-px bg-accent" />
                  <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-medium">
                    Collection
                  </span>
                </div>
                <h1 className="font-serif text-4xl lg:text-5xl font-normal text-foreground tracking-tight leading-tight">
                  My
                  <br />
                  <span className="italic">Wardrobe</span>
                </h1>
                <p className="text-muted-foreground text-sm mt-4 tracking-wide">
                  {uniqueWardrobe.length} pieces in your collection
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-8 py-3.5 bg-foreground text-background text-xs uppercase tracking-[0.2em] font-medium flex items-center gap-3 hover:bg-foreground/90 transition-all duration-300 self-start lg:self-auto"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>
          </header>

          {/* category filter */}
          <div className="flex gap-4 mb-14 overflow-x-auto pb-4 -mx-6 px-6 lg:mx-0 lg:px-0 scrollbar-hide">
            {categories.map((category, index) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-8 py-3 text-[10px] uppercase tracking-[0.3em] font-bold transition-all duration-700 relative overflow-hidden animate-in fade-in slide-in-from-top-4 stagger-${index + 1} ${activeCategory === category
                  ? "text-accent bg-accent/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
              >
                {/* active line */}
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-accent transition-transform duration-700 ${activeCategory === category ? "scale-x-100" : "scale-x-0"}`} />
                {/* glow effect */}
                {activeCategory === category && (
                  <div className="absolute inset-0 gold-glow opacity-20 pointer-events-none" />
                )}
                {category}
              </button>
            ))}
          </div>

          {/* loading state */}
          {isLoadingWardrobe ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="w-6 h-6 text-accent animate-spin mb-4" />
              <p className="text-muted-foreground text-sm tracking-wide">Loading wardrobe...</p>
            </div>
          ) : filteredWardrobe.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
              {filteredWardrobe.map((item, index) => (
                <div key={item.id} className={`animate-in fade-in slide-in-from-bottom-8 duration-1000 stagger-${(index % 5) + 1}`}>
                  <ClothingCard
                    item={{
                      id: item.id,
                      category: item.category,
                      image: item.image_url,
                    }}
                    onDelete={handleDelete}
                    isDeleting={isDeleting === item.id}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center border border-border/30">
              <Shirt className="w-8 h-8 text-muted-foreground mb-4" />
              <h3 className="font-serif text-xl text-foreground mb-2">
                {activeCategory === "ALL" ? "Empty wardrobe" : `No ${activeCategory.toLowerCase()}`}
              </h3>
              <p className="text-muted-foreground text-sm max-w-sm mb-6 tracking-wide">
                {activeCategory === "ALL"
                  ? "Start building your collection to receive personalized recommendations"
                  : `Add ${activeCategory.toLowerCase()} to your wardrobe`}
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-8 py-3 bg-accent text-accent-foreground text-xs uppercase tracking-[0.2em] font-medium flex items-center gap-3 hover:bg-accent/90 transition-all duration-300"
              >
                <Plus className="w-4 h-4" />
                Add First Item
              </button>
            </div>
          )}
        </div>
      </main>

      {/* add item modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-background/90 backdrop-blur-sm"
            onClick={() => !isUploading && setShowAddModal(false)}
          />
          <div className="relative bg-card border border-border p-8 w-full max-w-md animate-in fade-in zoom-in-95 duration-300">
            {/* decorative corners */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-accent/40" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-accent/40" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-accent/40" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-accent/40" />

            <div className="flex items-center justify-between mb-8">
              <h2 className="font-serif text-2xl text-foreground tracking-tight">
                Add New Piece
              </h2>
              <button
                onClick={() => !isUploading && setShowAddModal(false)}
                className="p-2 hover:bg-secondary transition-colors"
                disabled={isUploading}
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-6">
              {/* image upload */}
              <div>
                <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3 block">
                  Photo
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {imagePreview ? (
                  <div className="relative aspect-[3/4] w-full overflow-hidden border border-border">
                    <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                    <button
                      onClick={() => { setImagePreview(null); setSelectedFile(null); }}
                      className="absolute top-3 right-3 p-2 bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
                      disabled={isUploading}
                    >
                      <X className="w-4 h-4 text-foreground" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full aspect-[3/4] border border-dashed border-border hover:border-accent/50 transition-all duration-300 flex flex-col items-center justify-center gap-4"
                  >
                    <Upload className="w-6 h-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground tracking-wide">Click to upload</span>
                  </button>
                )}
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Our AI will automatically detect and categorize your item
              </p>

              {/* submit */}
              <button
                onClick={handleAddItem}
                disabled={!selectedFile || isUploading}
                className="w-full py-4 bg-foreground text-background text-xs uppercase tracking-[0.2em] font-medium hover:bg-foreground/90 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Add to Collection"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}