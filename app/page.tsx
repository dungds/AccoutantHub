"use client";

import { startTransition, useState } from "react";

import { EncodingTool } from "@/app/components/encoding-tool";

type ToolId = "encoding" | "number-to-words" | "tax-tools" | "invoice-tools";

type ToolDefinition = {
  id: ToolId;
  category: string;
  name: string;
  summary: string;
  status: "active" | "coming-soon";
};

const tools: ToolDefinition[] = [
  {
    id: "encoding",
    category: "Dữ liệu legacy",
    name: "Chuyển mã văn bản",
    summary: "Unicode, VNI, TCVN3, upload file và tải kết quả ngay trên trình duyệt.",
    status: "active",
  },
  {
    id: "number-to-words",
    category: "Chứng từ",
    name: "Đổi số thành chữ",
    summary: "Khu vực dành sẵn cho tiện ích đọc số tiền bằng chữ trong chứng từ kế toán.",
    status: "coming-soon",
  },
  {
    id: "tax-tools",
    category: "Tra cứu",
    name: "Công cụ thuế",
    summary: "Khu vực dành cho các tiện ích hỗ trợ kiểm tra, đối chiếu và chuẩn hóa dữ liệu thuế.",
    status: "coming-soon",
  },
  {
    id: "invoice-tools",
    category: "Hóa đơn",
    name: "Xử lý hóa đơn",
    summary: "Không gian cho các tính năng tách dữ liệu, chuẩn hóa nội dung và thao tác file hóa đơn.",
    status: "coming-soon",
  },
];

export default function HomePage() {
  const [activeToolId, setActiveToolId] = useState<ToolId>("encoding");

  const activeTool = tools.find((tool) => tool.id === activeToolId) ?? tools[0];
  const activeCount = tools.filter((tool) => tool.status === "active").length;

  return (
    <main className="relative overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col gap-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--card)] p-6 shadow-[var(--shadow)] backdrop-blur sm:p-8">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-700 via-amber-500 to-teal-700" />
          <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
            <div className="space-y-4">
              <span className="inline-flex items-center rounded-full border border-teal-800/10 bg-teal-800/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-teal-800">
                Kế toán Hub
              </span>
              <div className="space-y-3">
                <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl">
                  Bộ công cụ kế toán gọn, nhanh và có thể mở rộng dần theo từng nhu cầu
                </h1>
                <p className="max-w-2xl text-base leading-7 text-[var(--muted)] sm:text-lg">
                  Trang này được sắp theo kiểu nhiều module. Hôm nay đang có công cụ chuyển mã,
                  sau này có thể thêm từng chức năng mới mà không phải thay lại giao diện tổng thể.
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

            <div className="rounded-[1.5rem] border border-[var(--line)] bg-white/72 p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                Tổng quan hệ thống
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                <OverviewStat label="Tổng module" value={String(tools.length)} />
                <OverviewStat label="Đang dùng" value={String(activeCount)} />
                <OverviewStat label="Đang chọn" value={activeTool.name} />
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[320px_1fr]">
          <aside className="rounded-[2rem] border border-[var(--line)] bg-[var(--card)] p-5 shadow-[var(--shadow)] backdrop-blur sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">Danh sách chức năng</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Chọn từng module để làm việc hoặc dành chỗ cho cập nhật sau.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {tools.map((tool) => {
                const isActive = tool.id === activeToolId;

                return (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => {
                      startTransition(() => setActiveToolId(tool.id));
                    }}
                    className={`w-full rounded-[1.5rem] border p-4 text-left transition ${
                      isActive
                        ? "border-teal-700 bg-teal-900 text-white shadow-lg"
                        : "border-[var(--line)] bg-white/75 text-[var(--foreground)] hover:-translate-y-0.5 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div
                          className={`text-xs font-semibold uppercase tracking-[0.22em] ${
                            isActive ? "text-teal-100" : "text-[var(--muted)]"
                          }`}
                        >
                          {tool.category}
                        </div>
                        <div className="mt-2 text-lg font-semibold">{tool.name}</div>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                          tool.status === "active"
                            ? isActive
                              ? "bg-white/16 text-white"
                              : "bg-teal-900/8 text-teal-900"
                            : isActive
                              ? "bg-white/14 text-teal-50"
                              : "bg-amber-700/10 text-amber-900"
                        }`}
                      >
                        {tool.status === "active" ? "Sẵn sàng" : "Sắp cập nhật"}
                      </span>
                    </div>
                    <p
                      className={`mt-3 text-sm leading-6 ${
                        isActive ? "text-teal-50/92" : "text-[var(--muted)]"
                      }`}
                    >
                      {tool.summary}
                    </p>
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="space-y-6">
            {activeTool.id === "encoding" ? (
              <EncodingTool />
            ) : (
              <ComingSoonPanel tool={activeTool} />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function OverviewStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-[var(--line)] bg-[#fffdf8] px-4 py-3">
      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
        {label}
      </div>
      <div className="mt-2 text-base font-semibold text-[var(--foreground)]">{value}</div>
    </div>
  );
}

function ComingSoonPanel({ tool }: { tool: ToolDefinition }) {
  return (
    <section className="rounded-[2rem] border border-[var(--line)] bg-[var(--card)] p-6 shadow-[var(--shadow)] backdrop-blur sm:p-8">
      <div className="max-w-3xl space-y-4">
        <span className="inline-flex items-center rounded-full border border-amber-800/10 bg-amber-700/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-amber-900">
          Module sắp cập nhật
        </span>
        <div>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{tool.name}</h2>
          <p className="mt-3 text-base leading-7 text-[var(--muted)]">{tool.summary}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <PlaceholderCard
            title="Khung đã sẵn"
            description="Layout tổng đã có sẵn để gắn công cụ mới mà không cần sửa lại trang chủ."
          />
          <PlaceholderCard
            title="Ưu tiên đúng ngữ cảnh"
            description="Mỗi module mới có thể có input, output và hướng xử lý riêng cho nghiệp vụ kế toán."
          />
          <PlaceholderCard
            title="Cập nhật dần"
            description="Khi bạn chốt chức năng tiếp theo, mình chỉ cần bổ sung module và nối vào danh sách này."
          />
        </div>
      </div>
    </section>
  );
}

function PlaceholderCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-[1.5rem] border border-[var(--line)] bg-white/75 p-5">
      <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-[var(--foreground)]">{description}</p>
    </article>
  );
}
