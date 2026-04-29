import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Quind Backstage",
  description: "Portal interno de documentación técnica y OKRs",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
