"use client";

import { startTransition, useDeferredValue, useMemo, useState, type ReactNode } from "react";

import {
  convertText,
  detectEncoding,
  getEncodingLabel,
  resolveSourceEncoding,
  SAMPLE_TEXT,
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

export default function HomePage() {
  const [input, setInput] = useState(SAMPLE_TEXT.unicode);
  const [sourceEncoding, setSourceEncoding] = useState<SourceEncoding>("auto");
  const [targetEncoding, setTargetEncoding] = useState<Encoding>("vni");
  const [copied, setCopied] = useState(false);

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

  const sourceDescription =
    sourceEncoding === "auto"
      ? detectedEncoding
        ? `Đã nhận diện: ${getEncodingLabel(detectedEncoding)}`
        : "Chưa đủ tín hiệu rõ ràng, đang tạm xử lý như Unicode."
      : `Đang dùng đầu vào: ${getEncodingLabel(resolvedSourceEncoding)}`;

  return (
    <main className="relative overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col gap-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--card)] p-6 shadow-[var(--shadow)] backdrop-blur sm:p-8">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-700 via-amber-500 to-teal-700" />
          <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
            <div className="space-y-4">
              <span className="inline-flex items-center rounded-full border border-teal-800/10 bg-teal-800/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-teal-800">
                Next.js + TypeScript + Tailwind
              </span>
              <div className="space-y-3">
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl">
                  Chuyển mã Unicode, VNI và TCVN3 ngay trong trình duyệt
                </h1>
                <p className="max-w-2xl text-base leading-7 text-[var(--muted)] sm:text-lg">
                  Toàn bộ xử lý chạy ở client-side. Không backend, không database, không upload dữ
                  liệu lên server.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-sm text-[var(--muted)]">
                <span className="rounded-full border border-[var(--line)] bg-white/70 px-3 py-1">
                  Deploy được trên Vercel Free
                </span>
                <span className="rounded-full border border-[var(--line)] bg-white/70 px-3 py-1">
                  Hỗ trợ copy nhanh kết quả
                </span>
                <span className="rounded-full border border-[var(--line)] bg-white/70 px-3 py-1">
                  Có tự nhận diện đầu vào
                </span>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-[var(--line)] bg-white/70 p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                Trạng thái
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                <StatCard label="Nguồn" value={getEncodingLabel(resolvedSourceEncoding)} />
                <StatCard label="Đích" value={getEncodingLabel(targetEncoding)} />
                <StatCard label="Ký tự" value={String(input.length)} />
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-start">
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--card)] p-5 shadow-[var(--shadow)] backdrop-blur sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">Nội dung đầu vào</h2>
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
              <ActionButton onClick={handleLoadExample}>Nạp ví dụ</ActionButton>
              <ActionButton onClick={handleClear}>Xóa nhanh</ActionButton>
            </div>
          </div>

          <div className="flex justify-center lg:pt-24">
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
                <h2 className="text-xl font-semibold">Kết quả đầu ra</h2>
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
              <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-sm font-medium text-teal-900">
                {sourceEncoding === "auto" ? "Auto source" : getEncodingLabel(resolvedSourceEncoding)} →{" "}
                {getEncodingLabel(targetEncoding)}
              </span>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <InfoCard
            title="Client-side hoàn toàn"
            description="Logic chuyển mã là TypeScript thuần, chạy ngay trong browser bằng các bảng map tĩnh."
          />
          <InfoCard
            title="Phù hợp Vercel Free"
            description="Không có API route, không có server state và không cần dịch vụ ngoài để deploy."
          />
          <InfoCard
            title="Dễ mở rộng"
            description="Có thể bổ sung thêm auto-detect tốt hơn hoặc thêm các bảng mã khác mà không đổi kiến trúc."
          />
        </section>
      </div>
    </main>
  );
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

function InfoCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-[1.75rem] border border-[var(--line)] bg-[var(--card)] p-5 shadow-[var(--shadow)] backdrop-blur">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p>
    </article>
  );
}
