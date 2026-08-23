"use client";

import {
  forwardRef,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ButtonHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { cn, initials } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export function Card({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("glass rounded-2xl p-5", className)}
      {...props}
    />
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  loading?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      loading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const variants = {
      primary:
        "bg-gradient-to-r from-primary to-accent text-white shadow-glow hover:brightness-110",
      secondary:
        "border border-white/10 bg-white/5 text-gray-200 hover:bg-white/10",
      ghost:
        "text-gray-300 hover:bg-white/5",
      danger:
        "border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "focus-ring inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all",
          "disabled:cursor-not-allowed disabled:opacity-50",
          variants[variant],
          className
        )}
        {...props}
      >
        {loading && <Loader2 size={14} className="animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "focus-ring w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-gray-100",
      "placeholder:text-gray-500 outline-none transition-colors focus:border-primary/60",
      className
    )}
    {...props}
  />
));

Input.displayName = "Input";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "focus-ring w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-gray-100",
      "placeholder:text-gray-500 outline-none transition-colors focus:border-primary/60",
      className
    )}
    {...props}
  />
));

Textarea.displayName = "Textarea";

export function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-gray-300",
        className
      )}
    >
      {children}
    </span>
  );
}

export function Avatar({
  name,
  src,
  size = 40,
  online,
}: {
  name: string;
  src?: string | null;
  size?: number;
  online?: boolean;
}) {
  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          className="h-full w-full rounded-full object-cover"
          style={{ width: size, height: size }}
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent font-medium text-white"
          style={{
            width: size,
            height: size,
            fontSize: size * 0.38,
          }}
        >
          {initials(name)}
        </div>
      )}

      {online !== undefined && (
        <span
          className={cn(
            "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-base",
            online ? "bg-emerald-400" : "bg-gray-500"
          )}
        />
      )}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 py-16 text-center">
      <div className="rounded-full bg-white/5 p-4">
        <Icon size={28} className="text-gray-500" />
      </div>

      <p className="font-display text-lg text-gray-200">
        {title}
      </p>

      {description && (
        <p className="max-w-sm text-sm text-gray-500">
          {description}
        </p>
      )}

      {action}
    </div>
  );
}

export function SkeletonBlock({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "skeleton rounded-xl",
        className
      )}
    />
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 text-center">
      <p className="text-sm text-rose-300">
        {message ?? "Something went wrong. Please try again."}
      </p>

      {onRetry && (
        <Button
          variant="secondary"
          className="mt-3"
          onClick={onRetry}
        >
          Retry
        </Button>
      )}
    </div>
  );
}