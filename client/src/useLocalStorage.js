import { useState } from 'react';

export function useLocalStorage(key, initialValue) {
  const [stored, setStored] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const next = value instanceof Function ? value(stored) : value;
      setStored(next);
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // localStorage no disponible (modo privado, etc.)
    }
  };

  return [stored, setValue];
}
