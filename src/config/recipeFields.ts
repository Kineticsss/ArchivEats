export type FieldType = 'short' | 'select' | 'list' | 'text';

export interface FieldDef<K extends string = string> {
  key: K;
  label: string;
  type: FieldType;
  required?: boolean;
  ordered?: boolean;
  options?: readonly string[]; // select fields only
  dependsOn?: { key: string; equals: string }; // only shown/saved when another field has this value
  aliases?: readonly string[];
  example: string;
}

// Fields that are written/read as a single line ("Label: value"),
// as opposed to 'list' and 'text' which span multiple lines.
export const isInline = (type: FieldType) => type === 'short' || type === 'select';

export const RECIPE_FIELDS = [
  { key: 'name', label: 'Name', type: 'short', required: true, example: 'Carioca' },
  { key: 'category', label: 'Category', type: 'short', example: 'Snack' },
  { key: 'cuisine', label: 'Cuisine', type: 'short', example: 'Filipino' },
  { key: 'origin', label: 'Origin', type: 'short', aliases: ['region'], example: 'Family recipe' },
  {
    key: 'authenticity',
    label: 'Authenticity',
    type: 'select',
    options: ['Authentic', 'Variant'],
    example: 'Authentic',
  },
  {
    key: 'variantCategory',
    label: 'Variant Category',
    type: 'select',
    options: ['Family', 'Regional', 'Fusion', 'Other'],
    dependsOn: { key: 'authenticity', equals: 'Variant' },
    aliases: ['variant type'],
    example: 'Family',
  },
  { key: 'servings', label: 'Servings', type: 'short', aliases: ['yield'], example: '20 balls' },
  { key: 'difficulty', label: 'Difficulty', type: 'short', example: 'Easy' },
  { key: 'prepTime', label: 'Prep Time', type: 'short', aliases: ['prep'], example: '15 min' },
  { key: 'cookTime', label: 'Cook Time', type: 'short', aliases: ['cook'], example: '20 min' },
  {
    key: 'ingredientsMain',
    label: 'Ingredients',
    type: 'list',
    example: 'Glutinous rice flour\nWater\nBrown sugar',
  },
  {
    key: 'ingredientsOptional',
    label: 'Optional Ingredients',
    type: 'list',
    example: 'All-purpose flour, for a sturdier exterior',
  },
  { key: 'equipment', label: 'Equipment', type: 'list', example: 'Frying pan\nBamboo skewers' },
  {
    key: 'steps',
    label: 'Steps',
    type: 'list',
    ordered: true,
    aliases: ['instructions', 'directions', 'method'],
    example:
      'Mix flour and water into a smooth dough.\nRoll into balls and poke a small hole in each.\nFry at medium-low, stirring, until golden.',
  },
  {
    key: 'heatNotes',
    label: 'Heat Notes',
    type: 'text',
    aliases: ['heat / temperature notes'],
    example: 'Fry at medium-low to avoid bursting.',
  },
  {
    key: 'doneness',
    label: 'Doneness Cues',
    type: 'text',
    aliases: ['doneness'],
    example: 'Balls float; sugar turns glossy amber.',
  },
] as const satisfies readonly FieldDef[];

type Def = (typeof RECIPE_FIELDS)[number];
export type FieldKey = Def['key'];
export const FIELDS: readonly FieldDef<FieldKey>[] = RECIPE_FIELDS;

export type FormValues = Record<FieldKey, string>;
export type RecipeData = {
  [D in Def as D['key']]: D['type'] extends 'list' ? string[] : string;
};
export type Recipe = RecipeData & { id: string };

export const emptyForm = Object.fromEntries(FIELDS.map((f) => [f.key, ''])) as FormValues;

// Whether a field should currently be shown/saved, given the rest of the form.
export function fieldVisible(f: FieldDef<FieldKey>, values: FormValues): boolean {
  if (!f.dependsOn) return true;
  return values[f.dependsOn.key as FieldKey] === f.dependsOn.equals;
}