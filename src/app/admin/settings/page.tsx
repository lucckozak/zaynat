"use client";

import { useRef, useState } from "react";
import { ImagePlus, Palette, RotateCcw, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import type { DayOfWeek, SalonSettings } from "@/lib/types";
import { DAY_LABELS } from "@/lib/types";
import { applyTheme, isValidHex, THEME_SWATCHES } from "@/lib/theme";
import { applyFont, FONT_CHOICES } from "@/lib/fonts";
import { fileToLogoDataUrl, LogoUploadError } from "@/lib/image-upload";
import { PageHeading } from "@/components/layout/dashboard-shell";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { Switch } from "@/components/ui/misc";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

const ORDER: DayOfWeek[] = [1, 2, 3, 4, 5, 6, 0];

export default function AdminSettingsPage() {
  const { db, updateSettings, resetAll } = useStore();
  const toast = useToast();
  const [s, setS] = useState<SalonSettings>(structuredClone(db.settings));
  const [confirmReset, setConfirmReset] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof SalonSettings>(k: K, v: SalonSettings[K]) {
    setS((prev) => ({ ...prev, [k]: v }));
  }

  function setBrand(part: "primary" | "accent", hex: string) {
    const theme = { ...s.theme, [part]: hex };
    setS((prev) => ({ ...prev, theme }));
    if (isValidHex(theme.primary) && isValidHex(theme.accent))
      applyTheme(theme); // live preview
  }

  async function handleLogoFile(file: File) {
    setUploadingLogo(true);
    try {
      const dataUrl = await fileToLogoDataUrl(file);
      set("logoUrl", dataUrl);
      toast.success("Logo uploaded", "Press Save all settings to keep it.");
    } catch (err) {
      toast.error(
        "Couldn't use that image",
        err instanceof LogoUploadError ? err.message : "Try a different file.",
      );
    } finally {
      setUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function setOpening(day: DayOfWeek, patch: Partial<{ open: string | null; close: string | null }>) {
    setS((prev) => ({
      ...prev,
      openingHours: prev.openingHours.map((o) =>
        o.dayOfWeek === day ? { ...o, ...patch } : o,
      ),
    }));
  }

  function save() {
    updateSettings(s);
    toast.success("Settings saved");
  }

  return (
    <div className="space-y-6">
      <PageHeading
        title="Salon settings"
        description="Configure the whole salon from here."
        action={<Button onClick={save}>Save all settings</Button>}
      />

      <Card>
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <Field label="Salon name">
            <Input value={s.name} onChange={(e) => set("name", e.target.value)} />
          </Field>
          <Field label="Tagline">
            <Input
              value={s.tagline}
              onChange={(e) => set("tagline", e.target.value)}
            />
          </Field>
          <Field label="Address" className="sm:col-span-2">
            <Input
              value={s.address}
              onChange={(e) => set("address", e.target.value)}
            />
          </Field>
          <Field label="Phone">
            <Input
              value={s.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
          </Field>
          <Field label="Email">
            <Input
              value={s.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </Field>
          <Field label="Currency">
            <Input
              value={s.currency}
              onChange={(e) => set("currency", e.target.value)}
            />
          </Field>
        </CardBody>
      </Card>

      {/* Appearance */}
      <Card>
        <CardBody className="space-y-5">
          <div className="flex items-center gap-2">
            <Palette size={16} className="text-primary" />
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Appearance
            </h2>
          </div>

          <Field
            label="Logo"
            hint="A backgroundless (transparent) PNG, WebP or SVG works best — shown in place of the salon name in headers and navigation."
          >
            <div className="flex items-center gap-4">
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-dashed border-border-strong bg-[repeating-conic-gradient(#00000008_0%_25%,transparent_0%_50%)] bg-[length:12px_12px]"
                aria-hidden
              >
                {s.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={s.logoUrl}
                    alt="Logo preview"
                    className="h-full w-full object-contain p-1.5"
                  />
                ) : (
                  <ImagePlus size={20} className="text-muted" />
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/webp,image/jpeg,image/svg+xml"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleLogoFile(file);
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  loading={uploadingLogo}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImagePlus size={14} /> {s.logoUrl ? "Replace logo" : "Upload logo"}
                </Button>
                {s.logoUrl ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => set("logoUrl", undefined)}
                  >
                    <Trash2 size={14} /> Remove
                  </Button>
                ) : null}
              </div>
            </div>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Brand colour"
              hint="Drives buttons, highlights and links across the whole site."
            >
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={isValidHex(s.theme.primary) ? s.theme.primary : "#7c5e77"}
                  onChange={(e) => setBrand("primary", e.target.value)}
                  className="h-11 w-14 cursor-pointer rounded-lg border border-border-strong bg-surface p-1"
                  aria-label="Primary colour"
                />
                <Input
                  value={s.theme.primary}
                  onChange={(e) => setBrand("primary", e.target.value)}
                />
              </div>
            </Field>
            <Field label="Accent colour" hint="Used for eyebrow labels and tags.">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={isValidHex(s.theme.accent) ? s.theme.accent : "#b98c86"}
                  onChange={(e) => setBrand("accent", e.target.value)}
                  className="h-11 w-14 cursor-pointer rounded-lg border border-border-strong bg-surface p-1"
                  aria-label="Accent colour"
                />
                <Input
                  value={s.theme.accent}
                  onChange={(e) => setBrand("accent", e.target.value)}
                />
              </div>
            </Field>
          </div>

          <div>
            <p className="mb-2 text-[13px] font-medium text-muted-strong">
              Quick palettes
            </p>
            <div className="flex flex-wrap gap-2">
              {THEME_SWATCHES.map((sw) => (
                <button
                  key={sw.label}
                  onClick={() => {
                    setS((prev) => ({
                      ...prev,
                      theme: { primary: sw.primary, accent: sw.accent },
                    }));
                    applyTheme({ primary: sw.primary, accent: sw.accent });
                  }}
                  className="flex items-center gap-1.5 rounded-full border border-border bg-surface py-1 pl-1 pr-3 text-xs font-medium text-foreground hover:border-primary/50"
                >
                  <span
                    className="h-5 w-5 rounded-full"
                    style={{
                      background: `linear-gradient(135deg, ${sw.primary} 55%, ${sw.accent} 55%)`,
                    }}
                  />
                  {sw.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted">
              Colour changes preview instantly — press{" "}
              <span className="font-medium text-muted-strong">
                Save all settings
              </span>{" "}
              to keep them.
            </p>
          </div>

          <div className="border-t border-border pt-4">
            <p className="mb-2 text-[13px] font-medium text-muted-strong">
              Typography
            </p>
            <div className="grid gap-2 sm:grid-cols-3">
              {FONT_CHOICES.map((f) => {
                const active = (s.typography ?? FONT_CHOICES[0].id) === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      set("typography", f.id);
                      applyFont(f.id); // live preview
                    }}
                    className={cn(
                      "rounded-xl border px-3 py-2.5 text-left transition-colors",
                      active
                        ? "border-primary bg-primary-soft/50"
                        : "border-border bg-surface hover:border-primary/40",
                    )}
                  >
                    <span
                      className="block text-lg font-medium text-foreground"
                      style={{ fontFamily: f.stack }}
                    >
                      Aa
                    </span>
                    <span className="mt-0.5 block text-xs font-medium text-foreground">
                      {f.label}
                    </span>
                    <span className="block text-xs text-muted">{f.description}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
            Opening hours
          </h2>
          <div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
            {ORDER.map((day) => {
              const o = s.openingHours.find((x) => x.dayOfWeek === day)!;
              const closed = !o.open || !o.close;
              return (
                <div
                  key={day}
                  className="flex flex-wrap items-center gap-3 px-4 py-3"
                >
                  <span className="w-24 text-sm font-medium text-foreground">
                    {DAY_LABELS[day]}
                  </span>
                  <Switch
                    checked={!closed}
                    onChange={(on) =>
                      setOpening(day, on ? { open: "09:00", close: "18:00" } : { open: null, close: null })
                    }
                  />
                  {!closed ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={o.open ?? ""}
                        onChange={(e) => setOpening(day, { open: e.target.value })}
                        className="h-9 rounded-lg border border-border-strong bg-surface px-2 text-sm"
                      />
                      <span className="text-muted">–</span>
                      <input
                        type="time"
                        value={o.close ?? ""}
                        onChange={(e) =>
                          setOpening(day, { close: e.target.value })
                        }
                        className="h-9 rounded-lg border border-border-strong bg-surface px-2 text-sm"
                      />
                    </div>
                  ) : (
                    <span className="text-sm text-muted">Closed</span>
                  )}
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted sm:col-span-2">
            Booking rules
          </h2>
          <Field label="Buffer between appointments (min)">
            <Input
              type="number"
              min={0}
              step={5}
              value={s.bufferMinutes}
              onChange={(e) => set("bufferMinutes", Number(e.target.value))}
            />
          </Field>
          <Field label="Slot interval (min)">
            <Select
              value={String(s.slotIntervalMinutes)}
              onChange={(e) =>
                set("slotIntervalMinutes", Number(e.target.value))
              }
            >
              <option value="15">Every 15 minutes</option>
              <option value="30">Every 30 minutes</option>
              <option value="60">Every hour</option>
            </Select>
          </Field>
          <Field label="Cancellation window (hours)">
            <Input
              type="number"
              min={0}
              value={s.cancellationWindowHours}
              onChange={(e) =>
                set("cancellationWindowHours", Number(e.target.value))
              }
            />
          </Field>
          <Field label="Minimum lead time (hours)">
            <Input
              type="number"
              min={0}
              value={s.minLeadTimeHours}
              onChange={(e) => set("minLeadTimeHours", Number(e.target.value))}
            />
          </Field>
          <Field label="Booking window (days ahead)">
            <Input
              type="number"
              min={1}
              value={s.maxAdvanceDays}
              onChange={(e) => set("maxAdvanceDays", Number(e.target.value))}
            />
          </Field>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Notifications (email)
          </h2>
          <Switch
            checked={s.notifications.customerConfirmation}
            onChange={(v) =>
              set("notifications", {
                ...s.notifications,
                customerConfirmation: v,
              })
            }
            label="Customer booking confirmation"
          />
          <Switch
            checked={s.notifications.customerReminder}
            onChange={(v) =>
              set("notifications", { ...s.notifications, customerReminder: v })
            }
            label="Customer appointment reminder"
          />
          <Switch
            checked={s.notifications.employeeNewBooking}
            onChange={(v) =>
              set("notifications", {
                ...s.notifications,
                employeeNewBooking: v,
              })
            }
            label="Notify specialist of schedule changes"
          />
          <Switch
            checked={s.notifications.adminNewBooking}
            onChange={(v) =>
              set("notifications", { ...s.notifications, adminNewBooking: v })
            }
            label="Notify admin of every booking"
          />
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-foreground">
              Reset demo data
            </p>
            <p className="text-sm text-muted">
              Wipes local changes and regenerates the seeded salon.
            </p>
          </div>
          <Button variant="outline" onClick={() => setConfirmReset(true)}>
            <RotateCcw size={15} /> Reset
          </Button>
        </CardBody>
      </Card>

      <Dialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Reset all demo data?"
        description="Every booking, employee edit and setting change made in this browser will be discarded."
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmReset(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                resetAll();
                setConfirmReset(false);
                toast.success("Demo data reset");
              }}
            >
              Reset everything
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted">This cannot be undone.</p>
      </Dialog>
    </div>
  );
}
