"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { Shirt, History, LogOut, Menu, X, Sparkles, User } from "lucide-react";
import { useState } from "react";

export default function Navigation() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/recommend", label: "Recommend", icon: Sparkles },
    { href: "/wardrobe", label: "Wardrobe", icon: Shirt },
    { href: "/history", label: "History", icon: History },
  ];

  const isActive = (href) => pathname === href;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border flex-col z-50 animate-in slide-in-from-left duration-700 ease-out">
        {/* Logo */}
        <div className="p-8 border-b border-sidebar-border">
          <Link href="/recommend" className="block group">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground group-hover:text-accent transition-colors duration-500">
                AI Styling
              </span>
            </div>
            <h1 className="font-serif text-2xl text-sidebar-foreground tracking-tight group-hover:tracking-widest transition-all duration-700">
              Smart<span className="italic">Outfits</span>
            </h1>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6">
          <div className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground mb-4 px-4 opacity-50">
            Menu
          </div>
          <ul className="space-y-1">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <li key={item.href} className={`animate-in fade-in slide-in-from-left duration-700 stagger-${index + 1}`}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-4 px-4 py-3.5 transition-all duration-500 group relative overflow-hidden ${isActive(item.href)
                        ? "text-accent bg-accent/5"
                        : "text-muted-foreground hover:text-sidebar-foreground hover:bg-white/5"
                      }`}
                  >
                    {/* Active indicator with glow */}
                    {isActive(item.href) && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-accent shadow-[0_0_15px_rgba(var(--accent),0.6)]" />
                    )}
                    <Icon className={`w-4 h-4 transition-all duration-500 ${isActive(item.href) ? "scale-110" : "group-hover:translate-x-1 group-hover:text-accent"}`} />
                    <span className="text-sm tracking-wide font-medium">{item.label}</span>

                    {/* Hover effect background shimmer */}
                    {!isActive(item.href) && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/5 to-transparent -translate-x-full group-hover:animate-shimmer" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile & Sign Out */}
        <div className="p-6 border-t border-sidebar-border space-y-4">
          {/* User Info */}
          <div className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 transition-colors duration-500 group">
            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center border border-accent/20 group-hover:border-accent group-hover:gold-glow transition-all duration-500">
              <User className="w-4 h-4 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground truncate group-hover:text-foreground transition-colors">
                {user?.email || "User"}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-4 px-4 py-3 text-muted-foreground hover:text-accent transition-all duration-500 w-full group overflow-hidden relative"
          >
            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-500" />
            <span className="text-sm tracking-wide">Sign Out</span>
            <div className="absolute inset-0 bg-accent/5 -translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-background/90 backdrop-blur-xl border-b border-border/50 z-50">
        <div className="flex items-center justify-between h-full px-5">
          <Link href="/recommend" className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span className="font-serif text-lg text-foreground tracking-tight">
              Smart<span className="italic">Outfits</span>
            </span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 -mr-2"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-foreground" />
            ) : (
              <Menu className="w-5 h-5 text-foreground" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 bg-background z-40 animate-in fade-in slide-in-from-top-2 duration-300">
          <nav className="p-6">
            <div className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground mb-4">
              Menu
            </div>
            <ul className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-4 px-4 py-4 border-b border-border/30 transition-all duration-300 ${isActive(item.href)
                          ? "text-accent"
                          : "text-muted-foreground"
                        }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm tracking-wide">{item.label}</span>
                      {isActive(item.href) && (
                        <div className="ml-auto w-1 h-1 rounded-full bg-accent" />
                      )}
                    </Link>
                  </li>
                );
              })}
              {/* User Info */}
              <li className="mt-6 pt-4 border-t border-border/30">
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-accent" />
                  </div>
                  <p className="text-xs text-muted-foreground truncate flex-1">
                    {user?.email || "User"}
                  </p>
                </div>
              </li>
              <li>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-4 px-4 py-4 text-muted-foreground w-full"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm tracking-wide">Sign Out</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </>
  );
}
