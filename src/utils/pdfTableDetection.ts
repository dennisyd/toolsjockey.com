export type PDFTextItem = {
  str: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
};

// Utility: Compute median of an array
function median(arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

// Group text items into rows using a dynamic Y-threshold
export function groupByRowsDynamic(
  items: PDFTextItem[],
  minRows = 2
): PDFTextItem[][] {
  if (items.length === 0) return [];
  // Sort by Y descending (PDF y=0 is bottom)
  const sorted = [...items].sort((a, b) => b.y - a.y);
  // Estimate median Y-gap
  const yVals = sorted.map(i => i.y);
  const yGaps = yVals.slice(1).map((y, i) => Math.abs(y - yVals[i]));
  const yThreshold = median(yGaps.length ? yGaps : [2]) || 2;
  // Group by Y
  const rows: { y: number; items: PDFTextItem[] }[] = [];
  sorted.forEach(item => {
    let row = rows.find(r => Math.abs(r.y - item.y) <= yThreshold);
    if (!row) {
      row = { y: item.y, items: [] };
      rows.push(row);
    }
    row.items.push(item);
  });
  // Filter out rows with too few items
  return rows.map(r => r.items).filter(r => r.length >= minRows);
}

// Improved: Use both x and width to cluster columns, merging overlapping/adjacent bounds
export function estimateColumnsAdvanced(
  rows: PDFTextItem[][],
  minColCount = 2,
  tolerance = 10
): number[] {
  const allBounds: { left: number; right: number }[] = [];
  rows.forEach(row => {
    row.forEach(item => {
      const left = item.x;
      const right = item.x + (item.width || 0);
      allBounds.push({ left, right });
    });
  });
  // Sort by left edge
  allBounds.sort((a, b) => a.left - b.left);
  // Cluster bounds by overlap/adjacency
  const clusters: { left: number; right: number }[] = [];
  allBounds.forEach(bound => {
    const last = clusters[clusters.length - 1];
    if (last && bound.left - last.right < tolerance) {
      last.right = Math.max(last.right, bound.right);
    } else {
      clusters.push({ ...bound });
    }
  });
  // Use cluster centers as column positions
  const colPositions = clusters.map(c => (c.left + c.right) / 2);
  return colPositions.length >= minColCount ? colPositions : [];
}

// Snap each cell to nearest column
export function convertToAlignedTable(
  rows: PDFTextItem[][],
  columns: number[]
): string[][] {
  return rows.map(row => {
    const cells = Array(columns.length).fill('');
    row.forEach(item => {
      let colIdx = 0;
      let minDist = Math.abs(item.x - columns[0]);
      for (let i = 1; i < columns.length; i++) {
        const dist = Math.abs(item.x - columns[i]);
        if (dist < minDist) {
          minDist = dist;
          colIdx = i;
        }
      }
      cells[colIdx] = (cells[colIdx] ? cells[colIdx] + ' ' : '') + item.str;
    });
    return cells;
  });
}

// Main: Extract all tables from a page's text items
export function extractTablesFromTextItems(
  items: PDFTextItem[],
  minRows = 2,
  minCols = 2
): string[][][] {
  // 1. Group into rows (dynamic threshold)
  const rows = groupByRowsDynamic(items, minRows);
  if (rows.length < minRows) return [];
  // 2. Estimate columns (improved)
  const columns = estimateColumnsAdvanced(rows, minCols);
  if (columns.length < minCols) return [];
  // 3. Align cells to columns
  const table = convertToAlignedTable(rows, columns);
  // 4. Optionally, split into multiple tables if there are large vertical gaps (future improvement)
  return [table];
} 