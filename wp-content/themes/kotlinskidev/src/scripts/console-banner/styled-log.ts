const STYLE_DIRECTIVE = "%c";

export function logStyled(text: string, style: string): void {
  console.log(`${STYLE_DIRECTIVE}${text}`, style);
}

export function logStyledLines(lines: string[], style: string): void {
  console.log(
    lines.map((line) => `${STYLE_DIRECTIVE}${line}`).join("\n"),
    ...lines.map(() => style)
  );
}
