"use client";

import { useMemo, useState } from "react";
import { Star } from "lucide-react";
import { useStore } from "@/lib/store";
import { fullName } from "@/lib/utils";
import { fmt } from "@/lib/time";
import { PageHeading } from "@/components/layout/dashboard-shell";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch, Segmented, EmptyState } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";

type Filter = "all" | "salon" | "session";

export default function AdminReviewsPage() {
  const { db, setReviewVisibility } = useStore();
  const toast = useToast();
  const [filter, setFilter] = useState<Filter>("all");

  const reviews = useMemo(
    () =>
      [...db.reviews]
        .filter((r) => filter === "all" || r.kind === filter)
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [db.reviews, filter],
  );

  function customerName(customerId: string) {
    const u = db.users.find((x) => x.id === customerId);
    return u ? fullName(u) : "A customer";
  }

  function employeeName(employeeId?: string) {
    if (!employeeId) return null;
    const emp = db.employees.find((e) => e.id === employeeId);
    const u = emp && db.users.find((x) => x.id === emp.userId);
    return u ? fullName(u) : null;
  }

  function serviceName(serviceId?: string) {
    if (!serviceId) return null;
    return db.services.find((s) => s.id === serviceId)?.name ?? null;
  }

  return (
    <div className="space-y-5">
      <PageHeading
        title="Reviews"
        description="Decide which reviews are shown publicly on your site. Hiding a review never edits its content, and it can always be made public again."
      />

      <Segmented
        value={filter}
        onChange={setFilter}
        options={[
          { value: "all", label: `All (${db.reviews.length})` },
          { value: "salon", label: "Salon" },
          { value: "session", label: "Per-visit" },
        ]}
      />

      {reviews.length === 0 ? (
        <EmptyState
          icon={<Star size={20} />}
          title="No reviews yet"
          description="Once customers start leaving reviews, they'll show up here for you to manage."
        />
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => {
            const emp = employeeName(r.employeeId);
            const svc = serviceName(r.serviceId);
            return (
              <Card key={r.id} className={r.visible ? undefined : "opacity-60"}>
                <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={i < r.rating ? "fill-accent text-accent" : "text-border-strong"}
                          />
                        ))}
                      </div>
                      <Badge tone={r.kind === "salon" ? "primary" : "neutral"} className="capitalize">
                        {r.kind === "salon" ? "Overall salon" : "Per-visit"}
                      </Badge>
                      {!r.visible ? <Badge tone="warning">Hidden</Badge> : null}
                    </div>
                    {r.comment ? (
                      <p className="mt-2 text-sm leading-relaxed text-foreground">{r.comment}</p>
                    ) : (
                      <p className="mt-2 text-sm italic text-muted">No comment left.</p>
                    )}
                    <p className="mt-2 text-xs text-muted">
                      {customerName(r.customerId)}
                      {svc ? ` · ${svc}` : ""}
                      {emp ? ` · with ${emp}` : ""} · {fmt.mediumDate(r.createdAt)}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <Switch
                      checked={r.visible}
                      onChange={(v) => {
                        setReviewVisibility(r.id, v);
                        toast.success(v ? "Review made public" : "Review hidden");
                      }}
                      label={r.visible ? "Public" : "Hidden"}
                    />
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
