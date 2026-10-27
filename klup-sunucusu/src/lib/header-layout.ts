// Reserve room for the overflow trigger before choosing the visible prefix.
export function visibleHeaderEntries(widths: readonly number[], available: number, moreWidth: number) {
  if (widths.reduce((sum, width) => sum + width, 0) <= available) return widths.length;
  let used = moreWidth, count = 0;
  for (const width of widths) {
    if (used + width > available) break;
    used += width; count++;
  }
  return count;
}
