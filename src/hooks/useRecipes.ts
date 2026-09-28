import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import type { Recipe } from '../config/recipeFields';
import { normalizeRecipe } from '../utils/recipeData';

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'recipes'), orderBy('name'));

    // onSnapshot keeps listening, so the list updates live when data changes.
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setRecipes(snapshot.docs.map((d) => normalizeRecipe(d.id, d.data())));
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  return { recipes, loading, error };
}