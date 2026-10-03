'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, ArrowUpRight } from 'lucide-react';
import { searchEntries, recentEntries, type SearchEntry } from '@/lib/explore/search';
const storageKey = 'project-dna-recent-selections';
export function CommandPalette({ index }: { index: SearchEntry[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const options = useRef(new Map<string, HTMLDivElement>());
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [recents, setRecents] = useState<SearchEntry[]>([]);
  const router = useRouter();
  const matches = searchEntries(index, query).slice(0,60);
  const results = query.trim() ? matches : [...recents, ...matches.filter(e=>!recents.some(r=>r.id===e.id))];
  const activeEntry = results[Math.min(active,Math.max(0,results.length-1))];
  useEffect(()=>{
    function open(){if(!dialog.current||dialog.current.open)return;returnFocus.current=document.activeElement instanceof HTMLElement?document.activeElement:null;setQuery('');setActive(0);try{setRecents(recentEntries(index,JSON.parse(localStorage.getItem(storageKey)??'[]')));}catch{setRecents([]);}dialog.current.showModal();input.current?.focus();}
    function shortcut(event:KeyboardEvent){if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'){event.preventDefault();if(dialog.current?.open)dialog.current.close();else open();}}
    window.addEventListener('keydown',shortcut);window.addEventListener('project-dna-search',open);
    return()=>{window.removeEventListener('keydown',shortcut);window.removeEventListener('project-dna-search',open);};
  },[index]);
  useEffect(()=>{if(activeEntry)options.current.get(activeEntry.id)?.scrollIntoView({block:'nearest'});},[activeEntry]);
  function choose(entry:SearchEntry){const recent=recentEntries(index,[entry.id,...recents.map(r=>r.id)]);setRecents(recent);try{localStorage.setItem(storageKey,JSON.stringify(recent.map(r=>r.id)));}catch{}dialog.current?.close();router.push(entry.href);}
  function move(next:number){setActive((next+results.length)%Math.max(1,results.length));}
  return <dialog className="command-dialog" ref={dialog} aria-labelledby="command-title" onCancel={()=>dialog.current?.close()} onClose={()=>returnFocus.current?.isConnected&&returnFocus.current.focus()} onClick={event=>{if(event.target===dialog.current){const rect=dialog.current.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.current.close();}}}><div className="command-heading"><h2 id="command-title">Search Project DNA</h2><button type="button" aria-label="Close search" onClick={()=>dialog.current?.close()}><X size={18}/></button></div><div className="command-input"><Search size={19} aria-hidden="true"/><input ref={input} type="text" role="combobox" aria-label="Search projects, technologies, domains, capabilities and views" aria-autocomplete="list" aria-expanded="true" aria-controls="command-results" aria-activedescendant={activeEntry?`command-${activeEntry.id}`:undefined} placeholder="Find a project, tool, capability…" value={query} onChange={event=>{setQuery(event.target.value);setActive(0);}} onKeyDown={event=>{if(event.key==='ArrowDown'){event.preventDefault();move(active+1);}if(event.key==='ArrowUp'){event.preventDefault();move(active-1);}if(event.key==='Home'){event.preventDefault();setActive(0);}if(event.key==='End'){event.preventDefault();setActive(Math.max(0,results.length-1));}if(event.key==='Enter'&&activeEntry){event.preventDefault();choose(activeEntry);}}}/></div><div className="command-result-meta"><span role="status">{query.trim()?`${results.length}${matches.length===60?'+':''} results`:'Recent selections & destinations'}</span>{!query.trim()&&recents.length>0&&<button type="button" onClick={()=>{setRecents([]);setActive(0);input.current?.focus();try{localStorage.removeItem(storageKey);}catch{}}}>Clear recents</button>}</div><div className="command-results" id="command-results" role="listbox" aria-label="Search results">{results.map((entry,i)=>{const recent=!query.trim()&&i<recents.length;const group=recent?'Recent selections':entry.type;const previous=results[i-1];const previousGroup=i>0?(!query.trim()&&i-1<recents.length?'Recent selections':previous.type):null;return <div key={entry.id} role="presentation">{group!==previousGroup&&<p className="command-group" aria-hidden="true">{group}</p>}<div role="option" id={`command-${entry.id}`} ref={element=>{if(element)options.current.set(entry.id,element);else options.current.delete(entry.id);}} aria-selected={activeEntry?.id===entry.id} className="command-option" onPointerMove={()=>setActive(i)} onMouseDown={event=>event.preventDefault()} onClick={()=>choose(entry)}><span><strong>{entry.name}</strong><small>{entry.detail}</small></span><span className="command-type">{entry.type}<ArrowUpRight size={13} aria-hidden="true"/></span></div></div>;})}{!results.length&&<div className="command-empty"><p>No matches found.</p><span>Try a shorter name, technology, or capability.</span></div>}</div><div className="command-footer"><span>↑ ↓ Navigate · Enter Open</span><span>Esc Close · ⌘K / Ctrl K</span></div></dialog>;
}
