
export const calculateRentalDays = (
  startDate: string | Date,
  endDate: string | Date
): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 0;
  }

  // Set to midnight to just compare dates
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const diffMs = end.getTime() - start.getTime();
  // Ensure we count at least 1 day if start == end (or handle as 0 if that's the rule, but usually rental is per day)
  // Based on "must be after start date", days = (end - start) in days.
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return days > 0 ? days : 0;
};

export const formatDateOnly = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const isFutureDate = (date: string | Date): boolean => {
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) {
    return false;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return value.getTime() > today.getTime();
};

export const isPastDate = (date: string | Date): boolean => {
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) {
    return false;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return value.getTime() < today.getTime();
};
