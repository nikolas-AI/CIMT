"use strict";

const BatchImportService = (() => {
  const MAX_FILE_BYTES = 5 * 1024 * 1024;
  const MAX_DATA_ROWS = 10000;
  const METHODS = {
    volunteerHours: {
      idHeader: "role_id",
      quantityHeader: "hours",
      catalogs: () => VOLUNTEER_ROLES.filter(role => role.active !== false),
      getId: item => item.id,
      getName: item => item.displayName,
    },
    clinicalServices: {
      idHeader: "service_id",
      quantityHeader: "count",
      catalogs: () => CLINICAL_SERVICES.filter(service => service.active !== false),
      getId: item => item.id,
      getName: item => item.displayName,
    },
  };

  function getLimits() {
    return { maxFileBytes: MAX_FILE_BYTES, maxDataRows: MAX_DATA_ROWS };
  }

  function getCatalog(method) {
    const config = METHODS[method];
    if (!config) throw new Error("Choose a valid calculation method.");
    return config.catalogs();
  }

  function createTemplate(method) {
    const config = METHODS[method];
    if (!config) throw new Error("Choose a valid calculation method.");
    const rows = [[config.idHeader, config.quantityHeader]];
    config.catalogs().forEach(item => rows.push([config.getId(item), "0"]));
    return rows.map(row => row.map(_csvCell).join(",")).join("\r\n") + "\r\n";
  }

  function createReferenceCSV(method) {
    const config = METHODS[method];
    if (!config) throw new Error("Choose a valid calculation method.");
    const rows = [[config.idHeader, "display_name"]];
    config.catalogs().forEach(item => rows.push([config.getId(item), config.getName(item)]));
    return rows.map(row => row.map(_csvCell).join(",")).join("\r\n") + "\r\n";
  }

  function parse(text, fileName, method) {
    const errors = [];
    const config = METHODS[method];
    if (!config) {
      return _result(fileName, method, 0, [], ["Choose a calculation method before importing a file."]);
    }

    const extension = String(fileName || "").toLowerCase().split(".").pop();
    if (extension !== "csv" && extension !== "txt") {
      return _result(fileName, method, 0, [], ["Choose a .csv or tab-separated .txt file. Other formats are not supported."]);
    }

    const delimiter = extension === "csv" ? "," : "\t";
    const parsed = _parseDelimited(String(text || "").replace(/^\uFEFF/, ""), delimiter);
    if (parsed.error) {
      return _result(fileName, method, 0, [], [parsed.error]);
    }

    const nonblankRecords = parsed.records.filter(record =>
      !record.fields.every(value => value.trim() === "")
    );
    if (nonblankRecords.length === 0) {
      return _result(fileName, method, 0, [], ["The selected file is empty. Add a header and at least one activity row."]);
    }

    const headerRecord = nonblankRecords[0];
    const headers = headerRecord.fields.map(value => value.trim().toLowerCase());
    const expectedHeaders = [config.idHeader, config.quantityHeader];
    const headerErrors = [];
    if (new Set(headers).size !== headers.length) {
      headerErrors.push(`Header row ${headerRecord.line}: duplicate column names are not allowed.`);
    }
    const missing = expectedHeaders.filter(header => !headers.includes(header));
    const unsupported = headers.filter(header => !expectedHeaders.includes(header));
    if (missing.length) {
      headerErrors.push(`Header row ${headerRecord.line}: missing required column${missing.length > 1 ? "s" : ""} ${missing.map(value => `"${value}"`).join(", ")}.`);
    }
    if (unsupported.length) {
      headerErrors.push(`Header row ${headerRecord.line}: unsupported column${unsupported.length > 1 ? "s" : ""} ${unsupported.map(value => `"${value}"`).join(", ")}. Remove unrelated columns before importing.`);
    }
    if (headerErrors.length) {
      return _result(fileName, method, 0, [], headerErrors);
    }

    const idIndex = headers.indexOf(config.idHeader);
    const quantityIndex = headers.indexOf(config.quantityHeader);
    const dataRecords = nonblankRecords.slice(1);
    if (dataRecords.length > MAX_DATA_ROWS) {
      return _result(fileName, method, dataRecords.length, [], [
        `This file has ${dataRecords.length.toLocaleString("en-US")} data rows. The limit is ${MAX_DATA_ROWS.toLocaleString("en-US")} rows.`,
      ]);
    }
    if (dataRecords.length === 0) {
      return _result(fileName, method, 0, [], ["The file has a header but no activity rows."]);
    }

    const catalog = config.catalogs();
    const catalogById = new Map(catalog.map(item => [config.getId(item), item]));
    const grouped = new Map();

    dataRecords.forEach(record => {
      if (record.fields.length !== 2) {
        errors.push(`Line ${record.line}: expected exactly 2 columns but found ${record.fields.length}.`);
        return;
      }

      const id = record.fields[idIndex].trim();
      const quantityText = record.fields[quantityIndex].trim();
      if (!id) {
        errors.push(`Line ${record.line}: ${config.idHeader} cannot be blank.`);
        return;
      }
      const item = catalogById.get(id);
      if (!item) {
        errors.push(`Line ${record.line}: unknown ${config.idHeader} "${id}". Use an ID from the downloaded reference list.`);
        return;
      }

      const quantityError = _validateQuantity(quantityText, method);
      if (quantityError) {
        errors.push(`Line ${record.line}: ${quantityError}`);
        return;
      }
      const quantity = Number(quantityText);
      const previous = grouped.get(id);
      const combined = (previous ? previous.quantity : 0) + quantity;
      if (!Number.isFinite(combined) ||
          (method === "volunteerHours" && !Number.isInteger(combined * 2))) {
        errors.push(`Line ${record.line}: combined ${config.quantityHeader} for ${id} is outside the supported numeric range.`);
        return;
      }
      grouped.set(id, {
        id,
        name: config.getName(item),
        quantity: combined,
        sourceRows: (previous ? previous.sourceRows : 0) + 1,
        lastLine: record.line,
      });
    });

    let totalQuantity = 0;
    for (const entry of grouped.values()) {
      totalQuantity += entry.quantity;
      if (!Number.isFinite(totalQuantity)) {
        errors.push(`Line ${entry.lastLine}: the combined ${config.quantityHeader} total exceeds the supported numeric range.`);
        totalQuantity = null;
        break;
      }
    }
    if (totalQuantity === 0) {
      errors.push("At least one activity quantity must be greater than zero.");
    }

    const entries = Array.from(grouped.values()).map(entry => ({
      id: entry.id,
      name: entry.name,
      quantity: entry.quantity,
      combinedRows: entry.sourceRows - 1,
    }));
    return _result(fileName, method, dataRecords.length, entries, errors, totalQuantity);
  }

  function toCalculatorState(clinic, method, entries) {
    if (!METHODS[method]) throw new Error("Choose a valid calculation method.");
    const state = {
      clinic: { ...clinic },
      impactMethod: method,
      volunteers: [],
      services: [],
    };
    if (method === "volunteerHours") {
      state.volunteers = entries.map((entry, index) => ({
        id: `batch-volunteer-${index + 1}`,
        roleId: entry.id,
        hours: entry.quantity,
      }));
    } else {
      state.services = entries.map((entry, index) => ({
        id: `batch-service-${index + 1}`,
        serviceId: entry.id,
        count: entry.quantity,
      }));
    }
    return state;
  }

  function _validateQuantity(value, method) {
    if (!value) return `Enter a value for ${METHODS[method].quantityHeader}; blank values are not treated as zero.`;
    if (/^[+-]?(?:nan|infinity)$/i.test(value)) {
      return `${METHODS[method].quantityHeader} must be a finite number; NaN and Infinity are not accepted.`;
    }
    if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(value)) {
      return `${METHODS[method].quantityHeader} must be a complete numeric value.`;
    }
    const quantity = Number(value);
    if (!Number.isFinite(quantity)) {
      return `${METHODS[method].quantityHeader} must be a finite number.`;
    }
    if (quantity < 0) {
      return `${METHODS[method].quantityHeader} cannot be negative.`;
    }
    if (method === "volunteerHours" && !Number.isInteger(quantity * 2)) {
      return "Volunteer hours must be in half-hour increments (for example, 12 or 12.5).";
    }
    if (method === "clinicalServices" && !Number.isInteger(quantity)) {
      return "Clinical service counts must be whole numbers.";
    }
    return null;
  }

  function _parseDelimited(text, delimiter) {
    const records = [];
    const source = text.replace(/\r\n?/g, "\n");
    let fields = [];
    let field = "";
    let line = 1;
    let recordLine = 1;
    let inQuotes = false;
    let quoteClosed = false;
    let recordTouched = false;

    function pushField() {
      fields.push(field);
      field = "";
      quoteClosed = false;
    }

    function pushRecord() {
      pushField();
      records.push({ line: recordLine, fields });
      fields = [];
      recordTouched = false;
    }

    for (let index = 0; index < source.length; index += 1) {
      const character = source[index];
      if (inQuotes) {
        if (character === '"') {
          if (source[index + 1] === '"') {
            field += '"';
            index += 1;
          } else {
            inQuotes = false;
            quoteClosed = true;
          }
        } else {
          field += character;
          if (character === "\n") line += 1;
        }
        continue;
      }

      if (quoteClosed) {
        if (character === delimiter) {
          pushField();
          recordTouched = true;
        } else if (character === "\n") {
          pushRecord();
          line += 1;
          recordLine = line;
        } else if (!/[ \t]/.test(character)) {
          return { records: [], error: `Line ${line}: unexpected character after a quoted field.` };
        }
        continue;
      }

      if (character === delimiter) {
        pushField();
        recordTouched = true;
      } else if (character === "\n") {
        pushRecord();
        line += 1;
        recordLine = line;
      } else if (character === '"') {
        if (field.trim() !== "") {
          return { records: [], error: `Line ${line}: a quote may only begin at the start of a field.` };
        }
        field = "";
        inQuotes = true;
        recordTouched = true;
      } else {
        field += character;
        recordTouched = true;
      }
    }

    if (inQuotes) {
      return { records: [], error: `Line ${recordLine}: quoted field is not closed.` };
    }
    if (recordTouched || fields.length > 0 || field.length > 0 || quoteClosed) {
      pushRecord();
    }
    return { records, error: null };
  }

  function _csvCell(value) {
    const text = String(value === null || value === undefined ? "" : value);
    return `"${text.replace(/"/g, '""')}"`;
  }

  function _result(fileName, method, sourceRowCount, entries, errors, totalQuantity = 0) {
    return {
      fileName: String(fileName || ""),
      method,
      sourceRowCount,
      entries,
      errors,
      totalQuantity,
      duplicateRowsCombined: entries.reduce((sum, entry) => sum + entry.combinedRows, 0),
      valid: errors.length === 0,
    };
  }

  return {
    getLimits,
    getCatalog,
    createTemplate,
    createReferenceCSV,
    parse,
    toCalculatorState,
  };
})();
