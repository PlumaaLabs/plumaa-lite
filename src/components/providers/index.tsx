"use client";
import { Theme as Themes } from "@radix-ui/themes";
import { FC, ReactNode } from "react";
import { ThemeProvider } from "next-themes";

interface Props {
  children: ReactNode;
}

const Theme: FC<Props> = ({ children }) => {
  return (
    <ThemeProvider attribute="class">
      <Themes accentColor="blue">{children}</Themes>
    </ThemeProvider>
  );
};

export { Theme };
