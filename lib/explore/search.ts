import type { AtlasData } from './model';
export const searchTypes = ['Projects', 'Technologies', 'Domains', 'Capabilities', 'Views'] as const;
export type SearchEntry = { id: string; type: typeof searchTypes[number]; name: string; detail: string; href: string };
export function searchIndex(data: AtlasData): SearchEntry[] {
  return [
    ...data.projects.map(p => ({ id: `project:${p.id}`, type: 'Projects' as const, name: p.name, detail: p.description, href: `/projects/${p.slug}` })),
    ...data.technologies.map(t => ({ id: `technology:${t.id}`, type: 'Technologies' as const, name: t.name, detail: `${t.category} · ${t.description}`, href: `/technologies?technology=${encodeURIComponent(t.id)}` })),
    ...data.domains.map(d => ({ id: `domain:${d.id}`, type: 'Domains' as const, name: d.name, detail: d.description, href: `/domains?domain=${encodeURIComponent(d.id)}` })),
    ...data.projects.flatMap(p => p.capabilities.map(c => ({ id: `capability:${p.id}:${c.id}`, type: 'Capabilities' as const, name: c.name, detail: `${p.name} · ${c.description}`, href: `/projects/${p.slug}#capability-${c.id}` }))),
    ...[{ name: 'Home', href: '/', detail: 'Project DNA overview' }, { name: 'Explore', href: '/explore', detail: 'Technical relationship graph' }, { name: 'Technologies', href: '/technologies', detail: 'Technology knowledge explorer' }, { name: 'Domains', href: '/domains', detail: 'Areas of work' }, { name: 'Skills', href: '/skills', detail: 'Implementation evidence' }, { name: 'Timeline', href: '/timeline', detail: 'Documented project progression' }, { name: 'Compare', href: '/compare', detail: 'Side-by-side project comparison' }].map(v => ({ ...v, id: `view:${v.href}`, type: 'Views' as const })),
  ];
}
function normalize(text: string) { return text.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, ''); }
function fuzzyScore(text: string, query: string) {
  const value = normalize(text);
  const direct = value.indexOf(query);
  if (direct >= 0) return 100 - Math.min(direct, 40);
  let position = -1, gaps = 0;
  for (const char of query) { const next = value.indexOf(char, position + 1); if(next < 0) return 0; gaps += next - position - 1; position = next; }
  return Math.max(1, 45 - gaps);
}
export function searchEntries(index: SearchEntry[], query: string) {
  const tokens = normalize(query.trim()).split(/\s+/).filter(Boolean);
  if (!tokens.length) return index.filter(e => e.type === 'Views');
  return index.map(entry => ({ entry, score: tokens.reduce((score, token) => { const match = Math.max(fuzzyScore(entry.name, token) * 2, fuzzyScore(entry.detail, token)); return match && score >= 0 ? score + match : -1; }, 0) })).filter(item => item.score > 0).sort((a,b) => searchTypes.indexOf(a.entry.type) - searchTypes.indexOf(b.entry.type) || b.score-a.score || a.entry.name.localeCompare(b.entry.name)).map(item => item.entry);
}
export function recentEntries(index: SearchEntry[], ids: unknown) {
  if (!Array.isArray(ids)) return [];
  return [...new Set(ids.filter((id): id is string => typeof id === 'string'))].flatMap(id => { const entry=index.find(e=>e.id===id);return entry?[entry]:[]; }).slice(0,6);
}
