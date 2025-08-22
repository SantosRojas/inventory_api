import { HttpError } from "./ErrorHandler";

export function parseDuplicateError(
  error: any,
  constraintMessages: Record<string, string>,
): never {
  if (error.code !== "ER_DUP_ENTRY") {
    throw new HttpError(
      "Error interno del servidor",
      500,
      (error as Error).message,
    );
  }

  const message: string = error.sqlMessage || error.message || "";

  for (const [constraintKey, customMessage] of Object.entries(
    constraintMessages,
  )) {
    if (message.includes(constraintKey)) {
      throw new HttpError("Información duplicada", 409, customMessage);
    }
  }

  // Fallback genérico
  throw new HttpError("Violación de restricción de unicidad", 409);
}
