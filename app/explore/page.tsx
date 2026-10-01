import type { Metadata } from 'next';
import { Header } from '@/components/header';
import { Network } from '@/components/explore/network';
import { atlas } from '@/lib/metadata';
export const metadata: Metadata = { title: 'Explore — Project DNA', description: 'Trace the relationships between software projects and their technologies.' };
export default async function ExplorePage({ searchParams }: { searchParams: Promise<{ technology?: string | string[] }> }) {
  const query = await searchParams;
  const technology = typeof query.technology === 'string' ? query.technology : undefined;
  return <><Header/><main className="shell explore-page"><div className="explore-intro"><div><p className="eyebrow"><span className="status-dot"/> THE CONNECTED ATLAS</p><h1>Follow the <span>connections.</span></h1><p>Explore the technologies behind the projects. Discover what they share.</p></div><span className="explore-edition">EXPLORATION 001<br/>{atlas.projects.length} PROJECTS / {atlas.domains.length} DOMAINS</span></div><Network key={technology ?? "atlas"} data={atlas} initialTechnology={technology}/><p className="explore-disclaimer">Repository-backed metadata. Select a project scope to trace its stack, or follow a technology to see connected projects.</p></main></>;
}
