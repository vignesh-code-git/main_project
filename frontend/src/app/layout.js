import { Outfit } from "next/font/google";
import "./globals.css";
import ReduxProvider from "@/lib/redux/ReduxProvider";

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
        <ReduxProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </ReduxProvider>
      </body>
    </html>
  );
}
