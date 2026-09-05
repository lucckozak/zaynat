"use client";

import { useMemo, useState } from "react";
import { Gift, Mail, Plus, Tag, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import type { Coupon, GiftCard } from "@/lib/types";
import { formatPrice, fullName, uid } from "@/lib/utils";
import { fmt } from "@/lib/time";
import { PageHeading } from "@/components/layout/dashboard-shell";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState, Segmented, Switch } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";

type Tab = "coupons" | "giftcards" | "email";

export default function AdminMarketingPage() {
  const { db } = useStore();
  const [tab, setTab] = useState<Tab>("coupons");

  return (
    <div>
      <PageHeading
        title="Marketing"
        description="Coupons, gift cards, and email campaigns to your customers."
        action={
          <Segmented
            value={tab}
            onChange={setTab}
            options={[
              { value: "coupons", label: "Coupons" },
              { value: "giftcards", label: "Gift cards" },
              { value: "email", label: "Email" },
            ]}
          />
        }
      />

      {tab === "coupons" ? (
        <CouponsPanel currency={db.settings.currency} />
      ) : tab === "giftcards" ? (
        <GiftCardsPanel currency={db.settings.currency} />
      ) : (
        <EmailerPanel />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function CouponsPanel({ currency }: { currency: string }) {
  const { db, saveCoupon, deleteCoupon } = useStore();
  const toast = useToast();
  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    code: "",
    type: "PERCENT" as Coupon["type"],
    value: 10,
    expiresAt: "",
    maxRedemptions: "",
  });

  function create() {
    const code = form.code.trim().toUpperCase();
    if (!code) return;
    saveCoupon({
      id: uid("cpn"),
      code,
      type: form.type,
      value: form.value,
      active: true,
      expiresAt: form.expiresAt || undefined,
      maxRedemptions: form.maxRedemptions ? Number(form.maxRedemptions) : undefined,
      redemptions: 0,
      createdAt: new Date().toISOString(),
    });
    toast.success("Coupon created");
    setForm({ code: "", type: "PERCENT", value: 10, expiresAt: "", maxRedemptions: "" });
    setCreating(false);
  }

  return (
    <div className="mt-6">
      <div className="mb-4 flex justify-end">
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus size={15} /> New coupon
        </Button>
      </div>

      {db.coupons.length === 0 ? (
        <EmptyState
          icon={<Tag size={20} />}
          title="No coupons yet"
          description="Create a discount code customers can enter at checkout."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {db.coupons.map((c) => {
            const expired = c.expiresAt && new Date(c.expiresAt) < new Date();
            const exhausted =
              c.maxRedemptions != null && c.redemptions >= c.maxRedemptions;
            return (
              <Card key={c.id}>
                <CardBody className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-mono text-base font-semibold tracking-wide text-foreground">
                      {c.code}
                    </p>
                    <button
                      onClick={() => setDeleteId(c.id)}
                      className="rounded-lg p-1.5 text-muted hover:bg-danger-soft hover:text-danger"
                      aria-label="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p className="text-lg font-medium text-primary">
                    {c.type === "PERCENT" ? `${c.value}% off` : formatPrice(c.value, currency) + " off"}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {!c.active ? (
                      <Badge tone="neutral">Disabled</Badge>
                    ) : expired ? (
                      <Badge tone="warning">Expired</Badge>
                    ) : exhausted ? (
                      <Badge tone="warning">Fully redeemed</Badge>
                    ) : (
                      <Badge tone="success">Active</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted">
                    {c.redemptions} redemption{c.redemptions === 1 ? "" : "s"}
                    {c.maxRedemptions ? ` of ${c.maxRedemptions}` : ""}
                    {c.expiresAt ? ` · expires ${fmt.mediumDate(c.expiresAt)}` : ""}
                  </p>
                  <Switch
                    checked={c.active}
                    onChange={(v) => saveCoupon({ ...c, active: v })}
                    label="Active"
                  />
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog
        open={creating}
        onClose={() => setCreating(false)}
        title="New coupon"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreating(false)}>
              Cancel
            </Button>
            <Button onClick={create} disabled={!form.code.trim()}>
              Create coupon
            </Button>
          </>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Code" required className="sm:col-span-2">
            <Input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="WELCOME10"
              className="uppercase"
            />
          </Field>
          <Field label="Type">
            <Select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as Coupon["type"] })}
            >
              <option value="PERCENT">Percentage</option>
              <option value="FIXED">Fixed amount</option>
            </Select>
          </Field>
          <Field label={form.type === "PERCENT" ? "Percent off" : `Amount off (${currency})`}>
            <Input
              type="number"
              min={0}
              value={form.value}
              onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
            />
          </Field>
          <Field label="Expires" hint="Optional">
            <Input
              type="date"
              value={form.expiresAt}
              onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
            />
          </Field>
          <Field label="Max redemptions" hint="Optional">
            <Input
              type="number"
              min={0}
              value={form.maxRedemptions}
              onChange={(e) => setForm({ ...form, maxRedemptions: e.target.value })}
            />
          </Field>
        </div>
      </Dialog>

      <Dialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete this coupon?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteId(null)}>
              Keep
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (deleteId) deleteCoupon(deleteId);
                toast.info("Coupon deleted");
                setDeleteId(null);
              }}
            >
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted">This can't be undone.</p>
      </Dialog>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function GiftCardsPanel({ currency }: { currency: string }) {
  const { db, saveGiftCard, deleteGiftCard } = useStore();
  const toast = useToast();
  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    code: "",
    initialValue: 100,
    purchaserName: "",
    recipientEmail: "",
  });

  function create() {
    const code = form.code.trim().toUpperCase();
    if (!code) return;
    const card: GiftCard = {
      id: uid("gc"),
      code,
      initialValue: form.initialValue,
      balance: form.initialValue,
      active: true,
      purchaserName: form.purchaserName.trim() || undefined,
      recipientEmail: form.recipientEmail.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    saveGiftCard(card);
    toast.success("Gift card issued", `${code} — ${formatPrice(form.initialValue, currency)}`);
    setForm({ code: "", initialValue: 100, purchaserName: "", recipientEmail: "" });
    setCreating(false);
  }

  return (
    <div className="mt-6">
      <div className="mb-4 flex justify-end">
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus size={15} /> Issue gift card
        </Button>
      </div>

      {db.giftCards.length === 0 ? (
        <EmptyState
          icon={<Gift size={20} />}
          title="No gift cards yet"
          description="Issue a gift card manually (e.g. for a phone/in-person sale)."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {db.giftCards.map((g) => {
            const pct = g.initialValue > 0 ? (g.balance / g.initialValue) * 100 : 0;
            return (
              <Card key={g.id}>
                <CardBody className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-mono text-base font-semibold tracking-wide text-foreground">
                      {g.code}
                    </p>
                    <button
                      onClick={() => setDeleteId(g.id)}
                      className="rounded-lg p-1.5 text-muted hover:bg-danger-soft hover:text-danger"
                      aria-label="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p className="text-lg font-medium text-primary">
                    {formatPrice(g.balance, currency)}
                    <span className="ml-1.5 text-xs font-normal text-muted">
                      of {formatPrice(g.initialValue, currency)}
                    </span>
                  </p>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-sunken">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.max(pct, g.balance > 0 ? 4 : 0)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted">
                    {g.purchaserName ? `Purchased by ${g.purchaserName} · ` : ""}
                    Issued {fmt.mediumDate(g.createdAt)}
                  </p>
                  <Switch
                    checked={g.active}
                    onChange={(v) => saveGiftCard({ ...g, active: v })}
                    label="Active"
                  />
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog
        open={creating}
        onClose={() => setCreating(false)}
        title="Issue a gift card"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreating(false)}>
              Cancel
            </Button>
            <Button onClick={create} disabled={!form.code.trim() || form.initialValue <= 0}>
              Issue card
            </Button>
          </>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Code" required className="sm:col-span-2">
            <Input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="GLOW-200"
              className="uppercase"
            />
          </Field>
          <Field label={`Value (${currency})`} required>
            <Input
              type="number"
              min={1}
              value={form.initialValue}
              onChange={(e) => setForm({ ...form, initialValue: Number(e.target.value) })}
            />
          </Field>
          <Field label="Purchaser name" hint="Optional">
            <Input
              value={form.purchaserName}
              onChange={(e) => setForm({ ...form, purchaserName: e.target.value })}
            />
          </Field>
          <Field label="Recipient email" hint="Optional" className="sm:col-span-2">
            <Input
              type="email"
              value={form.recipientEmail}
              onChange={(e) => setForm({ ...form, recipientEmail: e.target.value })}
            />
          </Field>
        </div>
      </Dialog>

      <Dialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete this gift card?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteId(null)}>
              Keep
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (deleteId) deleteGiftCard(deleteId);
                toast.info("Gift card deleted");
                setDeleteId(null);
              }}
            >
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted">This can't be undone.</p>
      </Dialog>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function EmailerPanel() {
  const { db, sendMarketingCampaign } = useStore();
  const toast = useToast();

  const customers = useMemo(
    () => db.users.filter((u) => u.role === "CUSTOMER"),
    [db.users],
  );

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(customers.filter((c) => !c.blocked).map((c) => c.id)),
  );
  const [confirmOpen, setConfirmOpen] = useState(false);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll(includeBlocked: boolean) {
    setSelected(
      new Set(customers.filter((c) => includeBlocked || !c.blocked).map((c) => c.id)),
    );
  }

  // Group the flat emailLog entries this campaign produced (one per
  // recipient) back into per-send summaries, by subject + timestamp.
  const recentCampaigns = useMemo(() => {
    const groups = new Map<string, { subject: string; sentAt: string; count: number }>();
    for (const m of db.emailLog) {
      if (m.kind !== "MARKETING") continue;
      const key = `${m.subject}__${m.sentAt}`;
      const g = groups.get(key);
      if (g) g.count++;
      else groups.set(key, { subject: m.subject, sentAt: m.sentAt, count: 1 });
    }
    return [...groups.values()].slice(0, 8);
  }, [db.emailLog]);

  function send() {
    const count = sendMarketingCampaign({
      subject: subject.trim(),
      body: body.trim(),
      customerIds: [...selected],
    });
    toast.success(
      `Campaign queued for ${count} customer${count === 1 ? "" : "s"}`,
      "Email delivery is stubbed in this prototype — logged, not actually sent.",
    );
    setSubject("");
    setBody("");
    setConfirmOpen(false);
  }

  const canSend = subject.trim().length > 0 && body.trim().length > 0 && selected.size > 0;

  return (
    <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
      <Card>
        <CardBody className="space-y-4">
          <div className="flex items-center gap-2">
            <Mail size={16} className="text-primary" />
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Compose
            </h2>
          </div>
          <Field label="Subject" required>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="A little something for you this month"
            />
          </Field>
          <Field label="Message" required hint="Use {firstName} to personalise the greeting.">
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Hi {firstName}, ..."
              className="min-h-[160px]"
            />
          </Field>
          <div className="flex items-center justify-between border-t border-border pt-4">
            <p className="text-sm text-muted">
              {selected.size} recipient{selected.size === 1 ? "" : "s"} selected
            </p>
            <Button disabled={!canSend} onClick={() => setConfirmOpen(true)}>
              Send campaign
            </Button>
          </div>
          <p className="text-xs text-muted">
            Email delivery is stubbed in this prototype — messages are logged, not actually sent.
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Recipients
            </h2>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => selectAll(false)}
                className="text-xs font-medium text-primary hover:text-primary-hover"
              >
                Active
              </button>
              <span className="text-xs text-muted">·</span>
              <button
                type="button"
                onClick={() => selectAll(true)}
                className="text-xs font-medium text-primary hover:text-primary-hover"
              >
                Everyone
              </button>
              <span className="text-xs text-muted">·</span>
              <button
                type="button"
                onClick={() => setSelected(new Set())}
                className="text-xs font-medium text-muted-strong hover:text-foreground"
              >
                None
              </button>
            </div>
          </div>

          {customers.length === 0 ? (
            <EmptyState title="No customers yet" />
          ) : (
            <div className="max-h-72 space-y-1 overflow-y-auto">
              {customers.map((c) => (
                <label
                  key={c.id}
                  className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-surface-sunken"
                >
                  <input
                    type="checkbox"
                    checked={selected.has(c.id)}
                    onChange={() => toggle(c.id)}
                    className="h-4 w-4 shrink-0 rounded border-border-strong text-primary focus-visible:ring-primary/30"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-foreground">{fullName(c)}</span>
                    <span className="block truncate text-xs text-muted">{c.email}</span>
                  </span>
                  {c.blocked ? <Badge tone="danger">Blocked</Badge> : null}
                </label>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {recentCampaigns.length > 0 ? (
        <Card className="lg:col-span-2">
          <CardBody className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Recently sent
            </h2>
            <ul className="space-y-2">
              {recentCampaigns.map((c) => (
                <li
                  key={`${c.subject}-${c.sentAt}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{c.subject}</p>
                    <p className="text-xs text-muted">
                      {fmt.dayMonth(c.sentAt)} · {fmt.time(c.sentAt)}
                    </p>
                  </div>
                  <Badge tone="neutral">
                    {c.count} recipient{c.count === 1 ? "" : "s"}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      ) : null}

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Send this campaign?"
        description={`This will queue ${selected.size} email${selected.size === 1 ? "" : "s"}. This can't be undone.`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={send}>Send now</Button>
          </>
        }
      >
        <p className="text-sm text-muted">
          Subject: <span className="font-medium text-foreground">{subject || "—"}</span>
        </p>
      </Dialog>
    </div>
  );
}
