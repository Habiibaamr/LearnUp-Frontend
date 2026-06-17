import { mapBackendStudent } from "./adminAccounts.js";
import { apiClient } from "./apiClient.js";
import { getDepartmentDisplayName } from "../utils/departments.js";
import {
  getStudentLevelLabel,
  getStudentNumericLevel,
  getStudentTopbarLevelLabel,
} from "../utils/studentLevel.js";

export { getStudentLevelLabel, getStudentNumericLevel, getStudentTopbarLevelLabel };

export const CURRENT_STUDENT_STORAGE_KEY = "learnup_current_user";

const STUDENT_PROFILE_ENDPOINTS = [
  "/student/v2/me/card",
  "/student/me/card",
  "/learnup/student/identity-card",
];

const unwrapProfilePayload = (payload) => {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  if (payload.student || payload.profile || payload.card) {
    return {
      ...payload,
      ...(payload.student || payload.profile || payload.card),
    };
  }

  return payload;
};

export const readStoredStudentProfile = () => {
  try {
    const raw = window.localStorage.getItem(CURRENT_STUDENT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const persistStudentProfile = (profile) => {
  try {
    if (!profile) {
      window.localStorage.removeItem(CURRENT_STUDENT_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(CURRENT_STUDENT_STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // Ignore storage write issues.
  }
};

export const getStudentDisplayName = (profile) =>
  profile?.displayName || profile?.fullName || profile?.full_name || profile?.name || "Student";

export const getStudentDepartmentLabel = (profile) =>
  profile?.department ||
  profile?.department_name ||
  getDepartmentDisplayName(profile) ||
  "Department not specified";

export async function fetchCurrentStudentProfile(fallback = {}) {
  let rawProfile = null;

  for (const path of STUDENT_PROFILE_ENDPOINTS) {
    try {
      const response = await apiClient.get(path);
      const unwrapped = unwrapProfilePayload(response);

      if (unwrapped) {
        rawProfile = { ...fallback, ...unwrapped };
        break;
      }
    } catch (error) {
      if (error?.status === 401) {
        throw error;
      }
    }
  }

  if (!rawProfile) {
    try {
      const authMe = await apiClient.get("/auth/me");
      if (authMe) {
        rawProfile = { ...fallback, ...authMe };
      }
    } catch (error) {
      if (error?.status === 401) {
        throw error;
      }
    }
  }

  if (!rawProfile) {
    return null;
  }

  const mappedProfile = mapBackendStudent(rawProfile, fallback);
  const rawNumericLevel =
    getStudentNumericLevel(rawProfile) ??
    getStudentNumericLevel(rawProfile?.student) ??
    getStudentNumericLevel(fallback);

  return {
    ...mappedProfile,
    student_level: rawNumericLevel,
    level: rawNumericLevel ?? mappedProfile.level,
  };
}
