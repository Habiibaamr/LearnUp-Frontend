export const capitalize = (text) => {
  if (text === null || text === undefined) {
    return "";
  }

  const value = String(text);

  if (!value) {
    return "";
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
};

export const formatDate = (date) => {
  if (!date) {
    return "";
  }

  const parsedDate = date instanceof Date ? date : new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(parsedDate);
};
