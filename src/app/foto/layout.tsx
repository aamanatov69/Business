import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Управление карточками", robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};
export default function FotoLayout({ children }: { children: React.ReactNode }) { return children; }
