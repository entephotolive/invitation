import type { CSSProperties } from "react";
import { hexToHslComponents, pickForegroundHslComponents } from "@/lib/colors";
import type { ThemeConfig } from "@/themes/types";

export function themeClasses(theme: ThemeConfig) {
  const bodyFontClass = theme.fontPairing.body === "sans" ? "font-inter" : "font-cormorant";
  const headingFontClass =
    theme.fontPairing.heading === "sans" ? "font-inter" : "font-playfair";

  return {
    rootClass: `layout-${theme.layoutStyle} religion-${theme.religion} pattern-${theme.pattern}`,
    fontClass: bodyFontClass,
    headingClass: headingFontClass
  };
}

export function themeCssVars(theme: ThemeConfig): CSSProperties {
  const primary = hexToHslComponents(theme.colors.primary);
  const secondary = hexToHslComponents(theme.colors.secondary);
  const accent = hexToHslComponents(theme.colors.accent);

  // Base UI tokens derived from secondary + contrast foreground.
  const foreground = pickForegroundHslComponents(theme.colors.secondary);

  return {
    // user-facing palette
    ["--theme-primary" as any]: primary,
    ["--theme-secondary" as any]: secondary,
    ["--theme-accent" as any]: accent,

    // app tokens (Tailwind uses these)
    ["--background" as any]: secondary,
    ["--foreground" as any]: foreground,
    ["--card" as any]: secondary,
    ["--card-foreground" as any]: foreground,
    ["--muted" as any]: secondary,
    ["--muted-foreground" as any]: foreground,
    ["--border" as any]: secondary,
    ["--ring" as any]: accent
  };
}

export function motionPreset(animationStyle: ThemeConfig["animationStyle"]) {
  if (animationStyle === "none") return { duration: 0 };
  if (animationStyle === "bold") return { duration: 0.9, ease: [0.2, 0.9, 0.2, 1] as any };
  return { duration: 0.6, ease: [0.2, 0.8, 0.2, 1] as any };
}
