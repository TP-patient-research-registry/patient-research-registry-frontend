/** RFC 4180 CSV with a BOM so Excel opens UTF-8 (Slovak diacritics) correctly. */
export function toCsv(rows: (string | number | null | undefined)[][]): string {
  const cell = (value: string | number | null | undefined) => {
    const text = value == null ? "" : String(value);
    // Neutralise spreadsheet formula injection.
    const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
    return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  };
  return "﻿" + rows.map((row) => row.map(cell).join(",")).join("\r\n");
}

export function downloadFile(content: BlobPart, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
