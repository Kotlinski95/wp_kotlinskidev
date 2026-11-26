export interface NumberInfo {
  number: number;
  prefix: string;
  suffix: string;
  decimals: number;
  hasCommas: boolean;
}

const FALLBACK_NUMBER = 100;
const NUMBER_PATTERN = /([^\d]*)(\d{1,3}(?:,\d{3})*(?:\.\d+)?)([^\d]*)/;
const THOUSANDS_GROUP_SIZE = 3;

const insertThousandsSeparators = (integerPart: string): string => {
  const isNegative = integerPart.startsWith("-");
  const digits = isNegative ? integerPart.slice(1) : integerPart;
  const chunks: string[] = [];
  for (let end = digits.length; end > 0; end -= THOUSANDS_GROUP_SIZE) {
    chunks.push(digits.slice(Math.max(0, end - THOUSANDS_GROUP_SIZE), end));
  }
  return (isNegative ? "-" : "") + chunks.reverse().join(",");
};

export const formatNumber = (
  value: number,
  decimals: number = 0,
  useSeparator: boolean = false
): string => {
  const formatted = value.toFixed(decimals);

  if (useSeparator) {
    const parts = formatted.split(".");
    parts[0] = insertThousandsSeparators(parts[0]);
    return parts.join(".");
  }

  return formatted;
};

export const extractNumberInfo = (text: string): NumberInfo => {
  const match = text.match(NUMBER_PATTERN);

  if (match) {
    const number = Number.parseFloat(match[2].replace(/,/g, ""));
    return {
      number: Number.isNaN(number) ? FALLBACK_NUMBER : number,
      prefix: (match[1] || "").trim(),
      suffix: (match[3] || "").trim(),
      decimals: (match[2].split(".")[1] || "").length,
      hasCommas: match[2].includes(","),
    };
  }

  return {
    number: FALLBACK_NUMBER,
    prefix: "",
    suffix: text.replace(/\d+/g, "").trim(),
    decimals: 0,
    hasCommas: false,
  };
};

export const buildCounterText = (info: NumberInfo, value: number): string =>
  `${info.prefix}${formatNumber(value, info.decimals, info.hasCommas)}${info.suffix}`;
