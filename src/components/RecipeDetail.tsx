import type { ReactNode } from 'react';
import { FIELDS, isInline, type Recipe } from '../config/recipeFields';

// These two are shown as the page heading, not in the details row.
const HEADER_KEYS = ['name', 'category'];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-6">
      <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-orange-400">
        {title}
      </h3>
      {children}
    </section>
  );
}

export default function RecipeDetail({
  recipe: r,
  onBack,
  isOwner,
  onEdit,
  onDelete,
}: {
  recipe: Recipe;
  onBack: () => void;
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const facts = FIELDS.filter(
    (f) =>
      isInline(f.type) &&
      !HEADER_KEYS.includes(f.key) &&
      (!f.dependsOn || r[f.dependsOn.key as keyof Recipe] === f.dependsOn.equals),
  )
    .map((f) => ({ label: f.label, value: r[f.key] as string }))
    .filter((fact) => fact.value);

  const sections = FIELDS.filter((f) => !isInline(f.type));

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-4 text-sm text-neutral-400 hover:text-neutral-100"
      >
        ← All recipes
      </button>

      <h2 className="text-2xl font-bold">{r.name}</h2>
      {r.category && <p className="text-neutral-400">{r.category}</p>}
            {isOwner && (
        <div className="mt-3 flex gap-3">
          <button
            onClick={onEdit}
            className="text-sm text-orange-400 hover:underline"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="text-sm text-red-400 hover:underline"
          >
            Delete
          </button>
        </div>
      )}

      {facts.length > 0 && (
        <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {facts.map((fact) => (
            <div key={fact.label} className="flex gap-1">
              <dt className="text-neutral-500">{fact.label}</dt>
              <dd className="text-neutral-300">{fact.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {sections.map((f) => {
        const value = r[f.key];

        if (Array.isArray(value)) {
          if (value.length === 0) return null;
          const List = f.ordered ? 'ol' : 'ul';
          return (
            <Section key={f.key} title={f.label}>
              <List
                className={`${f.ordered ? 'list-decimal' : 'list-disc'} space-y-1 pl-5`}
              >
                {value.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </List>
            </Section>
          );
        }

        if (!value) return null;
        return (
          <Section key={f.key} title={f.label}>
            <p className="whitespace-pre-wrap rounded bg-neutral-800 px-3 py-2 text-sm">
              {value}
            </p>
          </Section>
        );
      })}
    </div>
  );
}