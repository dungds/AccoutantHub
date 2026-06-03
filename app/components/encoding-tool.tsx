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
  const [input, setInput] = useState(SAMPLE_TEXT.unicode);
  const [sourceEncoding, setSourceEncoding] = useState<SourceEncoding>("auto");
  const [targetEncoding, setTargetEncoding] = useState<Encoding>("vni");
  const [copied, setCopied] = useState(false);
  const [activeFileName, setActiveFileName] = useState<string | null>(null);
  const [fileTransportEncoding, setFileTransportEncoding] = useState<FileTransportEncoding | null>(
    null,
  );
  const [fileNotice, setFileNotice] = useState("Bạn có thể dán văn bản hoặc tải lên một file text.");

  const deferredInput = useDeferredValue(input);

  const detectedEncoding = useMemo(() => detectEncoding(deferredInput), [deferredInput]);
  const resolvedSourceEncoding = useMemo(
    () => resolveSourceEncoding(sourceEncoding, deferredInput),
    [deferredInput, sourceEncoding],
  );
  const output = useMemo(
    () => convertText(deferredInput, resolvedSourceEncoding, targetEncoding),
    [deferredInput, resolvedSourceEncoding, targetEncoding],
  );

  const handleLoadExample = () => {
    const exampleEncoding = sourceEncoding === "auto" ? resolvedSourceEncoding : sourceEncoding;

    startTransition(() => {
      setInput(SAMPLE_TEXT[exampleEncoding]);
      setCopied(false);
    });
  };

  const handleClear = () => {
    startTransition(() => {
      setInput("");
      setCopied(false);
    });
  };

  const handleSwap = () => {
    startTransition(() => {
      setInput(output);
      setSourceEncoding(targetEncoding);
      setTargetEncoding(resolvedSourceEncoding);
      setCopied(false);
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
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
    const fileData = decodeUploadedFile(bytes, sourceEncoding);
    const inferredEncodingLabel = getEncodingLabel(fileData.inferredSourceEncoding);

    startTransition(() => {
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
    const outputBytes = encodeDownloadFile(output, targetEncoding);
    const blob = new Blob([outputBytes], {
      type:
        targetEncoding === "unicode"
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
    sourceEncoding === "auto"
      ? detectedEncoding
        ? `Đã nhận diện: ${getEncodingLabel(detectedEncoding)}`
        : "Chưa đủ tín hiệu rõ ràng, đang tạm xử lý như Unicode."
      : `Đang dùng đầu vào: ${getEncodingLabel(resolvedSourceEncoding)}`;

  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--card)] p-6 shadow-[var(--shadow)] backdrop-blur sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <span className="inline-flex items-center rounded-full border border-teal-900/10 bg-teal-900/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-teal-900">
              Công cụ đang hoạt động
            </span>
            <div>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Chuyển mã Unicode, VNI và TCVN3
              </h2>
              <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--muted)]">
                Dành cho dữ liệu kế toán cũ, biểu mẫu legacy và file text cần chuẩn hóa bảng mã
                trước khi nhập vào phần mềm khác.
              </p>
            </div>
          </div>

          <div className="grid min-w-[220px] gap-3 grid-cols-3">
            <StatCard label="Nguồn" value={getEncodingLabel(resolvedSourceEncoding)} />
            <StatCard label="Đích" value={getEncodingLabel(targetEncoding)} />
            <StatCard label="Ký tự" value={String(input.length)} />
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
            placeholder="Dán nội dung Unicode, VNI hoặc TCVN3 vào đây..."
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />

          <div className="mt-4 flex flex-wrap gap-2">
            <UploadButton onChange={handleFileUpload} />
            <ActionButton onClick={handleLoadExample}>Nạp ví dụ</ActionButton>
            <ActionButton onClick={handleClear}>Xóa nhanh</ActionButton>
          </div>

          <div className="mt-4 rounded-[1.25rem] border border-[var(--line)] bg-white/70 px-4 py-3 text-sm text-[var(--muted)]">
            <p>{fileNotice}</p>
            {activeFileName ? (
              <p className="mt-1 font-medium text-[var(--foreground)]">
                File hiện tại: {activeFileName}
                {fileTransportEncoding ? ` • ${getFileTransportLabel(fileTransportEncoding)}` : ""}
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
            value={output}
          />

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <ActionButton onClick={handleCopy}>{copied ? "Đã copy" : "Copy kết quả"}</ActionButton>
            <ActionButton onClick={handleDownload}>Tải file kết quả</ActionButton>
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
            description="Có thể đọc một file text từ máy người dùng, chuyển mã và tải lại file kết quả."
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

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-[var(--line)] bg-[#fffdf8] px-4 py-3">
      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
        {label}
      </div>
      <div className="mt-2 text-base font-semibold text-[var(--foreground)]">{value}</div>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void | Promise<void>;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center rounded-full border border-teal-900/10 bg-white px-4 py-2 text-sm font-semibold text-teal-900 transition hover:-translate-y-0.5 hover:bg-teal-50"
    >
      {children}
    </button>
  );
}

function UploadButton({ onChange }: { onChange: (event: ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <label className="inline-flex cursor-pointer items-center justify-center rounded-full border border-teal-900/10 bg-white px-4 py-2 text-sm font-semibold text-teal-900 transition hover:-translate-y-0.5 hover:bg-teal-50">
      Tải file lên
      <input
        type="file"
        accept=".txt,.csv,.html,.xml,.md,.log,.json,text/plain,text/csv,text/html,text/xml,application/json"
        className="sr-only"
        onChange={onChange}
      />
    </label>
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
