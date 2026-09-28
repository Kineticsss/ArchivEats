export type FieldType = 'short' | 'list' | 'text';

export interface FieldDef<K extends string = string> {
  key: K;
  label: string; // shown in the form, the detail page, and used as the doc header
  type: FieldType; // short = one line, list = one item per line, text = free paragraph
  required?: boolean;
  ordered?: boolean; // list fields only: show as a numbered list
  aliases?: readonly string[]; // other doc headers accepted when importing
  example: string; // used for form placeholders and the doc template
}

export const RECIPE_FIELDS = [
  { key: 'name', label: 'Name', type: 'short', required: true, example: 'Carioca' },
  { key: 'category', label: 'Category', type: 'short', example: 'Snack' },
  { key: 'cuisine', label: 'Cuisine', type: 'short', example: 'Filipino' },
  { key: 'origin', label: 'Origin', type: 'short', aliases: ['region'], example: 'Family recipe' },
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
  {
    key: 'equipment',
    label: 'Equipment',
    type: 'list',
    example: 'Frying pan\nBamboo skewers',
  },
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

// The same list, typed so components can use f.key without casts.
export const FIELDS: readonly FieldDef<FieldKey>[] = RECIPE_FIELDS;

// What the form holds: every field is a string (list fields are one item per line).
export type FormValues = Record<FieldKey, string>;

// What Firestore stores: list fields are arrays, everything else is a string.
export type RecipeData = {
  [D in Def as D['key']]: D['type'] extends 'list' ? string[] : string;
};

export type Recipe = RecipeData & { id: string };

export const emptyForm = Object.fromEntries(
  FIELDS.map((f) => [f.key, '']),
) as FormValues;