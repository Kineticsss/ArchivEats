import { useState } from 'react';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from './hooks/useAuth';
import { useRecipes } from './hooks/useRecipes';
import RecipeForm from './components/RecipeForm';
import RecipeDetail from './components/RecipeDetail';
import ImportPanel from './components/ImportPanel';
import { dataToForm } from './utils/recipeData';
import type { FormValues } from './config/recipeFields';

type Mode = 'idle' | 'add' | 'import' | 'review';

export default function App() {
  const { user, loading: authLoading, signIn, logOut } = useAuth();
  const { recipes, loading: recipesLoading, error } = useRecipes();
  const [mode, setMode] = useState<Mode>('idle');
  const [imported, setImported] = useState<FormValues | undefined>();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // UI convenience only. The real protection is the Firestore rules.
  const isOwner = !!user && user.uid === import.meta.env.VITE_OWNER_UID;

  const selected = recipes.find((r) => r.id === selectedId) ?? null;
  const editingRecipe = recipes.find((r) => r.id === editingId) ?? null;

  const closePanel = () => {
    setMode('idle');
    setImported(undefined);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this recipe? This cannot be undone.')) return;
    await deleteDoc(doc(db, 'recipes', id));
    setSelectedId(null);
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 px-6 py-10">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-orange-400">ArchivEats</h1>

          {authLoading ? null : user ? (
            <button
              onClick={logOut}
              className="text-sm px-3 py-1.5 rounded border border-neutral-600 hover:bg-neutral-800"
            >
              Sign out ({user.displayName ?? user.email})
            </button>
          ) : (
            <button
              onClick={signIn}
              className="text-sm px-3 py-1.5 rounded bg-orange-500 text-neutral-900 font-semibold hover:bg-orange-400"
            >
              Sign in with Google
            </button>
          )}
        </div>

        {editingRecipe ? (
          <RecipeForm
            recipeId={editingRecipe.id}
            initial={dataToForm(editingRecipe)}
            onDone={() => setEditingId(null)}
          />
        ) : selected ? (
          <RecipeDetail
            recipe={selected}
            onBack={() => setSelectedId(null)}
            isOwner={isOwner}
            onEdit={() => setEditingId(selected.id)}
            onDelete={() => handleDelete(selected.id)}
          />
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Recipes</h2>
              {isOwner && mode === 'idle' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setMode('import')}
                    className="text-sm px-3 py-1.5 rounded border border-neutral-600 hover:bg-neutral-800"
                  >
                    Import from Google Doc
                  </button>
                  <button
                    onClick={() => setMode('add')}
                    className="text-sm px-3 py-1.5 rounded border border-orange-500 text-orange-400 hover:bg-neutral-800"
                  >
                    + Add recipe
                  </button>
                </div>
              )}
            </div>

            {isOwner && mode === 'add' && <RecipeForm onDone={closePanel} />}
            {isOwner && mode === 'import' && (
              <ImportPanel
                onCancel={closePanel}
                onParsed={(values) => {
                  setImported(values);
                  setMode('review');
                }}
              />
            )}
            {isOwner && mode === 'review' && (
              <RecipeForm initial={imported} onDone={closePanel} />
            )}

            {error && (
              <p className="text-red-400">Could not load recipes: {error}</p>
            )}
            {recipesLoading && <p className="text-neutral-400">Loading…</p>}
            {!recipesLoading && !error && recipes.length === 0 && (
              <p className="text-neutral-400">No recipes yet.</p>
            )}

            <ul className="space-y-2">
              {recipes.map((r) => (
                <li key={r.id}>
                  <button
                    onClick={() => setSelectedId(r.id)}
                    className="w-full rounded border border-neutral-700 px-4 py-3 text-left hover:bg-neutral-800"
                  >
                    <div className="font-semibold">{r.name}</div>
                    {r.category && (
                      <div className="text-sm text-neutral-400">{r.category}</div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}