"use client";

import { forwardRef, HTMLAttributes, InputHTMLAttributes, ButtonHTMLAttributes, TextareaHTMLAttributes, useRef } from "react";
import { cn, initials } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export function Card({ className, onMouseMove, ...props }: HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const rect = ref.current?.getBoundingClientRect();
        if (rect) {
          ref.current!.style.setProperty("--mx", `${e.clientX - rect.left}px`);
          ref.current!.style.setProperty("--my", `${e.clientY - rect.top}px`);
        }
        onMouseMove?.(e);
      }}
      className={cn(
        "glass spotlight-card rounded-2xl p-5 transition-all duration-300 hover:border-white/20 hover:shadow-glow",
        className
      )}
      {...props}
    />
  );
}

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  loading?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", loading, children, disabled, ...props },
  ref
) {
  const variants: Record<ButtonVariant, string> = {
    primary:
      "relative overflow-hidden bg-gradient-to-r from-primary to-accent text-white shadow-glow hover:shadow-glow-lg hover:-translate-y-0.5",
    secondary: "bg-white/5 border border-white/10 text-gray-200 hover:bg-white/10 hover:border-white/20",
    ghost: "text-gray-300 hover:bg-white/5",
    danger: "bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20",
  };
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "focus-ring group inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0",
        variants[variant],
        className
      )}
      {...props}
    >
      {variant === "primary" && !disabled && !loading && (
        <span className="pointer-events-none absolute inset-0 -z-0 overflow-hidden rounded-xl">
          <span className="absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:animate-sweep group-hover:opacity-100" />
        </span>
      )}
      {loading && <Loader2 size={14} className="animate-spin" />}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
});

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "focus-ring w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-gray-100 placeholder:text-gray-500 outline-none transition-all duration-200 focus:border-primary/60 focus:bg-white/[0.05] focus:shadow-glow",
          className
        )}
        {...props}
      />
    );
  }
);

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(
          "focus-ring w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-gray-100 placeholder:text-gray-500 outline-none transition-all duration-200 focus:border-primary/60 focus:bg-white/[0.05] focus:shadow-glow",
          className
        )}
        {...props}
      />
    );
  }
);

export function Badge({ children, className, glow }: { children: React.ReactNode; className?: string; glow?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-gray-300 transition-transform duration-200",
        glow && "animate-pulseGlow shadow-glow-accent",
        className
      )}
    >
      {children}
    </span>
  );
}

export function Avatar({ name, src, size = 40, online }: { name: string; src?: string | null; size?: number; online?: boolean }) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {online && (
        <span
          className="absolute inset-0 rounded-full bg-emerald-400/40 animate-ping"
          style={{ animationDuration: "2.4s" }}
        />
      )}
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="relative h-full w-full rounded-full object-cover ring-1 ring-white/10" style={{ width: size, height: size }} />
      ) : (
        <div
          className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-white font-medium ring-1 ring-white/10"
          style={{ width: size, height: size, fontSize: size * 0.38 }}
        >
          {initials(name)}
        </div>
      )}
      {online !== undefined && (
        <span
          className={cn(
            "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-base",
            online ? "bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.7)]" : "bg-gray-500"
          )}
        />
      )}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }: { icon: any; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 py-16 text-center animate-riseIn">
      <div className="rounded-full bg-white/5 p-4 shadow-glow">
        <Icon size={28} className="text-gray-400" />
      </div>
      <p className="font-display text-lg text-gray-200">{title}</p>
      {description && <p className="max-w-sm text-sm text-gray-500">{description}</p>}
      {action}
    </div>
  );
}

export function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-xl", className)} />;
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 text-center animate-riseIn">
      <p className="text-sm text-rose-300">{message ?? "Something went wrong. Please try again."}</p>
      {onRetry && (
        <Button variant="secondary" className="mt-3" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}