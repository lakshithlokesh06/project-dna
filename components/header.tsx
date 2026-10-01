'use client';
import { useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { Brand } from './brand';
export function Header() {
  const [open, setOpen] = useState(false);
  return <header className="header"><div className="shell header-inner"><Brand/><nav aria-label="Main navigation" className={open ? 'navigation is-open' : 'navigation'}><a href="#projects" onClick={() => setOpen(false)}>Projects</a><a href="#technologies" onClick={() => setOpen(false)}>Technologies</a><a href="#about" onClick={() => setOpen(false)}>The idea <ArrowUpRight size={13}/></a></nav><div className="header-note"><span className="status-dot"/> An atlas of software</div><button className="menu-toggle" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X/> : <Menu/>}</button></div></header>;
}
