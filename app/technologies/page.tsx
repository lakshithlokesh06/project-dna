import type { Metadata } from 'next';
import { Header } from '@/components/header';
import { TechnologyExplorer } from '@/components/technologies/explorer';
import { atlas } from '@/lib/metadata';
export const metadata: Metadata = { title: 'Technologies — Project DNA', description: 'Discover how technologies perform different roles across real software projects.' };
export default async function TechnologiesPage({ searchParams }: { searchParams: Promise<{ technology?: string | string[] }> }) {
  const query = await searchParams;
  const selected = typeof query.technology === 'string' ? query.technology : undefined;
  return <><Header/><main className="shell technology-explorer-page"><div className="explore-intro"><div><p className="eyebrow"><span className="status-dot"/> THE TECHNOLOGY INDEX</p><h1>One tool.<br/><span>Many possibilities.</span></h1><p>Follow a technology from its role in the stack to the capabilities it makes possible.</p></div><span className="explore-edition">KNOWLEDGE EXPLORER<br/>{atlas.technologies.length} TECHNOLOGIES / {atlas.projects.length} PROJECTS</span></div><TechnologyExplorer data={atlas} initialTechnology={selected}/></main></>;
}
