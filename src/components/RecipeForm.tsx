import { useState, type ChangeEvent, type FormEvent } from 'react';
import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import {
  FIELDS,
  emptyForm,
  fieldVisible,
  type FieldKey,
  type FormValues,
} from '../config/recipeFields';
import { formToData } from '../utils/recipeData';


const inputClass =
  'w-full rounded border border-neutral-600 bg-neutral-800 px-3 py-2 text-sm';

export default function RecipeForm({
  onDone,
  initial,
  recipeId,
}: {
  onDone: () => void;
  initial?: FormValues;
  recipeId?: string;
}) {
  const [form, setForm] = useState<FormValues>(initial ?? emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set =
    (key: FieldKey) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Name is required');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (recipeId) {
        await updateDoc(doc(db, 'recipes', recipeId), formToData(form));
      } else {
        await addDoc(collection(db, 'recipes'), {
          ...formToData(form),
          createdAt: serverTimestamp(),
        });
      }
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save recipe');
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 space-y-3 rounded border border-neutral-700 p-4"
    >
      <h3 className="text-sm font-semibold text-neutral-300">
        {recipeId ? 'Edit recipe' : initial ? 'Review imported recipe' : 'Add recipe'}
      </h3>

      {FIELDS.map((f) => {
        if (!fieldVisible(f, form)) return null;
        return (
          <label key={f.key} className="block text-sm">
            <span className="text-neutral-400">
              {f.label}
              {f.type === 'list' ? ' (one per line)' : ''}
            </span>
            {f.type === 'select' ? (
              <select className={inputClass} value={form[f.key]} onChange={set(f.key)}>
                <option value="">—</option>
                {f.options!.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : f.type === 'short' ? (
              <input
                className={inputClass}
                value={form[f.key]}
                onChange={set(f.key)}
                required={f.required}
                placeholder={f.example}
              />
            ) : (
              <textarea
                className={`${inputClass} min-h-24`}
                value={form[f.key]}
                onChange={set(f.key)}
                placeholder={f.example}
              />
            )}
          </label>
        );
      })}

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onDone}
          className="rounded border border-neutral-600 px-4 py-2 text-sm hover:bg-neutral-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded bg-orange-500 px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-orange-400 disabled:opacity-50"
        >
          {saving ? 'Saving…' : recipeId ? 'Save changes' : 'Save recipe'}
        </button>
      </div>
    </form>
  );
}