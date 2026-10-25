import "./globals.css";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Providers from "./providers";

export const metadata = {
  metadataBase: new URL("https://srautomotives.com"),
  title: {
    default: "SR Automotives | Car Accessories & Automotive Services",
    template: "%s | SR Automotives",
  },
  description:
    "Shop quality car accessories, automotive parts and vehicle services from SR Automotives.",
  keywords: [
    "SR Automotives",
    "car accessories",
    "car parts",
    "automotive accessories",
    "vehicle accessories",
    "car services",
  ],
  robots: {
    index: true,
    follow: true,
  },
};
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}