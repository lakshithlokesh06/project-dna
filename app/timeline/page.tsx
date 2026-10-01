import type { Metadata } from 'next';
import { Header } from '@/components/header';
import { Timeline } from '@/components/timeline/timeline';
import { atlas } from '@/lib/metadata';
export const metadata: Metadata = { title: 'Timeline — Project DNA', description: 'Follow documented project progression, technology adoption, and domains over time.' };
export default function TimelinePage() {
  return <><Header/><main className="shell technology-explorer-page timeline-page"><div className="explore-intro"><div><p className="eyebrow"><span className="status-dot"/> THE COLLECTION, OVER TIME</p><h1>Ideas take shape.<br/><span>Connections grow.</span></h1><p>A chronology of documented projects, technologies, and the problem spaces they explore.</p></div><span className="explore-edition">COLLECTION HISTORY<br/>{atlas.projects.length} PROJECTS / YEAR RESOLUTION</span></div><Timeline data={atlas}/></main></>;
}
