"use client";

import { useState } from "react";
import { CalendarCheck, Clock3, Sparkles, Star } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { customerStats } from "@/lib/selectors";
import { fmt } from "@/lib/time";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Card, CardBody } from "@/components/ui/card";
import { Stat } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

function RateSalonCard() {
  const { user } = useAuth();
  const { db, addSalonReview } = useStore();
  const toast = useToast();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!user) return null;
  const hasCompletedVisit = db.appointments.some(
    (a) => a.customerId === user.id && a.status === "COMPLETED",
  );
  if (!hasCompletedVisit) return null;

  const existing = db.reviews.find((r) => r.kind === "salon" && r.customerId === user.id);

  if (existing) {
    return (
      <Card>
        <CardBody className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={16}
                className={i < existing.rating ? "fill-accent text-accent" : "text-border-strong"}
              />
            ))}
          </div>
          <p className="text-sm text-muted">
            Thanks for rating us{existing.comment ? ` — "${existing.comment}"` : "!"}
          </p>
        </CardBody>
      </Card>
    );
  }

  function submit() {
    if (!user) return;
    setSubmitting(true);
    const result = addSalonReview({ customerId: user.id, rating, comment: comment.trim() || undefined });
    setSubmitting(false);
    if (!result.ok) {
      toast.error("Couldn't submit your rating", result.error);
      return;
    }
    toast.success("Thanks for the feedback!", "Your rating is now shown publicly.");
  }

  return (
    <Card>
      <CardBody className="space-y-3">
        <h2 className="text-lg font-medium text-foreground">Rate {db.settings.name || "this salon"}</h2>
        <p className="text-sm text-muted">Your overall experience with us — shown publicly on our homepage.</p>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => {
            const value = i + 1;
            const filled = value <= (hoverRating || rating);
            return (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                onMouseEnter={() => setHoverRating(value)}
                onMouseLeave={() => setHoverRating(0)}
                aria-label={`${value} star${value === 1 ? "" : "s"}`}
                className="p-0.5"
              >
                <Star size={26} className={cn("transition-colors", filled ? "fill-accent text-accent" : "text-border-strong")} />
              </button>
            );
          })}
        </div>
        <Field label="Comment (optional)">
          <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="What stood out?" />
        </Field>
        <Button size="sm" loading={submitting} onClick={submit}>
          Submit rating
        </Button>
      </CardBody>
    </Card>
  );
}

export default function ProfilePage() {
  const { user, updateProfile, signOut } = useAuth();
  const { db } = useStore();
  const toast = useToast();

  const [form, setForm] = useState({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    phone: user?.phone ?? "",
    dateOfBirth: user?.dateOfBirth ?? "",
  });

  if (!user) return null;
  const stats = customerStats(db, user.id);

  function save(e: React.FormEvent) {
    e.preventDefault();
    updateProfile({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: form.phone.trim(),
      dateOfBirth: form.dateOfBirth || undefined,
    });
    toast.success("Profile updated");
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
        <Stat
          compact
          label="Visits"
          value={stats.completed}
          hint={`${stats.total} booked`}
          icon={<CalendarCheck size={15} />}
        />
        <Stat
          compact
          label="Upcoming"
          value={stats.upcoming}
          tone="info"
          icon={<Clock3 size={15} />}
          hint={
            stats.lastVisit
              ? `Last visit ${fmt.mediumDate(stats.lastVisit)}`
              : "None booked yet"
          }
        />
        <Stat
          compact
          label="Member since"
          value={fmt.monthYear(user.createdAt)}
          tone="accent"
          icon={<Sparkles size={15} />}
          hint={
            stats.favouriteService
              ? `Go-to: ${stats.favouriteService}`
              : "Welcome anytime"
          }
        />
      </div>

      <Card>
        <CardBody>
          <h2 className="text-lg font-medium text-foreground">
            Personal information
          </h2>
          <form onSubmit={save} className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="First name" required>
              <Input
                value={form.firstName}
                onChange={(e) =>
                  setForm({ ...form, firstName: e.target.value })
                }
              />
            </Field>
            <Field label="Last name" required>
              <Input
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />
            </Field>
            <Field label="Email" hint="Contact us to change your email">
              <Input value={user.email} disabled />
            </Field>
            <Field label="Phone" required>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </Field>
            <Field label="Date of birth" hint="Optional — for birthday treats">
              <Input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) =>
                  setForm({ ...form, dateOfBirth: e.target.value })
                }
              />
            </Field>
            <div className="flex items-end">
              <Button type="submit">Save changes</Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <RateSalonCard />

      <Card>
        <CardBody className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-foreground">Sign out</p>
            <p className="text-sm text-muted">
              You'll need to sign in again to manage appointments.
            </p>
          </div>
          <Button variant="outline" onClick={signOut}>
            Sign out
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
