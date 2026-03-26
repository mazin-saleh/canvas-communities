import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Anybody, IBM_Plex_Sans } from "next/font/google";
//import GlobalLogoHeader from "@/components/GlobalLogoHeader";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-ibm",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const anybody = Anybody({
  subsets: ["latin"],
  variable: "--font-anybody",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "Canvas Communities",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${ibmPlexSans.variable} ${anybody.variable}`}>
      <body>
        <AuthProvider>
          {/* <GlobalLogoHeader /> */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
