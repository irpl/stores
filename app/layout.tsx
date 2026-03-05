import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Geist } from "next/font/google"
import { CartButton } from "@/components/cart-button"
import { CartProvider } from "@/components/cart-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

const geist = Geist({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Electronic Components",
  description: "Shop for electronic circuit components",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={geist.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <CartProvider>
            <div className="flex min-h-screen flex-col">
              <div className="fixed top-4 right-4 z-50">
                <CartButton />
              </div>
              <main className="flex-1">{children}</main>
              <footer className="border-t">
                <div className="container mx-auto flex h-12 items-center px-4">
                  <p className="text-xs text-muted-foreground">
                    &copy; {new Date().getFullYear()}
                  </p>
                </div>
              </footer>
            </div>
            <Toaster />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
