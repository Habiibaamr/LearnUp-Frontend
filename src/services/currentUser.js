import { apiClient } from "./apiClient.js";
import { getCurrentSession } from "../utils/learnupRecords.js";

export const readStoredCurrentUser = () => {
  try {
    return JSON.parse(window.localStorage.getItem("learnup_current_user") || "null");
  } catch {
    return null;
  }
};

export const getCurrentUserSnapshot = () => {
  const storedUser = readStoredCurrentUser() || {};
  const session = getCurrentSession() || {};

  return {
    ...storedUser,
    ...session,
    full_name:
      storedUser.full_name ||
      storedUser.fullName ||
      storedUser.name ||
      session.full_name ||
      session.fullName ||
      session.name,
    email: storedUser.email || session.email,
    role: storedUser.role || session.role,
  };
};

export async function fetchCurrentUser() {
  try {
    const user = await apiClient.get("/auth/me");
    if (user) {
      window.localStorage.setItem("learnup_current_user", JSON.stringify(user));
      return user;
    }
  } catch (error) {
    if (error?.status === 401) {
      throw error;
    }
  }

  return getCurrentUserSnapshot();
}
