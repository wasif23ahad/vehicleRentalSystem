export const hasRows = <T>(rows: T[]): rows is [T, ...T[]] => rows.length > 0;
