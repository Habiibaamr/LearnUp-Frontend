const cleanText = (value) => (
  value === undefined || value === null ? "" : String(value).trim()
);

const toFiniteNumber = (value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const numeric = Number(value);
  if (Number.isFinite(numeric)) {
    return numeric;
  }

  const match = cleanText(value).match(/-?\d+(?:\.\d+)?/);
  const parsed = match ? Number(match[0]) : null;
  return Number.isFinite(parsed) ? parsed : null;
};

const getSources = (student = {}) => {
  const source = student && typeof student === "object" ? student : {};

  return [source, source.student, source.user, source.account, source.profile].filter(Boolean);
};

const getFirstValue = (student, keys) => {
  for (const source of getSources(student)) {
    for (const key of keys) {
      const value = source?.[key];
      if (value !== undefined && value !== null && value !== "") {
        return value;
      }
    }
  }

  return null;
};

export const getAcademicLevel = (student) => {
  const value = getFirstValue(student, ["level", "student_level", "academic_level"]);
  const match = cleanText(value).match(/\d+/);
  const level = match ? Number(match[0]) : toFiniteNumber(value);

  return Number.isFinite(level) ? Math.max(1, Math.min(4, level)) : 1;
};

export const getRecordedGpa = (student) => {
  const value = getFirstValue(student, ["cgpa", "gpa", "current_gpa", "currentGpa"]);
  const numeric = toFiniteNumber(value);

  return numeric !== null && numeric >= 0 && numeric <= 4 ? numeric : null;
};

const getRegistrationCollections = (student = {}) => {
  const source = student && typeof student === "object" ? student : {};

  return [
    source.course_registrations,
    source.courseRegistrations,
    source.registrations,
    source.completed_courses,
    source.completedCourses,
    source.courses,
    source.student?.course_registrations,
    source.student?.registrations,
  ].filter(Array.isArray);
};

const getRealRegistrationGpa = (student) => {
  for (const rows of getRegistrationCollections(student)) {
    const gpa = calculateWeightedGpaValue(rows);
    if (gpa !== null) {
      return gpa;
    }
  }

  return null;
};

export const getDeterministicStudentGrades = (student) => {
  const level = getAcademicLevel(student);

  if (level < 2) {
    return [];
  }

  const studentKey = getStudentAcademicKey(student);

  return CANONICAL_COURSE_CATALOG
    .filter((course) => Number(course.level) <= level)
    .map((course, index) => ({
      course_code: course.course_code,
      course_title: course.course_title,
      credit_hours: course.credit_hours,
      grade: getDeterministicDemoGrade(studentKey, course.course_code, index),
    }));
};

export const getEffectiveGpa = (student, { allowDemo = true } = {}) => {
  const registrationGpa = getRealRegistrationGpa(student);

  if (registrationGpa !== null) {
    return registrationGpa;
  }

  const recordedGpa = getRecordedGpa(student);

  if (recordedGpa !== null && recordedGpa > 0) {
    return recordedGpa;
  }

  const level = getAcademicLevel(student);

  if (!allowDemo || level < 2) {
    return null;
  }

  return calculateWeightedGpaValue(getDeterministicStudentGrades(student));
};

export const getRiskStatus = (studentOrGpa) => {
  const gpa = typeof studentOrGpa === "number"
    ? studentOrGpa
    : getEffectiveGpa(studentOrGpa);

  if (gpa === null || !Number.isFinite(gpa)) {
    return {
      label: "Pending / No GPA Data",
      shortLabel: "Pending",
      className: "pending",
    };
  }

  if (gpa < 2) {
    return { label: "At Risk", shortLabel: "At Risk", className: "high" };
  }

  if (gpa < 2.5) {
    return {
      label: "Needs Follow-up",
      shortLabel: "Needs Follow-up",
      className: "medium",
    };
  }

  return {
    label: "Good Standing",
    shortLabel: "Good Standing",
    className: "low",
  };
};

const getRegistrationCredits = (student) => {
  const collections = getRegistrationCollections(student);

  for (const rows of collections) {
    const credits = rows.reduce((total, row) => {
      const status = cleanText(row.status || row.registration_status).toLowerCase();
      const grade = cleanText(row.grade || row.final_grade).toUpperCase();
      const passed = (
        ["passed", "completed", "success"].includes(status) ||
        (grade && grade !== "F" && grade !== "-")
      );

      if (!passed) {
        return total;
      }

      return total + (
        toFiniteNumber(row.credit_hours ?? row.credits ?? row.course?.credit_hours) || 0
      );
    }, 0);

    if (credits > 0) {
      return credits;
    }
  }

  return null;
};

export const getPassedCreditHours = (student) => {
  const registrationCredits = getRegistrationCredits(student);

  if (registrationCredits !== null) {
    return Math.min(120, Math.round(registrationCredits));
  }

  const directCredits = toFiniteNumber(
    getFirstValue(student, [
      "passed_credit_hours",
      "passedCreditHours",
      "completed_credit_hours",
      "completedCreditHours",
      "totalHoursPassed",
      "credits_earned",
      "creditsEarned",
    ]),
  );
  const level = getAcademicLevel(student);

  if (directCredits !== null && (directCredits > 0 || level === 1)) {
    return Math.min(120, Math.max(0, Math.round(directCredits)));
  }

  return { 1: 0, 2: 30, 3: 66, 4: 96 }[level] ?? 0;
};
import { CANONICAL_COURSE_CATALOG } from "../data/courseCatalog.js";
import {
  calculateWeightedGpaValue,
  getDeterministicDemoGrade,
  getStudentAcademicKey,
} from "./academicGrades.js";
