// components/Text.tsx
import {
    Text as RNText,
    TextProps as RNTextProps,
    TextStyle,
} from "react-native";

const FONT_FAMILY: Record<string, string> = {
  normal: "Plus-Jakarta-Sans",
  medium: "Plus-Jakarta-Sans-Medium",
  semibold: "Plus-Jakarta-Sans-SemiBold",
  bold: "Plus-Jakarta-Sans-Bold",
};

interface TextProps extends RNTextProps {
  weight?: keyof typeof FONT_FAMILY;
}

function getFontFamily(
  weight?: keyof typeof FONT_FAMILY,
  style?: RNTextProps["style"],
): string {
  // 1. Explicit weight prop → prioritas tertinggi
  if (weight) return FONT_FAMILY[weight];

  // 2. Deteksi fontWeight dari style
  let fontWeight: TextStyle["fontWeight"] | undefined;

  if (Array.isArray(style)) {
    for (const s of style) {
      if (s && "fontWeight" in s) {
        fontWeight = (s as TextStyle).fontWeight;
        break;
      }
    }
  } else if (style && "fontWeight" in style) {
    fontWeight = (style as TextStyle).fontWeight;
  }

  // 3. Mapping fontWeight → fontFamily
  switch (fontWeight) {
    case "bold":
    case "700":
    case "800":
    case "900":
      return FONT_FAMILY.bold;
    case "600":
    case "semibold":
      return FONT_FAMILY.semibold;
    case "500":
    case "medium":
      return FONT_FAMILY.medium;
    default:
      return FONT_FAMILY.normal;
  }
}

export default function Text({ weight, style, ...props }: TextProps) {
  return (
    <RNText
      {...props}
      style={[{ fontFamily: getFontFamily(weight, style) }, style]}
    />
  );
}
