export const getStudentNumericLevel = (profile) => {
  const value =
    profile?.level ??
    profile?.student?.level ??
    profile?.student_level ??
    profile?.academic_level ??
    profile?.user?.level;

  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.min(4, Math.max(1, value));
  }

  const match = String(value ?? "").match(/\d+/);

  return match ? Math.min(4, Math.max(1, Number(match[0]))) : null;
};

export const getStudentLevelLabel = (profile) => {
  const numericLevel = getStudentNumericLevel(profile);

  if (!numericLevel) {
    return "Level not specified";
  }

  return `Level ${numericLevel}`;
};

export const getStudentTopbarLevelLabel = (profile) => {
  const numericLevel = getStudentNumericLevel(profile);

  if (!numericLevel) {
    return "LEVEL NOT SPECIFIED";
  }

  return `LEVEL ${numericLevel}`;
};
