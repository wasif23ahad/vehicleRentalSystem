export const differenceInDays = (start: Date, end: Date): number => {
  const diffMs = end.getTime() - start.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};
