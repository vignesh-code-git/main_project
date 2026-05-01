import { Outfit, Cinzel, Bodoni_Moda, Montserrat } from "next/font/google";
import Script from 'next/script';
import "./globals.css";
import ReduxProvider from "@/lib/redux/ReduxProvider";
import { ToastProvider } from "@/context/ToastContext";

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-cinzel",
});

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bodoni",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
});

export const metadata = {
  title: "SHOP.CO | Find Clothes That Match Your Style",
  description: "Explore our diverse range of meticulously crafted garments, designed to bring out your individuality and cater to your sense of style.",
};

import LayoutWrapper from "@/components/LayoutWrapper/LayoutWrapper";

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${outfit.variable} ${cinzel.variable} ${bodoni.variable} ${montserrat.variable} ${outfit.className}`}>
      <body>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" />
        <ReduxProvider>
          <ToastProvider>
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
          </ToastProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
