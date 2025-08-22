export const isValidPositiveInteger = (value: string): boolean => {
  return /^\d+$/.test(value) && Number.isSafeInteger(Number(value));
};