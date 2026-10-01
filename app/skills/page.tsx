import type { Metadata } from 'next';
import { Header } from '@/components/header';
import { SkillsExplorer } from '@/components/skills/explorer';
import { atlas } from '@/lib/metadata';
export const metadata: Metadata = { title: 'Skills — Project DNA', description: 'Explore implementation evidence for technologies across software projects and domains.' };
export default function SkillsPage() {
  return <><Header/><main className="shell technology-explorer-page"><div className="explore-intro"><div><p className="eyebrow"><span className="status-dot"/> SKILLS, WITH EVIDENCE</p><h1>Follow the work.<br/><span>Find the skill.</span></h1><p>Concrete implementations across {atlas.projects.length} projects. Every connection leads back to the code behind it.</p></div><span className="explore-edition">EVIDENCE INDEX<br/>{atlas.technologies.length} TECHNOLOGIES / {atlas.domains.length} DOMAINS</span></div><SkillsExplorer data={atlas}/></main></>;
}
