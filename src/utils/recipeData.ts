import {
  FIELDS,
  fieldVisible,
  type FormValues,
  type Recipe,
  type RecipeData,
} from '../config/recipeFields';

export const toLines = (text: string) =>
  text
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

// Form values -> what we save to Firestore.
// A field hidden by dependsOn (e.g. Variant Category when Authenticity
// isn't "Variant") is saved as empty, even if it still holds an old value.
export function formToData(form: FormValues): RecipeData {
  const out: Record<string, string | string[]> = {};
  for (const f of FIELDS) {
    const raw = fieldVisible(f, form) ? form[f.key] : '';
    out[f.key] = f.type === 'list' ? toLines(raw) : raw.trim();
  }
  return out as RecipeData;
}

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

// A saved Recipe -> form values, for pre-filling the edit form.
// List fields go back to one item per line; everything else is already a string.
export function dataToForm(recipe: Recipe): FormValues {
  const out: Record<string, string> = {};
  for (const f of FIELDS) {
    const value = recipe[f.key];
    out[f.key] = Array.isArray(value) ? value.join('\n') : value;
  }
  return out as FormValues;
}