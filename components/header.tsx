'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { Brand } from './brand';
export function Header() {
  const pathname = usePathname();
  const home = pathname === '/' ? '' : '/';
  const [open, setOpen] = useState(false);
  return <header className="header"><div className="shell header-inner"><Brand/><nav aria-label="Main navigation" className={open ? 'navigation is-open' : 'navigation'}><Link href="/explore" aria-current={pathname === "/explore" ? "page" : undefined} onClick={() => setOpen(false)}>Explore</Link><a href={`${home}#projects`} onClick={() => setOpen(false)}>Projects</a><Link href="/technologies" aria-current={pathname === "/technologies" ? "page" : undefined} onClick={() => setOpen(false)}>Technologies</Link><Link href="/domains" aria-current={pathname === "/domains" ? "page" : undefined} onClick={() => setOpen(false)}>Domains</Link><Link href="/skills" aria-current={pathname === "/skills" ? "page" : undefined} onClick={() => setOpen(false)}>Skills</Link><Link href="/timeline" aria-current={pathname === "/timeline" ? "page" : undefined} onClick={() => setOpen(false)}>Timeline</Link><Link href="/compare" aria-current={pathname === "/compare" ? "page" : undefined} onClick={() => setOpen(false)}>Compare</Link><a href={`${home}#about`} onClick={() => setOpen(false)}>The idea <ArrowUpRight size={13}/></a></nav><div className="header-note"><span className="status-dot"/> An atlas of software</div><button className="menu-toggle" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button></div></header>;
}
