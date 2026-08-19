export class CsvParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CsvParseError";
  }
}

export function parseCsv(text: string): string[][] {
  const input = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  const finishField = () => {
    row.push(field);
    field = "";
  };

  const finishRow = () => {
    finishField();
    if (row.some((value) => value.length > 0)) {
      rows.push(row);
    }
    row = [];
  };

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];

    if (inQuotes) {
      if (char === '"') {
        if (input[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      if (field.length > 0) {
        throw new CsvParseError("Unexpected quote in an unquoted CSV field.");
      }
      inQuotes = true;
    } else if (char === ",") {
      finishField();
    } else if (char === "\n") {
      finishRow();
    } else if (char !== "\r") {
      field += char;
    }
  }

  if (inQuotes) {
    throw new CsvParseError("The CSV ends inside a quoted field.");
  }

  if (field.length > 0 || row.length > 0) {
    finishRow();
  }

  return rows;
}
