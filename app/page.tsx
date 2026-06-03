"use client";

import { startTransition, useState } from "react";

import { EncodingTool } from "@/app/components/encoding-tool";

type ToolId = "encoding" | "number-to-words" | "tax-tools" | "invoice-tools";

type ToolDefinition = {
  id: ToolId;
  name: string;
  summary: string;
  status: "active" | "coming-soon";
};

const tools: ToolDefinition[] = [
  {
    id: "encoding",
    name: "Chuyển mã văn bản",
    summary: "Unicode, VNI, TCVN3, upload file và tải kết quả ngay trên trình duyệt.",
    status: "active",
  },
  {
    id: "number-to-words",
    name: "Đổi số thành chữ",
    summary: "Khu vực dành sẵn cho tiện ích đọc số tiền bằng chữ trong chứng từ kế toán.",
    status: "coming-soon",
  },
  {
    id: "tax-tools",
    name: "Công cụ thuế",
    summary: "Khu vực dành cho các tiện ích hỗ trợ kiểm tra, đối chiếu và chuẩn hóa dữ liệu thuế.",
    status: "coming-soon",
  },
  {
    id: "invoice-tools",
    name: "Xử lý hóa đơn",
    summary: "Không gian cho các tính năng tách dữ liệu, chuẩn hóa nội dung và thao tác file hóa đơn.",
    status: "coming-soon",
  },
];

type ExchangeRatesState = {
  asOf: string;
  rates: {
    USD: number;
    EUR: number;
    GBP: number;
  };
};

export default function HomePage() {
  const [activeToolId, setActiveToolId] = useState<ToolId>("encoding");
  const [exchangeRates, setExchangeRates] = useState<ExchangeRatesState | null>(null);
  const [exchangeRatesLoading, setExchangeRatesLoading] = useState(false);
  const [exchangeRatesError, setExchangeRatesError] = useState<string | null>(null);

  const activeTool = tools.find((tool) => tool.id === activeToolId) ?? tools[0];

  const handleFetchExchangeRates = async () => {
    try {
      setExchangeRatesLoading(true);
      setExchangeRatesError(null);

      const response = await fetch(
        "https://api.frankfurter.dev/v2/rates?base=VND&quotes=USD,EUR,GBP",
      );

      if (!response.ok) {
        throw new Error("Không lấy được dữ liệu tỷ giá.");
      }

      const data = (await response.json()) as Array<{
        date: string;
        base: string;
        quote: "USD" | "EUR" | "GBP";
        rate: number;
      }>;

      const usd = data.find((item) => item.quote === "USD")?.rate;
      const eur = data.find((item) => item.quote === "EUR")?.rate;
      const gbp = data.find((item) => item.quote === "GBP")?.rate;
      const asOf = data[0]?.date;

      if (!asOf || !usd || !eur || !gbp) {
        throw new Error("Dữ liệu tỷ giá không đầy đủ.");
      }

      setExchangeRates({
        asOf,
        rates: {
          USD: 1 / usd,
          EUR: 1 / eur,
          GBP: 1 / gbp,
        },
      });
    } catch (error) {
      setExchangeRatesError(
        error instanceof Error ? error.message : "Đã có lỗi khi lấy tỷ giá.",
      );
    } finally {
      setExchangeRatesLoading(false);
    }
  };

  return (
    <main className="relative overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col gap-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--card)] p-6 shadow-[var(--shadow)] backdrop-blur sm:p-8">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-700 via-amber-500 to-teal-700" />
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
            <div className="space-y-4">
              <span className="inline-flex items-center rounded-full border border-teal-800/10 bg-teal-800/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-teal-800">
                Kế toán Hub
              </span>
              <div className="space-y-3">
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl">
                  Bộ công cụ kế toán gọn, nhanh.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-[var(--muted)] sm:text-lg">
                  Bộ công cụ kế toán phục vụ nhu cầu cá nhân
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-sm text-[var(--muted)]">
                <span className="rounded-full border border-[var(--line)] bg-white/70 px-3 py-1">
                  Không gian đa công cụ
                </span>
                <span className="rounded-full border border-[var(--line)] bg-white/70 px-3 py-1">
                  Mở rộng theo từng đợt
                </span>
                <span className="rounded-full border border-[var(--line)] bg-white/70 px-3 py-1">
                  Ưu tiên chạy client-side
                </span>
              </div>
            </div>

            <aside className="rounded-[1.75rem] border border-[var(--line)] bg-white/72 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                    Tỷ giá tham khảo
                  </div>
                  <p className="mt-1 text-sm text-[var(--muted)]">USD, EUR, GBP theo VND</p>
                </div>
                <button
                  type="button"
                  onClick={handleFetchExchangeRates}
                  className="inline-flex items-center justify-center rounded-full border border-teal-900/10 bg-white px-4 py-2 text-sm font-semibold text-teal-900 transition hover:-translate-y-0.5 hover:bg-teal-50"
                  disabled={exchangeRatesLoading}
                >
                  {exchangeRatesLoading ? "Đang lấy..." : "Lấy tỷ giá"}
                </button>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                <RateStat label="Đô la Mỹ" code="USD" value={exchangeRates?.rates.USD ?? null} />
                <RateStat label="Euro" code="EUR" value={exchangeRates?.rates.EUR ?? null} />
                <RateStat label="Bảng Anh" code="GBP" value={exchangeRates?.rates.GBP ?? null} />
              </div>

              <div className="mt-4 text-sm text-[var(--muted)]">
                {exchangeRatesError ? (
                  <p>{exchangeRatesError}</p>
                ) : exchangeRates ? (
                  <p>Dữ liệu ngày {exchangeRates.asOf} từ Frankfurter.</p>
                ) : (
                  <p>Bấm nút để lấy tỷ giá thủ công.</p>
                )}
              </div>
            </aside>
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-[2rem] border border-[var(--line)] bg-[var(--card)] p-5 shadow-[var(--shadow)] backdrop-blur sm:p-6">
            <div>
              <h2 className="text-xl font-semibold">Danh sách chức năng</h2>
              
            </div>

            <div className="mt-5 flex gap-3 overflow-x-auto pb-1">
              {tools.map((tool) => {
                const isActive = tool.id === activeToolId;
                const isComingSoon = tool.status === "coming-soon";

                return (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => {
                      startTransition(() => setActiveToolId(tool.id));
                    }}
                    className={`min-w-[180px] rounded-[1.1rem] border px-4 py-3 text-left transition sm:min-w-[210px] ${
                      isActive
                        ? "border-teal-700 bg-teal-900 text-white shadow-lg"
                        : isComingSoon
                          ? "border-slate-300 bg-slate-100 text-slate-500 hover:bg-slate-200"
                          : "border-[var(--line)] bg-white/75 text-[var(--foreground)] hover:-translate-y-0.5 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold sm:text-base">{tool.name}</div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                          tool.status === "active"
                            ? isActive
                              ? "bg-white/16 text-white"
                              : "bg-teal-900/8 text-teal-900"
                            : isActive
                              ? "bg-white/14 text-teal-50"
                              : "bg-slate-200 text-slate-400"
                        }`}
                      >
                        {tool.status === "active" ? "Pro" : "Đang cập nhật"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {activeTool.id === "encoding" ? (
            <EncodingTool />
          ) : (
            <ComingSoonPanel tool={activeTool} />
          )}
        </section>

        <footer className="rounded-[1.5rem] border border-[var(--line)] bg-white/65 px-5 py-4 text-sm text-[var(--muted)] shadow-[var(--shadow)] backdrop-blur">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 Kế toán Hub. All rights reserved.</p>
            <p>Công cụ kế toán chạy nhanh trên trình duyệt, cập nhật dần theo từng nhu cầu sử dụng.</p>
          </div>
        </footer>
      </div>
    </main>
  );
}

function RateStat({
  label,
  code,
  value,
}: {
  label: string;
  code: string;
  value: number | null;
}) {
  return (
    <div className="rounded-[1.25rem] border border-[var(--line)] bg-[#fffdf8] px-4 py-3">
      <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
        {label}
      </div>
      <div className="mt-2 text-base font-semibold text-[var(--foreground)]">
        {value ? formatVndRate(value) : "--"}
      </div>
      <div className="mt-1 text-xs text-[var(--muted)]">1 {code}</div>
    </div>
  );
}

function formatVndRate(value: number) {
  return `${new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0,
  }).format(value)} VND`;
}

function ComingSoonPanel({ tool }: { tool: ToolDefinition }) {
  return (
    <section className="rounded-[2rem] border border-[var(--line)] bg-[var(--card)] p-6 shadow-[var(--shadow)] backdrop-blur sm:p-8">
      <div className="space-y-4">
        <span className="inline-flex items-center rounded-full border border-amber-800/10 bg-amber-700/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-amber-900">
          Module sắp cập nhật
        </span>
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{tool.name}</h2>
        <p className="text-sm font-medium text-[var(--muted)]">Chức năng này đang cập nhật.</p>
      </div>
    </section>
  );
}
