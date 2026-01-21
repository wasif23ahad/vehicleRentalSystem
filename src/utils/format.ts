export const toDateOnly = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  const [dateOnly] = date.toISOString().split("T");
  return dateOnly ?? value;
};
