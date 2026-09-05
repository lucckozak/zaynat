"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, Textarea } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export function ReviewDialog({
  appointmentId,
  employeeName,
  open,
  onClose,
}: {
  appointmentId: string | null;
  employeeName?: string;
  open: boolean;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const { addReview } = useStore();
  const toast = useToast();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  function reset() {
    setRating(5);
    setHoverRating(0);
    setComment("");
  }

  function submit() {
    if (!appointmentId || !user) return;
    const result = addReview({
      appointmentId,
      customerId: user.id,
      rating,
      comment: comment.trim() || undefined,
    });
    if (!result.ok) {
      toast.error("Couldn't submit your review", result.error);
      return;
    }
    toast.success("Thanks for the feedback!", "Your review is now live.");
    reset();
    onClose();
  }

  return (
    <Dialog
      open={open && !!appointmentId}
      onClose={() => {
        reset();
        onClose();
      }}
      title={employeeName ? `Rate your visit with ${employeeName}` : "Rate your visit"}
      description="Your review is shown publicly on the specialist's profile."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Not now
          </Button>
          <Button onClick={submit}>Submit review</Button>
        </>
      }
    >
      <div className="space-y-4">
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
                <Star
                  size={28}
                  className={cn(
                    "transition-colors",
                    filled ? "fill-accent text-accent" : "text-border-strong",
                  )}
                />
              </button>
            );
          })}
        </div>
        <Field label="Comment (optional)">
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="How was it?"
          />
        </Field>
      </div>
    </Dialog>
  );
}
