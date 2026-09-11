import themeJson from "../theme.json";

interface PresetEntry {
  slug: string;
  size?: string;
  color?: string;
  gradient?: string;
}

function presetDeclarations(prefix: string, entries: PresetEntry[] | undefined): string[] {
  if (!entries) {
    return [];
  }
  return entries.map((entry) => `--wp--preset--${prefix}--${entry.slug}: ${entry.color ?? entry.size ?? entry.gradient};`);
}

export function buildWpPresetStylesheet(): string {
  const settings = (themeJson as { settings?: Record<string, unknown> }).settings ?? {};
  const color = settings.color as { palette?: PresetEntry[]; gradients?: PresetEntry[] } | undefined;
  const spacing = settings.spacing as { spacingSizes?: PresetEntry[] } | undefined;
  const typography = settings.typography as { fontSizes?: PresetEntry[] } | undefined;

  const declarations = [
    ...presetDeclarations("color", color?.palette),
    ...presetDeclarations("gradient", color?.gradients),
    ...presetDeclarations("spacing", spacing?.spacingSizes),
    ...presetDeclarations("font-size", typography?.fontSizes),
  ];

  return `:root {\n${declarations.map((line) => `  ${line}`).join("\n")}\n}`;
}
