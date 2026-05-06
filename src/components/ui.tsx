import clsx from "clsx";
import Link from "next/link";
import type { ReactNode } from "react";

export function PageTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-8">
      {eyebrow && (
        <p className="mb-2 text-detail font-bold uppercase tracking-wider text-bv-blue-400">
          {eyebrow}
        </p>
      )}
      <h1 className="text-h4 font-bold text-neutral-900 md:text-h3">{title}</h1>
      {description && (
        <p className="mt-3 max-w-3xl text-body-md text-neutral-600">
          {description}
        </p>
      )}
    </div>
  );
}

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "rounded-xl border border-neutral-200 bg-white p-6 shadow-[0_1px_2px_rgba(24,25,27,0.04)]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: "blue" | "green" | "purple" | "yellow";
}) {
  const accentClass = {
    blue: "bg-bv-blue-100 text-bv-blue-400",
    green: "bg-bv-green-100 text-bv-green-700",
    purple: "bg-bv-purple-100 text-bv-purple-700",
    yellow: "bg-bv-yellow-100 text-bv-yellow-700",
  }[accent || "blue"];
  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-detail font-bold uppercase tracking-wide text-neutral-500">
          {label}
        </p>
        <span
          className={clsx(
            "inline-block h-2 w-2 rounded-full",
            accentClass.split(" ")[0]
          )}
        />
      </div>
      <p className="text-h4 font-bold text-neutral-900">{value}</p>
      {hint && <p className="text-detail text-neutral-500">{hint}</p>}
    </Card>
  );
}

export function SectionTitle({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <h2 className="text-h5 font-bold text-neutral-900">{title}</h2>
      {action}
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "blue" | "green" | "yellow" | "red" | "purple";
}) {
  const tones: Record<string, string> = {
    neutral: "bg-neutral-100 text-neutral-700",
    blue: "bg-bv-blue-100 text-bv-blue-400",
    green: "bg-bv-green-100 text-bv-green-700",
    yellow: "bg-bv-yellow-100 text-bv-yellow-700",
    red: "bg-bv-red-100 text-bv-red-400",
    purple: "bg-bv-purple-100 text-bv-purple-700",
  };
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-micro font-bold",
        tones[tone]
      )}
    >
      {children}
    </span>
  );
}

export function BVLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={clsx(
        "text-bv-blue-400 underline-offset-2 hover:underline",
        className
      )}
    >
      {children}
    </Link>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <Card className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-body-md font-bold text-neutral-700">{title}</p>
      {hint && <p className="mt-2 text-detail text-neutral-500">{hint}</p>}
    </Card>
  );
}
