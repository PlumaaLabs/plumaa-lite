import "./globals.css";
import "@radix-ui/themes/styles.css";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { title, description } from "~/config/site";
import { cn } from "~/utils";
import { FC } from "react";
import { Theme } from "~/components/providers";
import Navbar from "~/components/navbar";
import { Box } from "@radix-ui/themes";
import { containerProps } from "~/config/ui";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://lite.plumaa.io"),
  title,
  description,
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  // TODO
  // openGraph: {
  //   images: "/banner.png",
  // },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    creator: "@plumaa",
    images: [
      /* "/banner.png" */
    ],
  },
};

type Props = { children: React.ReactNode };

const RootLayout: FC<Props> = ({ children }) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={cn(inter.className, "flex flex-col min-h-screen")}
      >
        <Theme>
          <Navbar />
          <Box asChild p="4" {...containerProps}>
            <main>{children}</main>
          </Box>
        </Theme>
      </body>
    </html>
  );
};

export default RootLayout;
