import { getItem, removeItem, setItem } from "./storage.js";

const USER_STORAGE_KEY = "learnup_user";

export const saveUser = (user) => {
  setItem(USER_STORAGE_KEY, user);
};

export const getUser = () => getItem(USER_STORAGE_KEY);

export const logoutUser = () => {
  removeItem(USER_STORAGE_KEY);
};

export const isAuthenticated = () => Boolean(getUser());
