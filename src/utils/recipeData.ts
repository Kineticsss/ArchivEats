import {
  FIELDS,
  type FormValues,
  type Recipe,
  type RecipeData,
} from '../config/recipeFields';

// "a\nb\n\nc" becomes ['a', 'b', 'c']
export const toLines = (text: string) =>
  text
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

// Form values -> what we save to Firestore
export function formToData(form: FormValues): RecipeData {
  const out: Record<string, string | string[]> = {};
  for (const f of FIELDS) {
    out[f.key] = f.type === 'list' ? toLines(form[f.key]) : form[f.key].trim();
  }
  return out as RecipeData;
}

// A Firestore document -> a Recipe the UI can trust,
// even if the document is missing fields (older recipes, hand-made ones).
export function normalizeRecipe(id: string, data: Record<string, unknown>): Recipe {
  const out: Record<string, string | string[]> = { id };
  for (const f of FIELDS) {
    const value = data[f.key];
    if (f.type === 'list') {
      out[f.key] = Array.isArray(value) ? value.map(String) : [];
    } else {
      out[f.key] = typeof value === 'string' ? value : '';
    }
  }
  if (!out.name) out.name = 'Untitled';
  return out as Recipe;
}