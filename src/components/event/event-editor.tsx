"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { EventDTO, ImageAsset } from "@/lib/models";
import { eventUpsertSchema } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EventRenderer, type EventViewModel } from "@/components/event/event-renderer";
import { RELIGIONS, THEME_PRESETS, defaultThemeForReligion } from "@/themes/presets";
import type { EventType, ReligionId, ThemeConfig } from "@/themes/types";

function toDatetimeLocalValue(iso: string) {
  const d = new Date(iso);
  const tzOffset = d.getTimezoneOffset() * 60 * 1000;
  const local = new Date(d.getTime() - tzOffset);
  return local.toISOString().slice(0, 16);
}

function fromDatetimeLocalValue(value: string) {
  const d = new Date(value);
  return d.toISOString();
}

const defaultDate = () => {
  const d = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  d.setMinutes(0, 0, 0);
  return d.toISOString();
};

type BuilderStep = "type" | "theme" | "colors" | "details" | "people";

function stepsForType(type: EventType): { id: BuilderStep; label: string }[] {
  const peopleLabel = type === "wedding" ? "Couple" : "Host";
  return [
    { id: "type", label: "Event type" },
    { id: "theme", label: "Theme" },
    { id: "colors", label: "Colors" },
    { id: "details", label: "Details" },
    { id: "people", label: peopleLabel }
  ];
}

function Stepper({
  step,
  setStep,
  steps
}: {
  step: BuilderStep;
  setStep: (s: BuilderStep) => void;
  steps: { id: BuilderStep; label: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {steps.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => setStep(s.id)}
          className={[
            "rounded-full border px-3 py-1 text-xs transition",
            step === s.id ? "bg-foreground text-background" : "bg-background text-muted-foreground hover:text-foreground"
          ].join(" ")}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

function ColorPicker({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid gap-2 rounded-2xl border bg-background p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-medium">{label}</div>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-8 w-10 cursor-pointer rounded-md border bg-transparent p-0"
          />
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-9 w-28 font-mono"
          />
        </div>
      </div>
      <div className="text-xs text-muted-foreground">
        Used across buttons, accents, and highlights.
      </div>
    </div>
  );
}

type Mode = "create" | "edit";

type BuilderState = {
  slug: string;
  type: EventType;
  title: string;
  date: string;
  venue: string;
  mapLink: string;
  description: string;
  theme: ThemeConfig;
  coverImage: ImageAsset | null;
  music: ImageAsset | null;
  coupleDetails: {
    bride: { name: string; parents: { father: string; mother: string } };
    groom: { name: string; parents: { father: string; mother: string } };
  };
  hostDetails: { hostName: string; hosts?: { name: string; role?: string }[] };
};

function coerceTheme(theme: any): ThemeConfig {
  const fallback = defaultThemeForReligion((theme?.religion as ReligionId) || "neutral");
  if (!theme || typeof theme !== "object") return fallback;
  const merged: ThemeConfig = {
    ...fallback,
    ...theme,
    colors: { ...fallback.colors, ...(theme.colors || {}) },
    fontPairing: { ...fallback.fontPairing, ...(theme.fontPairing || {}) }
  };
  return merged;
}

export function EventEditor({
  mode,
  initialEvent
}: {
  mode: Mode;
  initialEvent?: EventDTO;
}) {
  const router = useRouter();
  const [step, setStep] = useState<BuilderStep>("type");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [state, setState] = useState<BuilderState>(() => ({
    slug: initialEvent?.slug ?? "",
    type: (initialEvent?.type ?? "wedding") as EventType,
    title: initialEvent?.title ?? "Wedding Invitation",
    date: initialEvent?.date ?? defaultDate(),
    venue: initialEvent?.venue ?? "",
    mapLink: initialEvent?.mapLink ?? "",
    description: initialEvent?.description ?? "",
    theme: coerceTheme(initialEvent?.theme),
    coverImage: initialEvent?.coverImage ?? null,
    music: initialEvent?.music ?? null,
    coupleDetails:
      initialEvent?.coupleDetails ?? {
        bride: { name: "", parents: { father: "", mother: "" } },
        groom: { name: "", parents: { father: "", mother: "" } }
      },
    hostDetails: initialEvent?.hostDetails ?? { hostName: "" }
  }));

  const steps = useMemo(() => stepsForType(state.type), [state.type]);

  const preview: EventViewModel = useMemo(
    () => ({
      slug: state.slug?.trim() ? state.slug : initialEvent?.slug,
      type: state.type,
      title: state.title,
      date: state.date,
      venue: state.venue,
      mapLink: state.mapLink,
      description: state.description,
      theme: state.theme,
      coupleDetails: state.type === "wedding" ? state.coupleDetails : undefined,
      hostDetails: state.type !== "wedding" ? state.hostDetails : undefined,
      coverImageUrl: state.coverImage?.url || "",
      musicUrl: state.music?.url || "",
      status: initialEvent?.status ?? "active"
    }),
    [state, initialEvent?.slug, initialEvent?.status]
  );

  async function uploadAsset(file: File, kind: "cover" | "music") {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.onload = () => resolve(String(reader.result));
      reader.readAsDataURL(file);
    });

    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ dataUrl, kind })
    });
    if (!res.ok) throw new Error(await res.text());
    return (await res.json()) as { url: string; publicId: string };
  }

  async function onSave() {
    setError(null);

    const candidate: any = {
      slug: state.slug,
      type: state.type,
      title: state.title,
      date: state.date,
      venue: state.venue,
      mapLink: state.mapLink,
      description: state.description,
      theme: state.theme,
      coverImage: state.coverImage,
      music: state.music,
      ...(state.type === "wedding"
        ? { coupleDetails: state.coupleDetails }
        : { hostDetails: state.hostDetails })
    };

    const parsed = eventUpsertSchema.safeParse(candidate);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Invalid input");
      return;
    }

    setSaving(true);
    try {
      const url =
        mode === "create"
          ? "/api/events"
          : `/api/events/${encodeURIComponent(initialEvent!._id)}`;
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed.data)
      });
      if (!res.ok) throw new Error(await res.text());
      const json = (await res.json()) as { event: EventDTO };
      router.push(`/dashboard/events/${json.event._id}/edit`);
      router.refresh();
    } catch (e: any) {
      setError(e?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  function setReligion(religion: ReligionId) {
    const next = defaultThemeForReligion(religion);
    setState((s) => ({ ...s, theme: next }));
  }

  function setPreset(name: string) {
    const preset = THEME_PRESETS.find((p) => p.name === name);
    if (!preset) return;
    setState((s) => ({ ...s, theme: preset }));
  }

  const presetsForReligion = useMemo(
    () => THEME_PRESETS.filter((p) => p.religion === state.theme.religion),
    [state.theme.religion]
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-3xl border bg-card p-6 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-medium">Builder</div>
            <div className="mt-1 text-sm text-muted-foreground">
              Step-based editing with live preview.
            </div>
          </div>
          <Button onClick={onSave} disabled={saving} type="button">
            {saving ? "Saving…" : mode === "create" ? "Create event" : "Save"}
          </Button>
        </div>

        <div className="mt-4">
          <Stepper step={step} setStep={setStep} steps={steps} />
        </div>

        <div className="mt-6 grid gap-4">
          {step === "type" ? (
            <div className="grid gap-3">
              <div className="grid gap-1">
                <label className="text-sm font-medium">Event type</label>
                <select
                  value={state.type}
                  onChange={(e) => {
                    const nextType = e.target.value as EventType;
                    setState((s) => ({
                      ...s,
                      type: nextType,
                      title:
                        s.title ||
                        (nextType === "wedding"
                          ? "Wedding Invitation"
                          : nextType === "housewarming"
                            ? "Housewarming Invitation"
                            : "Event Invitation")
                    }));
                    setStep("theme");
                  }}
                  className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm shadow-soft outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="wedding">Wedding</option>
                  <option value="reception">Reception</option>
                  <option value="engagement">Engagement</option>
                  <option value="housewarming">Housewarming</option>
                  <option value="birthday">Birthday</option>
                  <option value="generic">Generic</option>
                </select>
                <p className="text-xs text-muted-foreground">
                  This controls which structured fields appear.
                </p>
              </div>
              <div className="grid gap-1">
                <label className="text-sm font-medium">Slug (URL)</label>
                <Input
                  value={state.slug}
                  onChange={(e) => setState((s) => ({ ...s, slug: e.target.value }))}
                  placeholder="my-event"
                />
                <p className="text-xs text-muted-foreground">
                  Public URL will be{" "}
                  <span className="font-mono">/event/&lt;slug&gt;</span>. Leave blank to auto-generate.
                </p>
              </div>
            </div>
          ) : null}

          {step === "theme" ? (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Religion preset</label>
                <div className="grid grid-cols-2 gap-3">
                  {RELIGIONS.map((r) => {
                    const active = r.id === state.theme.religion;
                    const sample = defaultThemeForReligion(r.id);
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setReligion(r.id)}
                        className={[
                          "rounded-2xl border p-4 text-left shadow-soft transition",
                          active ? "border-foreground" : "border-border hover:border-foreground/40"
                        ].join(" ")}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-semibold">{r.label}</div>
                          <div className="flex items-center gap-1">
                            <span
                              className="h-3 w-3 rounded-full border"
                              style={{ backgroundColor: sample.colors.primary }}
                            />
                            <span
                              className="h-3 w-3 rounded-full border"
                              style={{ backgroundColor: sample.colors.secondary }}
                            />
                            <span
                              className="h-3 w-3 rounded-full border"
                              style={{ backgroundColor: sample.colors.accent }}
                            />
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          {r.description}
                        </div>
                        <div className="mt-3 line-clamp-1 text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
                          {sample.headingText}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Theme</label>
                <div className="grid grid-cols-2 gap-3">
                  {presetsForReligion.map((p) => {
                    const active = p.name === state.theme.name;
                    return (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => setPreset(p.name)}
                        className={[
                          "rounded-2xl border p-4 text-left shadow-soft transition",
                          active ? "border-foreground" : "border-border hover:border-foreground/40"
                        ].join(" ")}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-semibold">{p.name}</div>
                          <div className="flex items-center gap-1">
                            <span className="h-3 w-3 rounded-full border" style={{ backgroundColor: p.colors.primary }} />
                            <span className="h-3 w-3 rounded-full border" style={{ backgroundColor: p.colors.secondary }} />
                            <span className="h-3 w-3 rounded-full border" style={{ backgroundColor: p.colors.accent }} />
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          {p.layoutStyle} • {p.animationStyle} • {p.pattern}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Pick a preset, then override colors in the next step.
                </p>
              </div>

              <div className="grid gap-1">
                <label className="text-sm font-medium">Layout style</label>
                <select
                  value={state.theme.layoutStyle}
                  onChange={(e) =>
                    setState((s) => ({
                      ...s,
                      theme: { ...s.theme, layoutStyle: e.target.value as any }
                    }))
                  }
                  className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm shadow-soft outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="classic">Classic</option>
                  <option value="luxury">Luxury</option>
                  <option value="modern">Modern</option>
                </select>
              </div>

              <div className="grid gap-1">
                <label className="text-sm font-medium">Animation style</label>
                <select
                  value={state.theme.animationStyle}
                  onChange={(e) =>
                    setState((s) => ({
                      ...s,
                      theme: { ...s.theme, animationStyle: e.target.value as any }
                    }))
                  }
                  className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm shadow-soft outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="soft">Soft</option>
                  <option value="bold">Bold</option>
                  <option value="none">None</option>
                </select>
              </div>

              <div className="grid gap-1">
                <label className="text-sm font-medium">Heading text</label>
                <Input
                  value={state.theme.headingText}
                  onChange={(e) =>
                    setState((s) => ({ ...s, theme: { ...s.theme, headingText: e.target.value } }))
                  }
                  placeholder="Save the Date"
                />
              </div>

              <div className="grid gap-1">
                <label className="text-sm font-medium">Motif pattern</label>
                <select
                  value={state.theme.pattern}
                  onChange={(e) =>
                    setState((s) => ({ ...s, theme: { ...s.theme, pattern: e.target.value as any } }))
                  }
                  className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm shadow-soft outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="islamic">Islamic</option>
                  <option value="mandala">Mandala</option>
                  <option value="floral">Floral</option>
                  <option value="minimal">Minimal</option>
                  <option value="geometric">Geometric</option>
                  <option value="dots">Dots</option>
                </select>
              </div>

              <div className="grid gap-2 rounded-2xl border bg-background p-4">
                <div className="text-sm font-medium">Font pairing</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1">
                    <label className="text-xs text-muted-foreground">Heading</label>
                    <select
                      value={state.theme.fontPairing.heading}
                      onChange={(e) =>
                        setState((s) => ({
                          ...s,
                          theme: {
                            ...s.theme,
                            fontPairing: { ...s.theme.fontPairing, heading: e.target.value as any }
                          }
                        }))
                      }
                      className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm shadow-soft outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="serif">Serif</option>
                      <option value="sans">Sans</option>
                    </select>
                  </div>
                  <div className="grid gap-1">
                    <label className="text-xs text-muted-foreground">Body</label>
                    <select
                      value={state.theme.fontPairing.body}
                      onChange={(e) =>
                        setState((s) => ({
                          ...s,
                          theme: {
                            ...s.theme,
                            fontPairing: { ...s.theme.fontPairing, body: e.target.value as any }
                          }
                        }))
                      }
                      className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm shadow-soft outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="sans">Sans</option>
                      <option value="serif">Serif</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {step === "colors" ? (
            <div className="grid gap-3">
              <ColorPicker
                label="Primary"
                value={state.theme.colors.primary}
                onChange={(v) =>
                  setState((s) => ({ ...s, theme: { ...s.theme, colors: { ...s.theme.colors, primary: v } } }))
                }
              />
              <ColorPicker
                label="Secondary"
                value={state.theme.colors.secondary}
                onChange={(v) =>
                  setState((s) => ({ ...s, theme: { ...s.theme, colors: { ...s.theme.colors, secondary: v } } }))
                }
              />
              <ColorPicker
                label="Accent"
                value={state.theme.colors.accent}
                onChange={(v) =>
                  setState((s) => ({ ...s, theme: { ...s.theme, colors: { ...s.theme.colors, accent: v } } }))
                }
              />
            </div>
          ) : null}

          {step === "details" ? (
            <div className="grid gap-4">
              <div className="grid gap-1">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={state.title}
                  onChange={(e) => setState((s) => ({ ...s, title: e.target.value }))}
                  placeholder="Wedding Invitation"
                />
              </div>
              <div className="grid gap-1">
                <label className="text-sm font-medium">Date & time</label>
                <Input
                  type="datetime-local"
                  value={toDatetimeLocalValue(state.date)}
                  onChange={(e) => setState((s) => ({ ...s, date: fromDatetimeLocalValue(e.target.value) }))}
                />
              </div>
              <div className="grid gap-1">
                <label className="text-sm font-medium">Venue</label>
                <Input
                  value={state.venue}
                  onChange={(e) => setState((s) => ({ ...s, venue: e.target.value }))}
                  placeholder="Venue name + address"
                />
              </div>
              <div className="grid gap-1">
                <label className="text-sm font-medium">Google Maps link</label>
                <Input
                  value={state.mapLink}
                  onChange={(e) => setState((s) => ({ ...s, mapLink: e.target.value }))}
                  placeholder="https://maps.google.com/..."
                />
              </div>
              <div className="grid gap-1">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={state.description}
                  onChange={(e) => setState((s) => ({ ...s, description: e.target.value }))}
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Cover image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setError(null);
                    try {
                      const asset = await uploadAsset(file, "cover");
                      setState((s) => ({ ...s, coverImage: asset }));
                    } catch (err: any) {
                      setError(err?.message || "Upload failed");
                    }
                  }}
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Background music</label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setError(null);
                    try {
                      const asset = await uploadAsset(file, "music");
                      setState((s) => ({ ...s, music: asset }));
                    } catch (err: any) {
                      setError(err?.message || "Upload failed");
                    }
                  }}
                />
              </div>
            </div>
          ) : null}

          {step === "people" ? (
            state.type === "wedding" ? (
              <div className="grid gap-4">
                <div className="text-sm font-medium">Bride & groom</div>
                <div className="grid gap-3">
                  <div className="grid gap-1">
                    <label className="text-sm font-medium">Bride name</label>
                    <Input
                      value={state.coupleDetails.bride.name}
                      onChange={(e) =>
                        setState((s) => ({
                          ...s,
                          coupleDetails: { ...s.coupleDetails, bride: { ...s.coupleDetails.bride, name: e.target.value } }
                        }))
                      }
                    />
                  </div>
                  <div className="grid gap-1">
                    <label className="text-sm font-medium">Groom name</label>
                    <Input
                      value={state.coupleDetails.groom.name}
                      onChange={(e) =>
                        setState((s) => ({
                          ...s,
                          coupleDetails: { ...s.coupleDetails, groom: { ...s.coupleDetails.groom, name: e.target.value } }
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-3 rounded-2xl border bg-background p-4">
                  <div className="text-sm font-medium">Bride parents</div>
                  <Input
                    value={state.coupleDetails.bride.parents.father}
                    onChange={(e) =>
                      setState((s) => ({
                        ...s,
                        coupleDetails: {
                          ...s.coupleDetails,
                          bride: {
                            ...s.coupleDetails.bride,
                            parents: { ...s.coupleDetails.bride.parents, father: e.target.value }
                          }
                        }
                      }))
                    }
                    placeholder="Father name"
                  />
                  <Input
                    value={state.coupleDetails.bride.parents.mother}
                    onChange={(e) =>
                      setState((s) => ({
                        ...s,
                        coupleDetails: {
                          ...s.coupleDetails,
                          bride: {
                            ...s.coupleDetails.bride,
                            parents: { ...s.coupleDetails.bride.parents, mother: e.target.value }
                          }
                        }
                      }))
                    }
                    placeholder="Mother name"
                  />
                </div>

                <div className="grid gap-3 rounded-2xl border bg-background p-4">
                  <div className="text-sm font-medium">Groom parents</div>
                  <Input
                    value={state.coupleDetails.groom.parents.father}
                    onChange={(e) =>
                      setState((s) => ({
                        ...s,
                        coupleDetails: {
                          ...s.coupleDetails,
                          groom: {
                            ...s.coupleDetails.groom,
                            parents: { ...s.coupleDetails.groom.parents, father: e.target.value }
                          }
                        }
                      }))
                    }
                    placeholder="Father name"
                  />
                  <Input
                    value={state.coupleDetails.groom.parents.mother}
                    onChange={(e) =>
                      setState((s) => ({
                        ...s,
                        coupleDetails: {
                          ...s.coupleDetails,
                          groom: {
                            ...s.coupleDetails.groom,
                            parents: { ...s.coupleDetails.groom.parents, mother: e.target.value }
                          }
                        }
                      }))
                    }
                    placeholder="Mother name"
                  />
                </div>
              </div>
            ) : (
              <div className="grid gap-3">
                <div className="text-sm font-medium">Host</div>
                <div className="grid gap-1">
                  <label className="text-sm font-medium">Host name / family</label>
                  <Input
                    value={state.hostDetails.hostName}
                    onChange={(e) =>
                      setState((s) => ({
                        ...s,
                        hostDetails: { ...s.hostDetails, hostName: e.target.value }
                      }))
                    }
                    placeholder="Host name"
                  />
                </div>

              <div className="mt-2 grid gap-3 rounded-2xl border bg-background p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium">People list</div>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() =>
                        setState((s) => ({
                          ...s,
                          hostDetails: {
                            ...s.hostDetails,
                            hosts: [...(s.hostDetails.hosts || []), { name: "", role: "" }]
                          }
                        }))
                      }
                    >
                      Add person
                    </Button>
                  </div>

                  {state.hostDetails.hosts?.length ? (
                    <div className="grid gap-3">
                      {state.hostDetails.hosts.map((p, idx) => (
                        <div key={idx} className="grid grid-cols-5 gap-2">
                          <div className="col-span-3">
                            <Input
                              value={p.name}
                              onChange={(e) =>
                                setState((s) => {
                                  const hosts = [...(s.hostDetails.hosts || [])];
                                  hosts[idx] = { ...hosts[idx], name: e.target.value };
                                  return {
                                    ...s,
                                    hostDetails: { ...s.hostDetails, hosts }
                                  };
                                })
                              }
                              placeholder="Name"
                            />
                          </div>
                          <div className="col-span-2">
                            <Input
                              value={p.role || ""}
                              onChange={(e) =>
                                setState((s) => {
                                  const hosts = [...(s.hostDetails.hosts || [])];
                                  hosts[idx] = { ...hosts[idx], role: e.target.value };
                                  return {
                                    ...s,
                                    hostDetails: { ...s.hostDetails, hosts }
                                  };
                                })
                              }
                              placeholder="Role"
                            />
                          </div>
                          <div className="col-span-5">
                            <Button
                              type="button"
                              variant="ghost"
                              className="w-full justify-center"
                              onClick={() =>
                                setState((s) => {
                                  const hosts = [...(s.hostDetails.hosts || [])];
                                  hosts.splice(idx, 1);
                                  return {
                                    ...s,
                                    hostDetails: { ...s.hostDetails, hosts }
                                  };
                                })
                              }
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground">
                      Optional: add family members, hosts, or organizers.
                    </div>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">
                  Couple fields are hidden for this event type.
                </p>
              </div>
            )
          ) : null}

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border bg-background shadow-soft">
        <EventRenderer event={preview} preview />
      </div>
    </div>
  );
}
