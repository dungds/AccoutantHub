export type Encoding = "unicode" | "vni" | "tcvn3";
export type SourceEncoding = Encoding | "auto";
export type FileTransportEncoding = "utf-8" | "windows-1252";

// Mapping data adapted from legacy Vietnamese encoding tables published by
// VietUnicode and the open-source u-convert project.

const UNICODE_MAP = [
  "À",
  "Á",
  "Â",
  "Ã",
  "È",
  "É",
  "Ê",
  "Ì",
  "Í",
  "Ò",
  "Ó",
  "Ô",
  "Õ",
  "Ù",
  "Ú",
  "Ý",
  "à",
  "á",
  "â",
  "ã",
  "è",
  "é",
  "ê",
  "ì",
  "í",
  "ò",
  "ó",
  "ô",
  "õ",
  "ù",
  "ú",
  "ý",
  "Ă",
  "ă",
  "Đ",
  "đ",
  "Ĩ",
  "ĩ",
  "Ũ",
  "ũ",
  "Ơ",
  "ơ",
  "Ư",
  "ư",
  "Ạ",
  "ạ",
  "Ả",
  "ả",
  "Ấ",
  "ấ",
  "Ầ",
  "ầ",
  "Ẩ",
  "ẩ",
  "Ẫ",
  "ẫ",
  "Ậ",
  "ậ",
  "Ắ",
  "ắ",
  "Ằ",
  "ằ",
  "Ẳ",
  "ẳ",
  "Ẵ",
  "ẵ",
  "Ặ",
  "ặ",
  "Ẹ",
  "ẹ",
  "Ẻ",
  "ẻ",
  "Ẽ",
  "ẽ",
  "Ế",
  "ế",
  "Ề",
  "ề",
  "Ể",
  "ể",
  "Ễ",
  "ễ",
  "Ệ",
  "ệ",
  "Ỉ",
  "ỉ",
  "Ị",
  "ị",
  "Ọ",
  "ọ",
  "Ỏ",
  "ỏ",
  "Ố",
  "ố",
  "Ồ",
  "ồ",
  "Ổ",
  "ổ",
  "Ỗ",
  "ỗ",
  "Ộ",
  "ộ",
  "Ớ",
  "ớ",
  "Ờ",
  "ờ",
  "Ở",
  "ở",
  "Ỡ",
  "ỡ",
  "Ợ",
  "ợ",
  "Ụ",
  "ụ",
  "Ủ",
  "ủ",
  "Ứ",
  "ứ",
  "Ừ",
  "ừ",
  "Ử",
  "ử",
  "Ữ",
  "ữ",
  "Ự",
  "ự",
  "Ỳ",
  "ỳ",
  "Ỵ",
  "ỵ",
  "Ỷ",
  "ỷ",
  "Ỹ",
  "ỹ",
] as const;

const VNI_MAP = [
  "AØ",
  "AÙ",
  "AÂ",
  "AÕ",
  "EØ",
  "EÙ",
  "EÂ",
  "Ì",
  "Í",
  "OØ",
  "OÙ",
  "OÂ",
  "OÕ",
  "UØ",
  "UÙ",
  "YÙ",
  "aø",
  "aù",
  "aâ",
  "aõ",
  "eø",
  "eù",
  "eâ",
  "ì",
  "í",
  "oø",
  "où",
  "oâ",
  "oõ",
  "uø",
  "uù",
  "yù",
  "AÊ",
  "aê",
  "Ñ",
  "ñ",
  "Ó",
  "ó",
  "UÕ",
  "uõ",
  "Ô",
  "ô",
  "Ö",
  "ö",
  "AÏ",
  "aï",
  "AÛ",
  "aû",
  "AÁ",
  "aá",
  "AÀ",
  "aà",
  "AÅ",
  "aå",
  "AÃ",
  "aã",
  "AÄ",
  "aä",
  "AÉ",
  "aé",
  "AÈ",
  "aè",
  "AÚ",
  "aú",
  "AÜ",
  "aü",
  "AË",
  "aë",
  "EÏ",
  "eï",
  "EÛ",
  "eû",
  "EÕ",
  "eõ",
  "EÁ",
  "eá",
  "EÀ",
  "eà",
  "EÅ",
  "eå",
  "EÃ",
  "eã",
  "EÄ",
  "eä",
  "Æ",
  "æ",
  "Ò",
  "ò",
  "OÏ",
  "oï",
  "OÛ",
  "oû",
  "OÁ",
  "oá",
  "OÀ",
  "oà",
  "OÅ",
  "oå",
  "OÃ",
  "oã",
  "OÄ",
  "oä",
  "ÔÙ",
  "ôù",
  "ÔØ",
  "ôø",
  "ÔÛ",
  "ôû",
  "ÔÕ",
  "ôõ",
  "ÔÏ",
  "ôï",
  "UÏ",
  "uï",
  "UÛ",
  "uû",
  "ÖÙ",
  "öù",
  "ÖØ",
  "öø",
  "ÖÛ",
  "öû",
  "ÖÕ",
  "öõ",
  "ÖÏ",
  "öï",
  "YØ",
  "yø",
  "Î",
  "î",
  "YÛ",
  "yû",
  "YÕ",
  "yõ",
] as const;

const TCVN3_MAP = [
  "Aµ",
  "A¸",
  "¢",
  "A·",
  "EÌ",
  "EÐ",
  "£",
  "I×",
  "IÝ",
  "Oß",
  "Oã",
  "¤",
  "Oâ",
  "Uï",
  "Uó",
  "Yý",
  "µ",
  "¸",
  "©",
  "·",
  "Ì",
  "Ð",
  "ª",
  "×",
  "Ý",
  "ß",
  "ã",
  "«",
  "â",
  "ï",
  "ó",
  "ý",
  "¡",
  "¨",
  "§",
  "®",
  "IÜ",
  "Ü",
  "Uò",
  "ò",
  "¥",
  "¬",
  "¦",
  "\u00ad",
  "A¹",
  "¹",
  "A¶",
  "¶",
  "¢Ê",
  "Ê",
  "¢Ç",
  "Ç",
  "¢È",
  "È",
  "¢É",
  "É",
  "¢Ë",
  "Ë",
  "¡¾",
  "¾",
  "¡»",
  "»",
  "¡¼",
  "¼",
  "¡½",
  "½",
  "¡Æ",
  "Æ",
  "EÑ",
  "Ñ",
  "EÎ",
  "Î",
  "EÏ",
  "Ï",
  "£Õ",
  "Õ",
  "£Ò",
  "Ò",
  "£Ó",
  "Ó",
  "£Ô",
  "Ô",
  "£Ö",
  "Ö",
  "IØ",
  "Ø",
  "IÞ",
  "Þ",
  "Oä",
  "ä",
  "Oá",
  "á",
  "¤è",
  "è",
  "¤å",
  "å",
  "¤æ",
  "æ",
  "¤ç",
  "ç",
  "¤é",
  "é",
  "¥í",
  "í",
  "¥ê",
  "ê",
  "¥ë",
  "ë",
  "¥ì",
  "ì",
  "¥î",
  "î",
  "Uô",
  "ô",
  "Uñ",
  "ñ",
  "¦ø",
  "ø",
  "¦õ",
  "õ",
  "¦ö",
  "ö",
  "¦÷",
  "÷",
  "¦ù",
  "ù",
  "Yú",
  "ú",
  "Yþ",
  "þ",
  "Yû",
  "û",
  "Yü",
  "ü",
] as const;

const MAPS: Record<Encoding, readonly string[]> = {
  unicode: UNICODE_MAP,
  vni: VNI_MAP,
  tcvn3: TCVN3_MAP,
};

const ENCODING_LABELS: Record<Encoding, string> = {
  unicode: "Unicode",
  vni: "VNI Windows",
  tcvn3: "TCVN3 (ABC)",
};

const CP1252_DECODE_MAP = new Map<number, string>([
  [0x80, "€"],
  [0x82, "‚"],
  [0x83, "ƒ"],
  [0x84, "„"],
  [0x85, "…"],
  [0x86, "†"],
  [0x87, "‡"],
  [0x88, "ˆ"],
  [0x89, "‰"],
  [0x8a, "Š"],
  [0x8b, "‹"],
  [0x8c, "Œ"],
  [0x8e, "Ž"],
  [0x91, "‘"],
  [0x92, "’"],
  [0x93, "“"],
  [0x94, "”"],
  [0x95, "•"],
  [0x96, "–"],
  [0x97, "—"],
  [0x98, "˜"],
  [0x99, "™"],
  [0x9a, "š"],
  [0x9b, "›"],
  [0x9c, "œ"],
  [0x9e, "ž"],
  [0x9f, "Ÿ"],
]);

const CP1252_ENCODE_MAP = new Map<string, number>(
  [...CP1252_DECODE_MAP.entries()].map(([byte, char]) => [char, byte]),
);

const PLACEHOLDER_OFFSET = 0xe000;

type CompiledMatcher = {
  lookup: Map<string, number>;
  pattern: RegExp | null;
};

const UNIQUE_UNICODE_DETECTION_EXCLUSIONS = new Set(["Â", "Ê", "Ô", "â", "ê", "ô"]);
const VNI_DETECTION_SINGLETONS = new Set(["Ñ", "ñ", "Æ", "æ", "Ò", "ò", "Ó", "ó", "Ö", "ö", "Î", "î"]);

const compiledMatchers = Object.fromEntries(
  (Object.keys(MAPS) as Encoding[]).map((encoding) => [
    encoding,
    createCompiledMatcher(MAPS[encoding]),
  ]),
) as Record<Encoding, CompiledMatcher>;

const detectionMatchers = {
  unicode: createCompiledMatcher(
    UNICODE_MAP.filter((value) => !UNIQUE_UNICODE_DETECTION_EXCLUSIONS.has(value)),
  ),
  vni: createCompiledMatcher(
    VNI_MAP.filter((value) => value.length > 1 || VNI_DETECTION_SINGLETONS.has(value)),
  ),
  tcvn3: createCompiledMatcher(TCVN3_MAP.filter((value) => /[^\x00-\x7f]/.test(value))),
} satisfies Record<Encoding, CompiledMatcher>;

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function createCompiledMatcher(values: readonly string[]): CompiledMatcher {
  const sorted = [...values.entries()].sort((left, right) => right[1].length - left[1].length);
  const lookup = new Map<string, number>(sorted.map(([index, value]) => [value, index]));

  if (sorted.length === 0) {
    return { lookup, pattern: null };
  }

  return {
    lookup,
    pattern: new RegExp(sorted.map(([, value]) => escapeRegExp(value)).join("|"), "g"),
  };
}

function encodePlaceholders(text: string, from: Encoding) {
  const matcher = compiledMatchers[from];

  if (!matcher.pattern) {
    return text;
  }

  matcher.pattern.lastIndex = 0;

  return text.replace(matcher.pattern, (matched) =>
    String.fromCodePoint(PLACEHOLDER_OFFSET + (matcher.lookup.get(matched) ?? 0)),
  );
}

function decodePlaceholders(text: string, to: Encoding) {
  const targetMap = MAPS[to];
  let result = "";

  for (const char of text) {
    const codePoint = char.codePointAt(0);

    if (
      codePoint !== undefined &&
      codePoint >= PLACEHOLDER_OFFSET &&
      codePoint < PLACEHOLDER_OFFSET + targetMap.length
    ) {
      result += targetMap[codePoint - PLACEHOLDER_OFFSET];
      continue;
    }

    result += char;
  }

  return result;
}

function scoreText(text: string, matcher: CompiledMatcher) {
  if (!matcher.pattern) {
    return 0;
  }

  matcher.pattern.lastIndex = 0;

  let score = 0;

  for (const match of text.matchAll(matcher.pattern)) {
    const value = match[0];
    score += value.length > 1 ? 3 : 1;
  }

  return score;
}

function prepareUnicode(text: string) {
  return text.normalize("NFC");
}

function decodeUtf8Bytes(bytes: Uint8Array) {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return null;
  }
}

function decodeWindows1252Bytes(bytes: Uint8Array) {
  let result = "";

  for (const byte of bytes) {
    result += CP1252_DECODE_MAP.get(byte) ?? String.fromCharCode(byte);
  }

  return result;
}

function encodeWindows1252Bytes(text: string) {
  const bytes: number[] = [];

  for (const char of text) {
    const mappedByte = CP1252_ENCODE_MAP.get(char);

    if (mappedByte !== undefined) {
      bytes.push(mappedByte);
      continue;
    }

    const codePoint = char.codePointAt(0);

    if (codePoint !== undefined && codePoint <= 0xff) {
      bytes.push(codePoint);
      continue;
    }

    bytes.push(0x3f);
  }

  return new Uint8Array(bytes);
}

export function getEncodingLabel(encoding: Encoding) {
  return ENCODING_LABELS[encoding];
}

export function getFileTransportLabel(encoding: FileTransportEncoding) {
  return encoding === "utf-8" ? "UTF-8" : "ANSI / Windows-1252";
}

export function detectEncoding(text: string): Encoding | null {
  if (!text.trim()) {
    return null;
  }

  const unicodeText = prepareUnicode(text);
  const scores: Array<[Encoding, number]> = [
    ["unicode", scoreText(unicodeText, detectionMatchers.unicode)],
    ["vni", scoreText(text, detectionMatchers.vni)],
    ["tcvn3", scoreText(text, detectionMatchers.tcvn3)],
  ];

  scores.sort((left, right) => right[1] - left[1]);

  const [bestEncoding, bestScore] = scores[0];
  const secondScore = scores[1][1];

  if (bestScore === 0) {
    return null;
  }

  if (bestScore === secondScore) {
    return null;
  }

  return bestEncoding;
}

export function convertText(text: string, from: Encoding, to: Encoding) {
  const prepared = from === "unicode" ? prepareUnicode(text) : text;

  if (from === to) {
    return to === "unicode" ? prepareUnicode(prepared) : prepared;
  }

  const tokenized = encodePlaceholders(prepared, from);
  const converted = decodePlaceholders(tokenized, to);

  return to === "unicode" ? prepareUnicode(converted) : converted;
}

export function resolveSourceEncoding(sourceEncoding: SourceEncoding, text: string): Encoding {
  if (sourceEncoding !== "auto") {
    return sourceEncoding;
  }

  return detectEncoding(text) ?? "unicode";
}

export function decodeUploadedFile(bytes: Uint8Array, sourceEncoding: SourceEncoding) {
  const utf8Text = decodeUtf8Bytes(bytes);
  const ansiText = decodeWindows1252Bytes(bytes);

  if (sourceEncoding === "unicode") {
    return {
      text: prepareUnicode(utf8Text ?? ansiText),
      transportEncoding: (utf8Text ? "utf-8" : "windows-1252") as FileTransportEncoding,
      inferredSourceEncoding: "unicode" as Encoding,
    };
  }

  if (sourceEncoding === "vni" || sourceEncoding === "tcvn3") {
    return {
      text: ansiText,
      transportEncoding: "windows-1252" as FileTransportEncoding,
      inferredSourceEncoding: sourceEncoding,
    };
  }

  if (utf8Text) {
    const detectedUtf8Encoding = detectEncoding(utf8Text);

    if (detectedUtf8Encoding === "unicode") {
      return {
        text: prepareUnicode(utf8Text),
        transportEncoding: "utf-8" as FileTransportEncoding,
        inferredSourceEncoding: detectedUtf8Encoding,
      };
    }
  }

  const detectedAnsiEncoding = detectEncoding(ansiText);

  if (detectedAnsiEncoding === "vni" || detectedAnsiEncoding === "tcvn3") {
    return {
      text: ansiText,
      transportEncoding: "windows-1252" as FileTransportEncoding,
      inferredSourceEncoding: detectedAnsiEncoding,
    };
  }

  return {
    text: prepareUnicode(utf8Text ?? ansiText),
    transportEncoding: (utf8Text ? "utf-8" : "windows-1252") as FileTransportEncoding,
    inferredSourceEncoding: (utf8Text ? detectEncoding(utf8Text) : detectedAnsiEncoding) ?? "unicode",
  };
}

export function encodeDownloadFile(text: string, targetEncoding: Encoding) {
  if (targetEncoding === "unicode") {
    return new TextEncoder().encode(prepareUnicode(text));
  }

  return encodeWindows1252Bytes(text);
}

const SAMPLE_UNICODE =
  "Tiếng Việt kế toán: Trường đại học, dữ liệu, chứng từ và báo cáo tài chính.";

export const SAMPLE_TEXT: Record<Encoding, string> = {
  unicode: SAMPLE_UNICODE,
  vni: convertText(SAMPLE_UNICODE, "unicode", "vni"),
  tcvn3: convertText(SAMPLE_UNICODE, "unicode", "tcvn3"),
};
