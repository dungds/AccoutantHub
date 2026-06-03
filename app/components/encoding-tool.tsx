"use client";

import {
  startTransition,
  useDeferredValue,
  useMemo,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";

import {
  convertText,
  decodeUploadedFile,
  detectEncoding,
  encodeDownloadFile,
  getFileTransportLabel,
  getEncodingLabel,
  resolveSourceEncoding,
  SAMPLE_TEXT,
  type FileTransportEncoding,
  type Encoding,
  type SourceEncoding,
} from "@/lib/vietnamese-encoding";
import {
  convertWorkbookAllSheets,
  getWorkbookPreview,
  inferWorkbookFileType,
  readWorkbook,
  type WorkbookBundle,
} from "@/lib/xlsx-workbook";

const sourceOptions: Array<{ value: SourceEncoding; label: string }> = [
  { value: "auto", label: "Tự nhận diện" },
  { value: "unicode", label: "Unicode" },
  { value: "vni", label: "VNI Windows" },
  { value: "tcvn3", label: "TCVN3 (ABC)" },
];

const targetOptions: Array<{ value: Encoding; label: string }> = [
  { value: "unicode", label: "Unicode" },
  { value: "vni", label: "VNI Windows" },
  { value: "tcvn3", label: "TCVN3 (ABC)" },
];

export function EncodingTool() {
  const [input, setInput] = useState(SAMPLE_TEXT.vni);
  const [sourceEncoding, setSourceEncoding] = useState<SourceEncoding>("auto");
  const [targetEncoding, setTargetEncoding] = useState<Encoding>("unicode");
  const [copied, setCopied] = useState(false);
  const [activeFileName, setActiveFileName] = useState<string | null>(null);
  const [fileTransportEncoding, setFileTransportEncoding] = useState<FileTransportEncoding | null>(
    null,
  );
  const [fileNotice, setFileNotice] = useState("Bạn có thể dán văn bản hoặc tải lên một file text.");
  const [workbookBundle, setWorkbookBundle] = useState<WorkbookBundle | null>(null);
  const [workbookBytes, setWorkbookBytes] = useState<Uint8Array | null>(null);

  const deferredInput = useDeferredValue(input);
  const isWorkbookMode = Boolean(workbookBundle && workbookBytes);

  const detectedEncoding = useMemo(() => detectEncoding(deferredInput), [deferredInput]);
  const resolvedSourceEncoding = useMemo(
    () => resolveSourceEncoding(sourceEncoding, deferredInput),
    [deferredInput, sourceEncoding],
  );
  const textOutput = useMemo(
    () => convertText(deferredInput, resolvedSourceEncoding, targetEncoding),
    [deferredInput, resolvedSourceEncoding, targetEncoding],
  );
  const workbookPreviewInput = useMemo(() => {
    if (!workbookBundle) {
      return "";
    }

    return getWorkbookPreview(workbookBundle.workbook);
  }, [workbookBundle]);
  const workbookPreviewOutput = useMemo(
    () => convertText(workbookPreviewInput, resolvedSourceEncoding, targetEncoding),
    [resolvedSourceEncoding, targetEncoding, workbookPreviewInput],
  );
  const inputDisplayValue = isWorkbookMode ? workbookPreviewInput : input;
  const outputDisplayValue = isWorkbookMode ? workbookPreviewOutput : textOutput;

  const handleLoadExample = () => {
    const exampleEncoding = sourceEncoding === "auto" ? resolvedSourceEncoding : sourceEncoding;

    startTransition(() => {
      setWorkbookBundle(null);
      setWorkbookBytes(null);
      setActiveFileName(null);
      setFileTransportEncoding(null);
      setInput(SAMPLE_TEXT[exampleEncoding]);
      setFileNotice("Bạn có thể dán văn bản hoặc tải lên một file text.");
      setCopied(false);
    });
  };

  const handleClear = () => {
    startTransition(() => {
      setWorkbookBundle(null);
      setWorkbookBytes(null);
      setActiveFileName(null);
      setFileTransportEncoding(null);
      setInput("");
      setFileNotice("Bạn có thể dán văn bản hoặc tải lên một file text.");
      setCopied(false);
    });
  };

  const handleSwap = () => {
    startTransition(() => {
      setInput(outputDisplayValue);
      setWorkbookBundle(null);
      setWorkbookBytes(null);
      setActiveFileName(null);
      setFileTransportEncoding(null);
      setFileNotice("Bạn có thể dán văn bản hoặc tải lên một file text.");
      setSourceEncoding(targetEncoding);
      setTargetEncoding(resolvedSourceEncoding);
      setCopied(false);
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(outputDisplayValue);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const bytes = new Uint8Array(await file.arrayBuffer());

    const workbookFileType = inferWorkbookFileType(file.name);

    if (workbookFileType) {
      const workbookData = readWorkbook(bytes, workbookFileType);
      const totalRows = workbookData.sheets.reduce((sum, sheet) => sum + sheet.rowCount, 0);
      const workbookLabel =
        workbookFileType === "xlsm"
          ? "Excel macro-enabled"
          : workbookFileType === "xls"
            ? "Excel 97-2003"
            : "Excel workbook";

      startTransition(() => {
        setWorkbookBundle(workbookData);
        setWorkbookBytes(bytes);
        setActiveFileName(file.name);
        setFileTransportEncoding(null);
        setFileNotice(
          `Đã nạp ${file.name} (${workbookLabel}). File có ${workbookData.sheets.length} sheet và ${totalRows} dòng, sẽ chuyển toàn bộ ô text khi tải kết quả.`,
        );
        setCopied(false);
      });

      event.target.value = "";
      return;
    }

    const fileData = decodeUploadedFile(bytes, sourceEncoding);
    const inferredEncodingLabel = getEncodingLabel(fileData.inferredSourceEncoding);

    startTransition(() => {
      setWorkbookBundle(null);
      setWorkbookBytes(null);
      setInput(fileData.text);
      setActiveFileName(file.name);
      setFileTransportEncoding(fileData.transportEncoding);
      setFileNotice(
        `Đã đọc ${file.name} bằng ${getFileTransportLabel(fileData.transportEncoding)}. Bảng mã nhận được: ${inferredEncodingLabel}.`,
      );
      setCopied(false);
    });

    event.target.value = "";
  };

  const handleDownload = () => {
    const outputBytes = isWorkbookMode && workbookBytes
      ? convertWorkbookAllSheets(
          workbookBytes,
          workbookBundle!.fileType,
          resolvedSourceEncoding,
          targetEncoding,
        )
      : encodeDownloadFile(textOutput, targetEncoding);
    const blob = new Blob([new Uint8Array(outputBytes).buffer], {
      type: isWorkbookMode
        ? workbookBundle!.fileType === "xls"
          ? "application/vnd.ms-excel"
          : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        : targetEncoding === "unicode"
          ? "text/plain;charset=utf-8"
          : "application/octet-stream",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = createDownloadFileName(activeFileName, targetEncoding);
    anchor.click();

    URL.revokeObjectURL(url);
  };

  const sourceDescription =
    isWorkbookMode
      ? "Workbook đang ở chế độ xem trước. Khi tải file kết quả, toàn bộ ô text trong workbook sẽ được chuyển."
      : sourceEncoding === "auto"
      ? detectedEncoding
        ? `Đã nhận diện: ${getEncodingLabel(detectedEncoding)}`
        : "Chưa đủ tín hiệu rõ ràng, đang tạm xử lý như Unicode."
      : `Đang dùng đầu vào: ${getEncodingLabel(resolvedSourceEncoding)}`;

  return (
    <section className="space-y-6 p-4 border-2 border-[var(--line)] rounded-2xl">
      <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--card)] p-5 shadow-[var(--shadow)] backdrop-blur sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-teal-900/10 bg-teal-900/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-900">
                Công cụ đang hoạt động
              </span>
              <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                Chuyển mã Unicode, VNI, TCVN3
              </h2>
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
              Chuẩn hóa bảng mã cho dữ liệu kế toán cũ và file text legacy.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <CompactStat label="Nguồn" value={getEncodingLabel(resolvedSourceEncoding)} />
            <CompactStat label="Đích" value={getEncodingLabel(targetEncoding)} />
            <CompactStat label="Ký tự" value={String(input.length)} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_auto_1fr] xl:items-start">
        <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--card)] p-5 shadow-[var(--shadow)] backdrop-blur sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold">Nội dung đầu vào</h3>
              <p className="mt-1 text-sm text-[var(--muted)]">{sourceDescription}</p>
            </div>
            <label className="min-w-[180px]">
              <span className="sr-only">Bảng mã nguồn</span>
              <select
                className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-teal-700"
                value={sourceEncoding}
                onChange={(event) => setSourceEncoding(event.target.value as SourceEncoding)}
              >
                {sourceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <textarea
            className="mt-5 min-h-[340px] w-full resize-y rounded-[1.5rem] border border-[var(--line)] bg-[#fffdfa] p-4 text-base leading-7 text-[var(--foreground)] outline-none transition focus:border-teal-700"
            placeholder={
              isWorkbookMode
                ? "Xem trước một phần dữ liệu text trong workbook Excel..."
                : "Dán nội dung Unicode, VNI hoặc TCVN3 vào đây..."
            }
            value={inputDisplayValue}
            onChange={(event) => setInput(event.target.value)}
            readOnly={isWorkbookMode}
          />

          <div className="mt-4 flex flex-wrap gap-2">
            <UploadButton onChange={handleFileUpload} />
            <ActionButton onClick={handleLoadExample}>Nạp ví dụ</ActionButton>
            <ActionButton onClick={handleClear}>Xóa nhanh</ActionButton>
          </div>

          {isWorkbookMode && workbookBundle ? (
            <div className="mt-4 rounded-[1.25rem] border border-[var(--line)] bg-white/70 px-4 py-4">
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  Excel
                </h4>
                <p className="mt-1 text-sm text-[var(--foreground)]">
                  File Excel sẽ được chuyển toàn bộ ở tất cả sheet. Bản xem trước bên trên chỉ là một phần nội dung text tìm thấy trong workbook.
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {workbookBundle.sheets.map((sheet) => (
                  <span
                    key={sheet.name}
                    className="rounded-full border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--foreground)]"
                  >
                    {sheet.name} • {sheet.rowCount} dòng
                  </span>
                ))}
              </div>

              <p className="mt-3 text-sm text-[var(--muted)]">
                Tổng số sheet: {workbookBundle.sheets.length}.
              </p>
            </div>
          ) : null}

          <div className="mt-4 rounded-[1.25rem] border border-[var(--line)] bg-white/70 px-4 py-3 text-sm text-[var(--muted)]">
            <p>{fileNotice}</p>
            {activeFileName ? (
              <p className="mt-1 font-medium text-[var(--foreground)]">
                File hiện tại: {activeFileName}
                {isWorkbookMode
                  ? workbookBundle!.fileType === "xlsm"
                    ? " • Excel macro-enabled"
                    : workbookBundle!.fileType === "xls"
                      ? " • Excel 97-2003"
                      : " • Excel workbook"
                  : fileTransportEncoding
                    ? ` • ${getFileTransportLabel(fileTransportEncoding)}`
                    : ""}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex justify-center xl:pt-24">
          <button
            type="button"
            onClick={handleSwap}
            className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-[var(--line)] bg-white text-xl font-semibold text-teal-800 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
            aria-label="Đảo chiều chuyển mã"
            title="Đảo chiều chuyển mã"
          >
            ⇄
          </button>
        </div>

        <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--card)] p-5 shadow-[var(--shadow)] backdrop-blur sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold">Kết quả đầu ra</h3>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Chuyển đổi trực tiếp trên máy của người dùng.
              </p>
            </div>
            <label className="min-w-[180px]">
              <span className="sr-only">Bảng mã đích</span>
              <select
                className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-teal-700"
                value={targetEncoding}
                onChange={(event) => setTargetEncoding(event.target.value as Encoding)}
              >
                {targetOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <textarea
            readOnly
            className="mt-5 min-h-[340px] w-full resize-y rounded-[1.5rem] border border-[var(--line)] bg-[#f8f5ee] p-4 text-[15px] leading-7 text-[var(--foreground)] outline-none"
            style={{
              fontFamily:
                'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            }}
            value={outputDisplayValue}
          />

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <ActionButton onClick={handleCopy}>
              {copied ? "Đã copy" : isWorkbookMode ? "Copy xem trước" : "Copy kết quả"}
            </ActionButton>
            <ActionButton onClick={handleDownload} icon={<DownloadIcon />}>
              {isWorkbookMode ? "Tải file Excel kết quả" : "Tải file kết quả"}
            </ActionButton>
            <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-sm font-medium text-teal-900">
              {sourceEncoding === "auto" ? "Auto source" : getEncodingLabel(resolvedSourceEncoding)}{" "}
              → {getEncodingLabel(targetEncoding)}
            </span>
          </div>
        </div>
      </div>

      <aside className="rounded-[2rem] border border-[var(--line)] bg-white/70 p-6 shadow-[var(--shadow)] backdrop-blur">
        <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
          Ghi chú nhanh
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <InfoCard
            title="Client-side hoàn toàn"
            description="Dữ liệu được xử lý ngay trong trình duyệt, không cần backend hay upload lên server."
          />
          <InfoCard
            title="Upload rồi tải xuống"
            description="Có thể đọc file text, XLSX, XLS hoặc XLSM và tải lại file kết quả ngay trên trình duyệt."
          />
          <InfoCard
            title="Phù hợp Vercel Free"
            description="Không có API route, không có server state và không cần dịch vụ ngoài để deploy."
          />
        </div>
      </aside>
    </section>
  );
}

function createDownloadFileName(fileName: string | null, targetEncoding: Encoding) {
  if (!fileName) {
    return `converted-${targetEncoding}.txt`;
  }

  const lastDotIndex = fileName.lastIndexOf(".");

  if (lastDotIndex <= 0) {
    return `${fileName}-${targetEncoding}.txt`;
  }

  const baseName = fileName.slice(0, lastDotIndex);
  const extension = fileName.slice(lastDotIndex);

  return `${baseName}-${targetEncoding}${extension}`;
}

function CompactStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[#fffdf8] px-3 py-2">
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-[var(--foreground)]">{value}</div>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  icon,
}: {
  children: ReactNode;
  onClick: () => void | Promise<void>;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center rounded-full border border-teal-900/10 bg-white px-4 py-2 text-sm font-semibold text-teal-900 transition hover:-translate-y-0.5 hover:bg-teal-50"
    >
      {icon ? <span className="mr-2 inline-flex h-4 w-4 items-center justify-center">{icon}</span> : null}
      {children}
    </button>
  );
}

function UploadButton({ onChange }: { onChange: (event: ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <label className="inline-flex cursor-pointer items-center justify-center rounded-full border border-teal-900/10 bg-white px-4 py-2 text-sm font-semibold text-teal-900 transition hover:-translate-y-0.5 hover:bg-teal-50">
      <span className="mr-2 inline-flex h-4 w-4 items-center justify-center">
        <FileIcon />
      </span>
      Tải file lên
      <input
        type="file"
        accept=".txt,.csv,.html,.xml,.md,.log,.json,.xlsx,.xls,.xlsm,text/plain,text/csv,text/html,text/xml,application/json,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
        className="sr-only"
        onChange={onChange}
      />
    </label>
  );
}

function FileIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
      <path
        d="M6.25 2.5h5l3.75 3.75v8.125A1.875 1.875 0 0 1 13.125 16.25h-6.25A1.875 1.875 0 0 1 5 14.375v-10A1.875 1.875 0 0 1 6.875 2.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M11.25 2.5v3.75H15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 9.375h5M7.5 12.5h5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
      <path
        d="M10 3.75v7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M6.875 8.75 10 11.875 13.125 8.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.375 14.375h11.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function InfoCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-[1.5rem] border border-[var(--line)] bg-[#fffdf7] p-4">
      <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
        {title}
      </h4>
      <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">{description}</p>
    </article>
  );
}
