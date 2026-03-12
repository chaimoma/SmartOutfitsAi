"use client";

import { useToast } from "@/lib/toastContext";
import { X, CheckCircle, AlertCircle } from "lucide-react";

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-3 px-5 py-4 border backdrop-blur-md animate-in slide-in-from-right-full fade-in duration-300 ${
            toast.type === "success"
              ? "bg-card/95 border-accent/30 text-foreground"
              : "bg-card/95 border-destructive/30 text-foreground"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
          )}
          <span className="text-sm tracking-wide">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-2 p-1 hover:bg-secondary transition-colors rounded"
          >
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      ))}
    </div>
  );
}
