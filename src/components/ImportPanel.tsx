import { useState } from 'react';
import { buildTemplate, parseRecipeText } from '../utils/recipeText';
import type { FormValues } from '../config/recipeFields';

const template = buildTemplate();

export default function ImportPanel({
  onParsed,
  onCancel,
}: {
  onParsed: (values: FormValues) => void;
  onCancel: () => void;
}) {
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState('');

  const copyTemplate = async () => {
    try {
      await navigator.clipboard.writeText(template);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setMessage('Could not copy automatically. Select the template and copy it by hand.');
    }
  };

  const parse = () => {
    if (!text.trim()) {
      setMessage('Paste your recipe text first.');
      return;
    }
    onParsed(parseRecipeText(text));
  };

  return (
    <div className="mb-6 space-y-3 rounded border border-neutral-700 p-4">
      <p className="text-sm text-neutral-400">
        Paste a recipe from Google Docs below. You'll review every field before
        anything is saved. Not sure how to format it? Use this template.
      </p>

      <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded bg-neutral-800 p-3 text-xs text-neutral-400">
        {template}
      </pre>
      <button
        type="button"
        onClick={copyTemplate}
        className="text-xs font-semibold text-orange-400 hover:underline"
      >
        {copied ? 'Copied' : 'Copy this template'}
      </button>

      <textarea
        className="min-h-40 w-full rounded border border-neutral-600 bg-neutral-800 px-3 py-2 text-sm"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste your Google Doc content here…"
      />

      {message && <p className="text-sm text-red-400">{message}</p>}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded border border-neutral-600 px-4 py-2 text-sm hover:bg-neutral-800"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={parse}
          className="rounded bg-orange-500 px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-orange-400"
        >
          Parse &amp; review
        </button>
      </div>
    </div>
  );
}