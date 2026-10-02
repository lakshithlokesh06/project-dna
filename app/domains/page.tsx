import type { Metadata } from 'next';
import { Header } from '@/components/header';
import { DomainExplorer } from '@/components/domains/explorer';
import { atlas } from '@/lib/metadata';
export const metadata: Metadata = { title: 'Domains — Project DNA', description: 'Explore areas of work, connected projects, and technologies shared across domains.' };
export default function DomainsPage() {
  return <><Header/><main className="shell technology-explorer-page domain-page"><div className="explore-intro"><div><p className="eyebrow"><span className="status-dot"/> AREAS OF WORK</p><h1>Different questions.<br/><span>Connected disciplines.</span></h1><p>Explore {atlas.projects.length} projects across {atlas.domains.length} domains—and the technologies that connect them.</p></div></div><DomainExplorer data={atlas}/></main></>;
}
