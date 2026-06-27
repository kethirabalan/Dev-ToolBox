import * as jsyaml from "js-yaml";

/**
 * Robust JSON Beautifier and Minifier
 */
export function beautifyJson(jsonStr: string, spaces: number = 2): string {
  if (!jsonStr.trim()) return "";
  const parsed = JSON.parse(jsonStr);
  return JSON.stringify(parsed, null, spaces);
}

export function minifyJson(jsonStr: string): string {
  if (!jsonStr.trim()) return "";
  const parsed = JSON.parse(jsonStr);
  return JSON.stringify(parsed);
}

/**
 * Custom line-by-line Diff Engine for comparing two text streams
 */
export interface DiffLine {
  type: "added" | "removed" | "unchanged";
  content: string;
  lineNumberLeft?: number;
  lineNumberRight?: number;
}

export function diffTexts(leftText: string, rightText: string): DiffLine[] {
  const leftLines = leftText.split(/\r?\n/);
  const rightLines = rightText.split(/\r?\n/);

  const lLen = leftLines.length;
  const rLen = rightLines.length;

  // Simple and fast LCS (Longest Common Subsequence) diff
  const dp: number[][] = Array(lLen + 1)
    .fill(null)
    .map(() => Array(rLen + 1).fill(0));

  for (let i = 1; i <= lLen; i++) {
    for (let j = 1; j <= rLen; j++) {
      if (leftLines[i - 1] === rightLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  const diff: DiffLine[] = [];
  let i = lLen;
  let j = rLen;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && leftLines[i - 1] === rightLines[j - 1]) {
      diff.unshift({
        type: "unchanged",
        content: leftLines[i - 1],
        lineNumberLeft: i,
        lineNumberRight: j,
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      diff.unshift({
        type: "added",
        content: rightLines[j - 1],
        lineNumberRight: j,
      });
      j--;
    } else {
      diff.unshift({
        type: "removed",
        content: leftLines[i - 1],
        lineNumberLeft: i,
      });
      i--;
    }
  }

  return diff;
}

/**
 * YAML Converter using js-yaml
 */
export function jsonToYaml(jsonStr: string): string {
  if (!jsonStr.trim()) return "";
  const obj = JSON.parse(jsonStr);
  return jsyaml.dump(obj, { indent: 2, noRefs: true });
}

export function yamlToJson(yamlStr: string): string {
  if (!yamlStr.trim()) return "";
  const obj = jsyaml.load(yamlStr);
  return JSON.stringify(obj, null, 2);
}

/**
 * TOML Parser and Stringifier (Lightweight & robust)
 */
export function tomlToJson(tomlStr: string): string {
  if (!tomlStr.trim()) return "";
  const lines = tomlStr.split(/\r?\n/);
  const result: any = {};
  let currentSection: any = result;

  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith("#")) continue;

    // Section header [section] or [section.subsection]
    if (line.startsWith("[") && line.endsWith("]")) {
      const sectionName = line.slice(1, -1).trim();
      const parts = sectionName.split(".");
      
      currentSection = result;
      for (const part of parts) {
        if (!currentSection[part]) {
          currentSection[part] = {};
        }
        currentSection = currentSection[part];
      }
      continue;
    }

    // Key value pair: key = value
    const equalIdx = line.indexOf("=");
    if (equalIdx > -1) {
      const key = line.slice(0, equalIdx).trim();
      let valStr = line.slice(equalIdx + 1).trim();

      // Simple type parsing
      let parsedValue: any = valStr;
      if (valStr.startsWith('"') && valStr.endsWith('"')) {
        parsedValue = valStr.slice(1, -1);
      } else if (valStr.startsWith("'") && valStr.endsWith("'")) {
        parsedValue = valStr.slice(1, -1);
      } else if (valStr === "true") {
        parsedValue = true;
      } else if (valStr === "false") {
        parsedValue = false;
      } else if (!isNaN(Number(valStr))) {
        parsedValue = Number(valStr);
      } else if (valStr.startsWith("[") && valStr.endsWith("]")) {
        // Simple list
        try {
          // Replace single quotes with double quotes for JSON parsing
          const formattedArray = valStr.replace(/'/g, '"');
          parsedValue = JSON.parse(formattedArray);
        } catch {
          parsedValue = valStr.slice(1, -1).split(",").map(item => item.trim().replace(/^['"]|['"]$/g, ""));
        }
      }

      currentSection[key] = parsedValue;
    }
  }

  return JSON.stringify(result, null, 2);
}

export function jsonToToml(jsonStr: string): string {
  if (!jsonStr.trim()) return "";
  const obj = JSON.parse(jsonStr);
  let tomlLines: string[] = [];

  // Helper to stringify value
  const stringifyValue = (val: any): string => {
    if (typeof val === "string") return `"${val}"`;
    if (typeof val === "boolean") return val ? "true" : "false";
    if (typeof val === "number") return val.toString();
    if (Array.isArray(val)) {
      return "[" + val.map(v => stringifyValue(v)).join(", ") + "]";
    }
    return `"${JSON.stringify(val).replace(/"/g, '\\"')}"`;
  };

  // Extract simple pairs first
  const simpleKeys = Object.keys(obj).filter(k => typeof obj[k] !== "object" || Array.isArray(obj[k]));
  const objectKeys = Object.keys(obj).filter(k => typeof obj[k] === "object" && !Array.isArray(obj[k]) && obj[k] !== null);

  for (const k of simpleKeys) {
    tomlLines.push(`${k} = ${stringifyValue(obj[k])}`);
  }

  // Then write out sections
  for (const section of objectKeys) {
    tomlLines.push(`\n[${section}]`);
    const subObj = obj[section];
    for (const subKey of Object.keys(subObj)) {
      if (typeof subObj[subKey] === "object" && !Array.isArray(subObj[subKey]) && subObj[subKey] !== null) {
        // Nested section [section.subsection]
        tomlLines.push(`\n[${section}.${subKey}]`);
        const subSubObj = subObj[subKey];
        for (const subSubKey of Object.keys(subSubObj)) {
          tomlLines.push(`${subSubKey} = ${stringifyValue(subSubObj[subSubKey])}`);
        }
      } else {
        tomlLines.push(`${subKey} = ${stringifyValue(subObj[subKey])}`);
      }
    }
  }

  return tomlLines.join("\n").trim();
}

/**
 * XML Parser using Browser DOMParser & builder
 */
export function xmlToJson(xmlStr: string): string {
  if (!xmlStr.trim()) return "";
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlStr, "application/xml");
  
  // Check parsing errors
  const parseError = xmlDoc.getElementsByTagName("parsererror");
  if (parseError.length > 0) {
    throw new Error(parseError[0].textContent || "XML parsing error");
  }

  const parseNode = (node: Node): any => {
    // If it's a text node, return its trimmed content
    if (node.nodeType === Node.TEXT_NODE) {
      return node.nodeValue?.trim() || "";
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const res: any = {};

      // Handle attributes
      if (element.attributes.length > 0) {
        res["_attributes"] = {};
        for (let i = 0; i < element.attributes.length; i++) {
          const attr = element.attributes[i];
          res["_attributes"][attr.nodeName] = attr.nodeValue;
        }
      }

      // Handle children
      const children = element.childNodes;
      let hasElementChild = false;

      for (let i = 0; i < children.length; i++) {
        if (children[i].nodeType === Node.ELEMENT_NODE) {
          hasElementChild = true;
          break;
        }
      }

      if (!hasElementChild) {
        const textContent = element.textContent?.trim() || "";
        if (Object.keys(res).length > 0) {
          res["_text"] = textContent;
          return res;
        }
        return textContent;
      }

      // Map child elements
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child.nodeType === Node.ELEMENT_NODE) {
          const childName = child.nodeName;
          const childVal = parseNode(child);

          if (res[childName] !== undefined) {
            if (!Array.isArray(res[childName])) {
              res[childName] = [res[childName]];
            }
            res[childName].push(childVal);
          } else {
            res[childName] = childVal;
          }
        }
      }

      return res;
    }
    return null;
  };

  const rootElement = xmlDoc.documentElement;
  const finalJson: any = {};
  finalJson[rootElement.nodeName] = parseNode(rootElement);

  return JSON.stringify(finalJson, null, 2);
}

export function jsonToXml(jsonStr: string): string {
  if (!jsonStr.trim()) return "";
  const obj = JSON.parse(jsonStr);

  const buildXml = (name: string, value: any, indent: number = 0): string => {
    const spacing = " ".repeat(indent);
    
    if (value === null || value === undefined) {
      return `${spacing}<${name} />`;
    }

    if (typeof value !== "object") {
      return `${spacing}<${name}>${escapeXml(value.toString())}</${name}>`;
    }

    if (Array.isArray(value)) {
      return value.map(item => buildXml(name, item, indent)).join("\n");
    }

    // Build attributes
    let attrStr = "";
    if (value["_attributes"]) {
      attrStr = Object.keys(value["_attributes"])
        .map(attr => ` ${attr}="${escapeXml(value["_attributes"][attr].toString())}"`)
        .join("");
    }

    // Check direct content
    const textVal = value["_text"] !== undefined ? value["_text"] : "";
    const keys = Object.keys(value).filter(k => k !== "_attributes" && k !== "_text");

    if (keys.length === 0) {
      if (textVal) {
        return `${spacing}<${name}${attrStr}>${escapeXml(textVal.toString())}</${name}>`;
      }
      return `${spacing}<${name}${attrStr} />`;
    }

    const childrenXml = keys
      .map(k => buildXml(k, value[k], indent + 2))
      .join("\n");

    return `${spacing}<${name}${attrStr}>\n${childrenXml}\n${spacing}</${name}>`;
  };

  // Expecting a single root element in standard XML
  const roots = Object.keys(obj);
  if (roots.length === 0) return "";
  
  // Format the XML with standard header
  let xmlStr = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xmlStr += roots.map(root => buildXml(root, obj[root])).join("\n");
  return xmlStr;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * CSV Converter (Robust parser)
 */
export function csvToJson(csvStr: string): string {
  if (!csvStr.trim()) return "";
  const lines: string[] = [];
  let currentLine: string[] = [];
  let currentToken = "";
  let insideQuotes = false;

  // Manual character iteration to respect quotes containing commas
  for (let i = 0; i < csvStr.length; i++) {
    const char = csvStr[i];
    const nextChar = csvStr[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped double quote
        currentToken += '"';
        i++; // skip next quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      currentLine.push(currentToken.trim());
      currentToken = "";
    } else if ((char === "\r" || char === "\n") && !insideQuotes) {
      if (char === "\r" && nextChar === "\n") {
        i++; // skip LF of CRLF
      }
      currentLine.push(currentToken.trim());
      lines.push(JSON.stringify(currentLine));
      currentLine = [];
      currentToken = "";
    } else {
      currentToken += char;
    }
  }

  // Push remaining elements
  if (currentToken || currentLine.length > 0) {
    currentLine.push(currentToken.trim());
    lines.push(JSON.stringify(currentLine));
  }

  if (lines.length === 0) return "[]";

  const headers = JSON.parse(lines[0]);
  const rows = lines.slice(1).map(line => JSON.parse(line)).filter(row => row.length > 0 && (row.length > 1 || row[0] !== ""));

  const resultList = rows.map(row => {
    const obj: any = {};
    headers.forEach((header: string, idx: number) => {
      let val = row[idx] !== undefined ? row[idx] : null;
      // Infer types
      if (val !== null) {
        if (val.toLowerCase() === "true") val = true;
        else if (val.toLowerCase() === "false") val = false;
        else if (!isNaN(Number(val)) && val !== "") val = Number(val);
      }
      obj[header] = val;
    });
    return obj;
  });

  return JSON.stringify(resultList, null, 2);
}

export function jsonToCsv(jsonStr: string): string {
  if (!jsonStr.trim()) return "";
  let list = JSON.parse(jsonStr);
  if (!Array.isArray(list)) {
    list = [list];
  }

  if (list.length === 0) return "";

  // Collect all distinct headers
  const headersSet = new Set<string>();
  list.forEach((item: any) => {
    if (typeof item === "object" && item !== null) {
      Object.keys(item).forEach(k => headersSet.add(k));
    }
  });

  const headers = Array.from(headersSet);
  if (headers.length === 0) return "";

  const escapeCsvValue = (val: any): string => {
    if (val === null || val === undefined) return "";
    let str = typeof val === "object" ? JSON.stringify(val) : val.toString();
    if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines = [
    headers.map(h => escapeCsvValue(h)).join(",")
  ];

  list.forEach((item: any) => {
    const line = headers.map(h => escapeCsvValue(item[h]));
    lines.push(line.join(","));
  });

  return lines.join("\n");
}

/**
 * JWT Token Decoder (Header & Payload)
 */
export interface DecodedJwt {
  header: any;
  payload: any;
  signature: string;
  isExpired: boolean;
  expiresInSec: number;
  issuedAtDate?: string;
  expirationDate?: string;
}

export function decodeJwt(token: string): DecodedJwt {
  const trimmed = token.trim();
  const parts = trimmed.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid JWT format. Must contain 3 dot-separated parts (Header, Payload, Signature).");
  }

  const decodePart = (base64Url: string): any => {
    let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }
    const decoded = atob(base64);
    // Handle UTF-8 decoding
    const bytes = new Uint8Array(decoded.length);
    for (let i = 0; i < decoded.length; i++) {
      bytes[i] = decoded.charCodeAt(i);
    }
    const textDecoder = new TextDecoder("utf-8");
    return JSON.parse(textDecoder.decode(bytes));
  };

  const header = decodePart(parts[0]);
  const payload = decodePart(parts[1]);
  const signature = parts[2];

  let isExpired = false;
  let expiresInSec = 0;
  let expirationDate: string | undefined;
  let issuedAtDate: string | undefined;

  if (payload.exp && typeof payload.exp === "number") {
    const expMs = payload.exp * 1000;
    isExpired = Date.now() > expMs;
    expiresInSec = Math.floor((expMs - Date.now()) / 1000);
    expirationDate = new Date(expMs).toISOString();
  }

  if (payload.iat && typeof payload.iat === "number") {
    issuedAtDate = new Date(payload.iat * 1000).toISOString();
  }

  return {
    header,
    payload,
    signature,
    isExpired,
    expiresInSec,
    issuedAtDate,
    expirationDate,
  };
}

/**
 * UTF-8 Safe Base64 Encoder / Decoder
 */
export function base64Encode(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binStr = "";
  bytes.forEach(b => {
    binStr += String.fromCharCode(b);
  });
  return btoa(binStr);
}

export function base64Decode(b64: string): string {
  const binStr = atob(b64.trim());
  const len = binStr.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binStr.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

/**
 * URL Parser and query param builder
 */
export interface ParsedUrl {
  protocol: string;
  username?: string;
  password?: string;
  hostname: string;
  port: string;
  pathname: string;
  hash: string;
  searchParams: { key: string; value: string; id: string }[];
}

export function parseUrl(urlStr: string): ParsedUrl {
  let targetUrl = urlStr.trim();
  if (!/^https?:\/\//i.test(targetUrl)) {
    // If no protocol is specified, append a temp one so URL parser doesn't crash
    targetUrl = "http://" + targetUrl;
  }

  const url = new URL(targetUrl);
  const searchParams: { key: string; value: string; id: string }[] = [];
  url.searchParams.forEach((val, key) => {
    searchParams.push({
      key,
      value: val,
      id: Math.random().toString(36).substring(2, 9),
    });
  });

  return {
    protocol: url.protocol,
    username: url.username,
    password: url.password,
    hostname: url.hostname,
    port: url.port,
    pathname: url.pathname,
    hash: url.hash,
    searchParams,
  };
}

export function buildUrl(parsed: ParsedUrl): string {
  try {
    const url = new URL(`${parsed.protocol}//${parsed.hostname}`);
    if (parsed.port) url.port = parsed.port;
    if (parsed.username) url.username = parsed.username;
    if (parsed.password) url.password = parsed.password;
    url.pathname = parsed.pathname;
    
    // Clear old search params and set new ones
    const search = new URLSearchParams();
    parsed.searchParams.forEach(param => {
      if (param.key) {
        search.append(param.key, param.value);
      }
    });
    url.search = search.toString();
    url.hash = parsed.hash;
    
    return url.toString();
  } catch (err) {
    return "Error generating URL: " + (err as Error).message;
  }
}
