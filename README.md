# Unicode / VNI / TCVN3 Converter

Ung dung Next.js + TypeScript chuyen doi giua `Unicode`, `VNI Windows` va `TCVN3 (ABC)` hoan toan o phia client.

## Diem chinh

- Khong backend
- Khong database
- Khong upload du lieu len server
- UI dung Tailwind CSS
- Deploy duoc tren Vercel Free
- Co the tai file text len, chuyen ma va tai file ket qua xuong ngay tren trinh duyet

## Chay local

```bash
npm install
npm run dev
```

Mo [http://localhost:3000](http://localhost:3000).

## Build production

```bash
npm run build
npm run start
```

## Deploy Vercel

Project khong can cau hinh server rieng. Chi can import repo vao Vercel va deploy nhu mot app Next.js thong thuong.

## Ghi chu ky thuat

- Logic chuyen ma nam trong [lib/vietnamese-encoding.ts](/Users/admin/Documents/Projects/Ketoanhub/lib/vietnamese-encoding.ts)
- App Router UI nam trong [app/page.tsx](/Users/admin/Documents/Projects/Ketoanhub/app/page.tsx)
- Du lieu mapping duoc xay dung tu cac bang ma legacy pho bien cua VietUnicode va du an ma nguon mo `u-convert`
