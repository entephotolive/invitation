export type EventType =
  | "wedding"
  | "reception"
  | "engagement"
  | "housewarming"
  | "birthday"
  | "generic";

export type ReligionId = "islamic" | "hindu" | "christian" | "neutral";

export type LayoutStyle = "classic" | "luxury" | "modern";

export type AnimationStyle = "soft" | "bold" | "none";

export type FontTone = "serif" | "sans";

export type PatternId =
  | "islamic"
  | "mandala"
  | "floral"
  | "minimal"
  | "geometric"
  | "dots";

export type ThemeColors = {
  primary: string; // hex, e.g. #D4AF37
  secondary: string; // hex
  accent: string; // hex
};

export type FontPairing = {
  heading: FontTone;
  body: FontTone;
};

export type ThemeConfig = {
  name: string;
  religion: ReligionId;
  layoutStyle: LayoutStyle;
  animationStyle: AnimationStyle;
  colors: ThemeColors;
  headingText: string;
  pattern: PatternId;
  fontPairing: FontPairing;
};
