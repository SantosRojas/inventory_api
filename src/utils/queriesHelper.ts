import { camelToSnake } from "../adapters/apiAdapter";

export const fieldsPlaceHoldersValues = <T extends Record<string, unknown>>(item: T) => {
    const snakeItem = camelToSnake(item);
    const fields: string = Object.keys(snakeItem).join(', ');
    const placeholders: string = Object.keys(snakeItem).map(() => '?').join(', ');
    const values: unknown[] = Object.values(snakeItem);

    return {
        fields,
        placeholders,
        values
    };
};

export function fieldsValues<T extends Record<string, unknown>>(item: T) {
    const snakeItem = camelToSnake(item);
    const fields = Object.keys(snakeItem).map(key => `${key} = ?`);
    const values = Object.values(snakeItem);

    return {
        fields,
        values
    };
}