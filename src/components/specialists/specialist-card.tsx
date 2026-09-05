"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import type { Employee, User } from "@/lib/types";
import type { RatingSummary } from "@/lib/selectors";
import { cn, fullName } from "@/lib/utils";
import { SmartImage } from "@/components/ui/smart-image";

export function SpecialistCard({
  employee,
  user,
  rating,
  serviceCount,
  className,
}: {
  employee: Employee;
  user: User;
  rating: RatingSummary;
  serviceCount?: number;
  className?: string;
}) {
  return (
    <Link
      href={`/employees/view?id=${employee.id}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-pop)]",
        className,
      )}
    >
      <div className="aspect-[3/4] overflow-hidden">
        <SmartImage
          src={employee.profileImage}
          alt={fullName(user)}
          fallbackKey={employee.id}
          className="h-full w-full transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </div>
      <div className="p-5">
        <h3 className="text-lg font-medium text-foreground">{fullName(user)}</h3>
        <p className="mt-0.5 text-sm text-accent">{employee.jobTitle}</p>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
          {employee.bio}
        </p>
        <div className="mt-4 flex items-center justify-between text-xs text-muted-strong">
          {rating.average != null ? (
            <span className="inline-flex items-center gap-1">
              <Star size={13} className="fill-accent text-accent" />
              {rating.average.toFixed(1)}
              {rating.count > 0 ? <span className="text-muted">({rating.count})</span> : null}
            </span>
          ) : (
            <span className="text-muted">New to the team</span>
          )}
          {serviceCount ? (
            <span>
              {serviceCount} treatment{serviceCount === 1 ? "" : "s"}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
