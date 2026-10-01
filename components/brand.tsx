import Link from 'next/link';
export function Brand({ compact = false }: { compact?: boolean }) {
  return <Link href="/" className="brand" aria-label="Project DNA home"><svg width="27" height="32" viewBox="0 0 27 32" fill="none" aria-hidden="true"><path d="M5 2c0 12 17 16 17 28M22 2C22 14 5 18 5 30" stroke="currentColor" strokeWidth="1.6"/><path d="M7 6h13M10 11h7M10 21h7M7 26h13" stroke="currentColor" strokeWidth="1.6"/></svg>{!compact && <span>Project<span className="brand-dna">DNA</span></span>}</Link>;
}
