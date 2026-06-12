import type { Metadata } from "next";
import { Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Lễ Tốt Nghiệp của Bùi Lê Tuấn",
  description: "Trân trọng kính mời mọi người đến tham dự Lễ tốt nghiệp của Bùi Lê Tuấn — ngành Kỹ thuật Phần mềm CMU, Khoa Đào tạo Quốc tế, Đại học Duy Tân vào lúc 13h30 ngày 15/06/2026. Sự hiện diện của mọi người là niềm vinh hạnh lớn đối với mình!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${outfit.variable} ${playfair.variable} h-full scroll-smooth antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-[#F5F3EE] text-[#1A1A2E] font-sans selection:bg-[#0F2A4A] selection:text-white">
        {children}
      </body>
    </html>
  );
}

