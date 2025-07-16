export const formatValue = (value) =>
  Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumSignificantDigits: 3,
    notation: "compact",
  }).format(value);

export const formatThousands = (value) =>
  Intl.NumberFormat("en-US", {
    maximumSignificantDigits: 3,
    notation: "compact",
  }).format(value);

// Safely get the actual CSS value of a variable
export const getCssVariable = (variable) => {
  if (typeof window === "undefined") return "";
  return getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim();
};

const adjustHexOpacity = (hexColor, opacity) => {
  hexColor = hexColor.replace("#", "");
  const r = parseInt(hexColor.substring(0, 2), 16);
  const g = parseInt(hexColor.substring(2, 4), 16);
  const b = parseInt(hexColor.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const adjustHSLOpacity = (hslColor, opacity) => {
  return hslColor.replace("hsl(", "hsla(").replace(")", `, ${opacity})`);
};

// Adjust OKLCH color opacity
const adjustOKLCHOpacity = (oklchColor, opacity) => {
  return oklchColor.replace(
    /oklch\((.*?)\)/,
    (match, p1) => `oklch(${p1} / ${opacity})`
  );
};

// Main color adjuster
export const adjustColorOpacity = (color, opacity) => {
  if (!color) return "";

  if (color.startsWith("#")) {
    return adjustHexOpacity(color, opacity);
  } else if (color.startsWith("hsl")) {
    return adjustHSLOpacity(color, opacity);
  } else if (color.startsWith("oklch")) {
    return adjustOKLCHOpacity(color, opacity);
  }

  throw new Error(`Unsupported color format: ${color}`);
};

export const oklchToRGBA = (oklchColor) => {
  // Create a temporary div to use for color conversion
  const tempDiv = document.createElement("div");
  tempDiv.style.color = oklchColor;
  document.body.appendChild(tempDiv);

  // Get the computed style and convert to RGB
  const computedColor = window.getComputedStyle(tempDiv).color;
  document.body.removeChild(tempDiv);

  return computedColor;
};
