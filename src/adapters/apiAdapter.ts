
export function snackToCamel<T extends Record<string, unknown>>(item: T): T {
  return Object.fromEntries(
    Object.entries(item).map(([key, value]) => [
      key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()), 
      value
    ])
  ) as T;
}


export function camelToSnake(item: any) {
  return Object.fromEntries(
    Object.entries(item).map(([key, value]) => [
      key.replace(/([A-Z])/g, '_$1').toLowerCase(), 
      value
    ])
  );
}

export function snackToCamelArray<T extends Record<string, unknown>>(items: T[]): T[] {
  if (!Array.isArray(items)) {
    throw new Error("Input must be an array");
  }
  return items.map(snackToCamel) as T[];
}


export function camelToSnakeArray(items: any[]) {
  return items.map(camelToSnake);
}