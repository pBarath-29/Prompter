export const getCurrentMonthYear = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export const isNewMonth = (lastReset: string): boolean => {
  return lastReset !== getCurrentMonthYear();
};

export const isNewDay = (lastDate: string): boolean => {
  return lastDate !== new Date().toISOString().split('T')[0];
};
