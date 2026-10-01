import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Project DNA — Explore how projects are built',
  description: 'Discover the technologies, domains, and capabilities that make software projects unique. An atlas of the ideas behind the code.',
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
