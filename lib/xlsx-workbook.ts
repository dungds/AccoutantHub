import * as XLSX from "xlsx";

import { convertText, type Encoding } from "@/lib/vietnamese-encoding";

export type WorkbookFileType = "xlsx" | "xls" | "xlsm";

export type WorkbookColumn = {
  id: string;
  index: number;
  label: string;
};

export type WorkbookSheetSummary = {
  name: string;
  columns: WorkbookColumn[];
  rowCount: number;
};

export type WorkbookBundle = {
  fileType: WorkbookFileType;
  workbook: XLSX.WorkBook;
  sheets: WorkbookSheetSummary[];
};

export function inferWorkbookFileType(fileName: string): WorkbookFileType | null {
  const normalizedName = fileName.toLowerCase();

  if (normalizedName.endsWith(".xlsx")) {
    return "xlsx";
  }

  if (normalizedName.endsWith(".xlsm")) {
    return "xlsm";
  }

  if (normalizedName.endsWith(".xls")) {
    return "xls";
  }

  return null;
}

function getCellDisplayValue(cell: XLSX.CellObject | undefined) {
  if (!cell) {
    return "";
  }

  const rawValue = cell.w ?? cell.v;

  if (rawValue === undefined || rawValue === null) {
    return "";
  }

  return String(rawValue).trim();
}

function createColumnLabel(columnId: string, headerValue: string) {
  if (!headerValue) {
    return `Cột ${columnId}`;
  }

  return `${columnId} - ${headerValue}`;
}

export function readWorkbook(bytes: Uint8Array, fileType: WorkbookFileType): WorkbookBundle {
  const workbook = XLSX.read(bytes, {
    type: "array",
    bookVBA: true,
    cellStyles: true,
  });
  const sheets = workbook.SheetNames.map((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    const ref = worksheet["!ref"];

    if (!ref) {
      return { name: sheetName, columns: [], rowCount: 0 };
    }

    const range = XLSX.utils.decode_range(ref);
    const columns: WorkbookColumn[] = [];

    for (let columnIndex = range.s.c; columnIndex <= range.e.c; columnIndex += 1) {
      const columnId = XLSX.utils.encode_col(columnIndex);
      const headerCell = worksheet[XLSX.utils.encode_cell({ c: columnIndex, r: range.s.r })];
      const headerValue = getCellDisplayValue(headerCell);

      columns.push({
        id: columnId,
        index: columnIndex,
        label: createColumnLabel(columnId, headerValue),
      });
    }

    return {
      name: sheetName,
      columns,
      rowCount: Math.max(range.e.r - range.s.r + 1, 0),
    };
  });

  return { fileType, workbook, sheets };
}

export function getWorkbookPreview(workbook: XLSX.WorkBook, limit = 24) {
  const values: string[] = [];

  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    const ref = worksheet?.["!ref"];

    if (!worksheet || !ref) {
      continue;
    }

    const range = XLSX.utils.decode_range(ref);

    for (let rowIndex = range.s.r; rowIndex <= range.e.r; rowIndex += 1) {
      for (let columnIndex = range.s.c; columnIndex <= range.e.c; columnIndex += 1) {
        const cell = worksheet[XLSX.utils.encode_cell({ c: columnIndex, r: rowIndex })];

        if (!cell || (cell.t !== "s" && cell.t !== "str")) {
          continue;
        }

        const value = String(cell.v ?? "").trim();

        if (!value) {
          continue;
        }

        values.push(value);

        if (values.length >= limit) {
          return values.join("\n");
        }
      }
    }
  }

  return values.join("\n");
}

export function convertWorkbookAllSheets(
  bytes: Uint8Array,
  fileType: WorkbookFileType,
  from: Encoding,
  to: Encoding,
) {
  const workbook = XLSX.read(bytes, {
    type: "array",
    bookVBA: true,
    cellStyles: true,
  });

  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    const ref = worksheet?.["!ref"];

    if (!worksheet || !ref) {
      continue;
    }

    const range = XLSX.utils.decode_range(ref);

    for (let rowIndex = range.s.r; rowIndex <= range.e.r; rowIndex += 1) {
      for (let columnIndex = range.s.c; columnIndex <= range.e.c; columnIndex += 1) {
        const address = XLSX.utils.encode_cell({ c: columnIndex, r: rowIndex });
        const cell = worksheet[address];

        if (!cell || (cell.t !== "s" && cell.t !== "str")) {
          continue;
        }

        const rawValue = String(cell.v ?? "");
        const convertedValue = convertText(rawValue, from, to);

        cell.v = convertedValue;
        cell.w = convertedValue;
        cell.t = "s";
      }
    }
  }

  return XLSX.write(workbook, {
    bookType: fileType,
    type: "array",
    compression: true,
    bookVBA: fileType !== "xlsx",
    cellStyles: true,
  }) as Uint8Array;
}
