import type { AtlasData, Project } from './model';
import { projectStack } from './selectors';
export function projectSource(data: AtlasData, project: Project) {
  const repository = new URL(project.repositoryUrl).pathname.replace(/^\//, '').replace(/\/$/, '');
  return { repository, repositoryName: repository.split('/')[1], repositoryUrl: project.repositoryUrl, demoUrl: project.demoUrl, status: project.status, year: project.year, reviewedOn: project.evidence.reviewedOn, notes: project.evidence.notes, sources: project.evidence.sources, technologies: projectStack(data, project.id).map(use => use.technology), visibility: 'Not recorded' };
}
