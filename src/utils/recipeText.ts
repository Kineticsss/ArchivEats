import {
  FIELDS,
  emptyForm,
  isInline,
  type FieldDef,
  type FieldKey,
  type FormValues,
} from '../config/recipeFields';

const normalize = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase();

const HEADERS = new Map<string, FieldDef<FieldKey>>();
for (const f of FIELDS) {
  for (const name of [f.label, ...(f.aliases ?? [])]) {
    HEADERS.set(normalize(name), f);
  }
}

export function buildTemplate(): string {
  const out: string[] = [];
  for (const f of FIELDS) {
    if (isInline(f.type)) {
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

    const bare = HEADERS.get(normalize(text));
    if (bare && !isInline(bare.type)) {
      current = bare;
      continue;
    }

    const match = text.match(/^([A-Za-z /]+):\s*(.*)$/);
    const field = match ? HEADERS.get(normalize(match[1])) : undefined;

    if (match && field) {
      const rest = match[2].trim();
      if (isInline(field.type) && rest) {
        values[field.key] = rest;
        current = null;
      } else {
        current = field;
        if (rest) push(field, rest);
      }
      continue;
    }

    if (current) push(current, text);
  }

  for (const f of FIELDS) {
    const lines = collected[f.key];
    if (lines) values[f.key] = lines.join(isInline(f.type) ? ' ' : '\n');
  }
  return values;
}