import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Afterlife Forum | Famous Dead Philosophers Debating",
  description:
    "Watch 4-5 legendary dead philosophers debate any topic you choose. Socrates, Nietzsche, Frida Kahlo, Cleopatra, and Galileo discuss the questions that matter.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎭</text></svg>",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}