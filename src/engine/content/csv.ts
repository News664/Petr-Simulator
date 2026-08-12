/**
 * Minimal RFC 4180 CSV reader.
 *
 * The Talent and Ending registries are canonical CSV with quoted fields that
 * contain commas and doubled quotes, so a naive split is not sufficient. A
 * dependency-free reader keeps the engine's runtime surface small.
 */

export function parseCsv(input: string): string[][] {
  // Strip a UTF-8 BOM if present; both canonical registries carry one.
  const text = input.charCodeAt(0) === 0xfeff ? input.slice(1) : input;
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  let sawAnyChar = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      sawAnyChar = true;
      continue;
    }
    if (ch === ',') {
      row.push(field);
      field = '';
      sawAnyChar = true;
      continue;
    }
    if (ch === '\r') continue;
    if (ch === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      sawAnyChar = false;
      continue;
    }
    field += ch;
    sawAnyChar = true;
  }
  if (inQuotes) throw new Error('CSV ended inside a quoted field');
  if (field !== '' || row.length > 0 || sawAnyChar) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

export function parseCsvRecords(input: string): Record<string, string>[] {
  const rows = parseCsv(input);
  if (rows.length === 0) return [];
  const header = rows[0]!.map((h) => h.trim());
  return rows.slice(1).map((cells) => {
    const record: Record<string, string> = {};
    header.forEach((key, index) => {
      record[key] = (cells[index] ?? '').trim();
    });
    return record;
  });
}
