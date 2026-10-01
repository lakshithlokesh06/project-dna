import type { Metadata } from 'next';
import { Header } from '@/components/header';
import { Network } from '@/components/explore/network';
import { atlas } from '@/lib/explore/dataset';
export const metadata: Metadata = { title: 'Explore — Project DNA', description: 'Trace the relationships between software projects and their technologies.' };
export default function ExplorePage() {
  return <><Header/><main className="shell explore-page"><div className="explore-intro"><div><p className="eyebrow"><span className="status-dot"/> THE CONNECTED ATLAS</p><h1>Follow the <span>connections.</span></h1><p>Explore the technologies behind the projects. Discover what they share.</p></div><span className="explore-edition">EXPLORATION 001<br/>3 PROJECTS / 3 DOMAINS</span></div><Network data={atlas}/><p className="explore-disclaimer">A small, illustrative dataset. Stable positions keep the focus on relationships, not movement.</p></main></>;
}
