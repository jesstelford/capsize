interface FontMetrics {
  familyName: string;
  subfamilyName: string;
  ascent: number;
  descent: number;
  lineGap: number;
  unitsPerEm: number;
  capHeight: number;
}
interface CapsizeOptions {
  leading?: number;
  gap?: number;
  capHeight: number;
  fontMetrics: FontMetrics;
}

export default function createCss({
  leading,
  gap,
  capHeight,
  fontMetrics,
}: CapsizeOptions) {
  if (typeof leading !== 'undefined' && typeof gap !== 'undefined') {
    throw new Error(
      'Only a single line height style can be provided. Please pass either `gap` OR `leading`.',
    );
  }

  const capHeightRatio = fontMetrics.capHeight / fontMetrics.unitsPerEm;
  const capSize = capHeight / capHeightRatio;

  const absoluteDescent = Math.abs(fontMetrics.descent);

  const descentRatio = absoluteDescent / fontMetrics.unitsPerEm;
  const ascentRatio = fontMetrics.ascent / fontMetrics.unitsPerEm;

  const contentArea = fontMetrics.ascent + absoluteDescent;
  const lineHeight = contentArea + fontMetrics.lineGap;
  const lineHeightScale = lineHeight / fontMetrics.unitsPerEm;
  const lineHeightNormal = lineHeightScale * capSize;

  const hasSpecifiedLineHeight =
    typeof leading !== 'undefined' || typeof gap !== 'undefined';

  const specifiedLineHeight =
    typeof gap !== 'undefined' ? capHeight + gap : leading;

  const offset =
    hasSpecifiedLineHeight && typeof specifiedLineHeight === 'number'
      ? lineHeightNormal - specifiedLineHeight
      : lineHeightNormal;

  // Basekick
  const descenderTransformOffsetForLeading = hasSpecifiedLineHeight
    ? offset / 2 / capSize
    : 0;
  const descenderTransform = descentRatio - descenderTransformOffsetForLeading;

  // Top Crop
  const distanceTopOffsetForLeading = hasSpecifiedLineHeight
    ? offset / capSize
    : 0;
  const distanceTop =
    ascentRatio - capHeightRatio + descentRatio - distanceTopOffsetForLeading;

  return {
    fontSize: `${capSize}px`,
    ...(hasSpecifiedLineHeight && { lineHeight: `${specifiedLineHeight}px` }),
    transform: `translateY(${descenderTransform}em)`,
    paddingTop: '0.05px',
    marginTop: `${-distanceTop}em`,
  };
}
