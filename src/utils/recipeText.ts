import {
  FIELDS,
  emptyForm,
  type FieldDef,
  type FieldKey,
  type FormValues,
} from '../config/recipeFields';

const normalize = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase();

// Every header we accept (label + aliases) -> the field it fills
const HEADERS = new Map<string, FieldDef<FieldKey>>();
for (const f of FIELDS) {
  for (const name of [f.label, ...(f.aliases ?? [])]) {
    HEADERS.set(normalize(name), f);
  }
}

// The doc template, generated from the field config
export function buildTemplate(): string {
  const out: string[] = [];
  for (const f of FIELDS) {
    if (f.type === 'short') {
      out.push(`${f.label}: ${f.example}`);
      continue;
    }
    out.push('', `${f.label}:`);
    if (f.type === 'list') {
      out.push(...f.example.split('\n').map((item) => `- ${item}`));
    } else {
      out.push(f.example);
    }
  }
  return out.join('\n');
}

// Removes bullets ("- ", "* ", "• ", "● ") and numbering ("1. ", "1) ") from a line
const stripMarker = (line: string) =>
  line
    .replace(/^[-*•●○■▪◦‣–—]\s*/, '')
    .replace(/^\d+[.)]\s*/, '')
    .trim();

export function parseRecipeText(raw: string): FormValues {
  const collected: Partial<Record<FieldKey, string[]>> = {};
  const values: FormValues = { ...emptyForm };
  let current: FieldDef<FieldKey> | null = null;

  const push = (f: FieldDef<FieldKey>, text: string) => {
    (collected[f.key] ??= []).push(f.type === 'list' ? stripMarker(text) : text);
  };

  for (const line of raw.replace(/\r/g, '').split('\n')) {
    const text = line.trim();
    if (!text) continue;

    // A heading on its own line, with no colon ("Ingredients")
    const bare = HEADERS.get(normalize(text));
    if (bare && bare.type !== 'short') {
      current = bare;
      continue;
    }

    const match = text.match(/^([A-Za-z /]+):\s*(.*)$/);
    const field = match ? HEADERS.get(normalize(match[1])) : undefined;

    if (match && field) {
      const rest = match[2].trim();
      if (field.type === 'short' && rest) {
        values[field.key] = rest;
        current = null;
      } else {
        // A section header, or a one-line field whose value is on the next line
        current = field;
        if (rest) push(field, rest);
      }
      continue;
    }

    if (current) push(current, text);
  }

  for (const f of FIELDS) {
    const lines = collected[f.key];
    if (lines) values[f.key] = lines.join(f.type === 'short' ? ' ' : '\n');
  }
  return values;
}