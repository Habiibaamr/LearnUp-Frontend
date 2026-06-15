const getLocalStorage = () => {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }

  return window.localStorage;
};

export const setItem = (key, value) => {
  try {
    const storage = getLocalStorage();

    if (!storage) {
      return;
    }

    storage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage may be unavailable in private mode or during SSR.
  }
};

export const getItem = (key) => {
  try {
    const storage = getLocalStorage();

    if (!storage) {
      return null;
    }

    const value = storage.getItem(key);

    if (value === null) {
      return null;
    }

    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  } catch {
    return null;
  }
};

export const removeItem = (key) => {
  try {
    const storage = getLocalStorage();

    if (!storage) {
      return;
    }

    storage.removeItem(key);
  } catch {
    // localStorage may be unavailable in private mode or during SSR.
  }
};

export const clearStorage = () => {
  try {
    const storage = getLocalStorage();

    if (!storage) {
      return;
    }

    storage.clear();
  } catch {
    // localStorage may be unavailable in private mode or during SSR.
  }
};
