import Link from 'next/link';
import { Header } from '@/components/header';
export default function ProjectNotFound() {
  return <><Header/><main className="shell project-page"><p className="eyebrow">PROJECT NOT FOUND</p><h1 className="missing-project-title">An uncharted connection.</h1><p className="project-overview">This project is not part of the atlas yet.</p><Link className="button button-primary" href="/explore">Return to Explore</Link></main></>;
}
