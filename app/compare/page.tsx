import type { Metadata } from 'next';
import { Header } from '@/components/header';
import { Comparison } from '@/components/compare/comparison';
import { atlas } from '@/lib/metadata';
export const metadata: Metadata = { title: 'Compare — Project DNA', description: 'Compare project architectures, technology roles, and implemented capabilities using repository metadata.' };
export default async function ComparePage({ searchParams }: { searchParams: Promise<{ projects?: string | string[] }> }) {
  const params = await searchParams;
  return <><Header/><main className="shell technology-explorer-page compare-page"><div className="explore-intro"><div><p className="eyebrow"><span className="status-dot"/> PROJECTS, IN CONTEXT</p><h1>Different builds.<br/><span>Shared foundations.</span></h1><p>Compare two or three projects through their documented architecture, technologies, and capabilities.</p></div></div><Comparison key={typeof params.projects === 'string' ? params.projects : ''} data={atlas} initialProjects={typeof params.projects === 'string' ? params.projects : undefined}/></main></>;
}
