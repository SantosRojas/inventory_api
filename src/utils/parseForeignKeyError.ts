import { HttpError } from "./ErrorHandler";

export function parseForeignKeyError(
  error: any,
  tableMessages: Record<string, string>,
): never {
  if (error.code === "ER_ROW_IS_REFERENCED_2") {
    const match = error.sqlMessage.match(/`(?:\w+)`\.`(\w+)`/);
    const childTable = match ? match[1] : null;

    if (childTable && tableMessages[childTable]) {
      throw new HttpError(
        "Restricción de integridad",
        400,
        tableMessages[childTable],
      );
    }

    throw new HttpError(
      "No se puede eliminar este registro porque está relacionado con otros datos.",
      400,
    );
  }

  throw new HttpError("Error interno del servidor", 500, error.message);
}
