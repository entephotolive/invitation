import type { ReligionId, ThemeConfig } from "@/themes/types";

export const RELIGIONS: { id: ReligionId; label: string; description: string }[] =
  [
    {
      id: "islamic",
      label: "Islamic",
      description: "Gold + ivory with geometric, elegant motifs."
    },
    {
      id: "hindu",
      label: "Hindu",
      description: "Maroon + gold with traditional festive warmth."
    },
    {
      id: "christian",
      label: "Christian",
      description: "White + pastels with minimal elegance."
    },
    {
      id: "neutral",
      label: "Neutral",
      description: "Modern minimal palette, works for any event."
    }
  ];

export const THEME_PRESETS: ThemeConfig[] = [
  {
    name: "Sultanate",
    religion: "islamic",
    layoutStyle: "luxury",
    animationStyle: "soft",
    colors: { primary: "#D4AF37", secondary: "#FCFBF7", accent: "#1B5E4A" },
    headingText: "بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ",
    pattern: "islamic",
    fontPairing: { heading: "serif", body: "serif" }
  },
  {
    name: "Noor",
    religion: "islamic",
    layoutStyle: "classic",
    animationStyle: "soft",
    colors: { primary: "#C5A059", secondary: "#FFF7E6", accent: "#84927A" },
    headingText: "Save the Date",
    pattern: "geometric",
    fontPairing: { heading: "serif", body: "sans" }
  },
  {
    name: "Mosaic",
    religion: "islamic",
    layoutStyle: "modern",
    animationStyle: "bold",
    colors: { primary: "#C5A059", secondary: "#FFFFFF", accent: "#2F6F5E" },
    headingText: "Save the Date",
    pattern: "dots",
    fontPairing: { heading: "sans", body: "sans" }
  },
  {
    name: "Mandap",
    religion: "hindu",
    layoutStyle: "classic",
    animationStyle: "bold",
    colors: { primary: "#800020", secondary: "#FFF9E5", accent: "#D4AF37" },
    headingText: "ॐ श्री गणेशाय नमः",
    pattern: "mandala",
    fontPairing: { heading: "serif", body: "serif" }
  },
  {
    name: "Lotus",
    religion: "hindu",
    layoutStyle: "luxury",
    animationStyle: "soft",
    colors: { primary: "#7A1F2B", secondary: "#FFF6EE", accent: "#F59E0B" },
    headingText: "Save the Date",
    pattern: "dots",
    fontPairing: { heading: "serif", body: "sans" }
  },
  {
    name: "Rajwada",
    religion: "hindu",
    layoutStyle: "classic",
    animationStyle: "soft",
    colors: { primary: "#7C2D12", secondary: "#FFF7ED", accent: "#D4AF37" },
    headingText: "शुभ विवाह",
    pattern: "geometric",
    fontPairing: { heading: "serif", body: "serif" }
  },
  {
    name: "Chapel",
    religion: "christian",
    layoutStyle: "classic",
    animationStyle: "soft",
    colors: { primary: "#5A6378", secondary: "#FFFFFF", accent: "#D4AF37" },
    headingText: "In God's Grace",
    pattern: "floral",
    fontPairing: { heading: "serif", body: "sans" }
  },
  {
    name: "Pastel",
    religion: "christian",
    layoutStyle: "modern",
    animationStyle: "soft",
    colors: { primary: "#4F46E5", secondary: "#FFFFFF", accent: "#F59E0B" },
    headingText: "Save the Date",
    pattern: "minimal",
    fontPairing: { heading: "sans", body: "sans" }
  },
  {
    name: "Dove",
    religion: "christian",
    layoutStyle: "luxury",
    animationStyle: "soft",
    colors: { primary: "#111827", secondary: "#FFFFFF", accent: "#D4AF37" },
    headingText: "With Love",
    pattern: "floral",
    fontPairing: { heading: "serif", body: "sans" }
  },
  {
    name: "Studio",
    religion: "neutral",
    layoutStyle: "modern",
    animationStyle: "soft",
    colors: { primary: "#18181B", secondary: "#FAFAFA", accent: "#71717A" },
    headingText: "Save the Date",
    pattern: "minimal",
    fontPairing: { heading: "sans", body: "sans" }
  },
  {
    name: "Mono",
    religion: "neutral",
    layoutStyle: "modern",
    animationStyle: "none",
    colors: { primary: "#0F172A", secondary: "#FFFFFF", accent: "#2563EB" },
    headingText: "Event Invitation",
    pattern: "geometric",
    fontPairing: { heading: "sans", body: "sans" }
  }
];

export function defaultThemeForReligion(religion: ReligionId): ThemeConfig {
  return (
    THEME_PRESETS.find((t) => t.religion === religion) ??
    THEME_PRESETS[THEME_PRESETS.length - 1]
  );
}
