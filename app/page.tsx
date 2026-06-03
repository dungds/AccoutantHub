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

export default function HomePage() {
  const [activeToolId, setActiveToolId] = useState<ToolId>("encoding");

  const activeTool = tools.find((tool) => tool.id === activeToolId) ?? tools[0];

  return (
    <main className="relative overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col gap-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--card)] p-6 shadow-[var(--shadow)] backdrop-blur sm:p-8">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-700 via-amber-500 to-teal-700" />
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
      </div>
    </main>
  );
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
