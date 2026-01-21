export const isFutureDate = (date: string): boolean => {
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) {
    return false;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return value.getTime() > today.getTime();
};

export const isPastDate = (date: string): boolean => {
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) {
    return false;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return value.getTime() < today.getTime();
};
