"use client";

import { AuthProvider } from "@/context/auth-context";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <AuthProvider>
        {children}
        <Toaster />
        </AuthProvider>
    </ThemeProvider>
  );
}