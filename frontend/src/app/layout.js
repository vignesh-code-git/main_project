import { Outfit } from "next/font/google";
import Script from 'next/script';
import "./globals.css";
import ReduxProvider from "@/lib/redux/ReduxProvider";
import { ToastProvider } from "@/context/ToastContext";

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "SHOP.CO | Find Clothes That Match Your Style",
  description: "Explore our diverse range of meticulously crafted garments, designed to bring out your individuality and cater to your sense of style.",
};

import LayoutWrapper from "@/components/LayoutWrapper/LayoutWrapper";

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={outfit.className}>
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
