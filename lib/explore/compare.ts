import type { AtlasData } from './model';
import { projectDomains, projectStack } from './selectors';
export function comparisonSlugs(data: AtlasData, value?: string) {
  return [...new Set((value ?? '').split(','))].filter(slug => data.projects.some(project => project.slug === slug)).slice(0, 3);
}
export function compareProjects(data: AtlasData, slugs: string[]) {
  const projects = comparisonSlugs(data, slugs.join(',')).map(slug => {
    const project = data.projects.find(item => item.slug === slug)!;
    return { project, domains: projectDomains(data, project.id), stack: projectStack(data, project.id) };
  });
  const technologies = data.technologies.map(technology => ({ technology, projectIds: projects.filter(item => item.stack.some(use => use.technologyId === technology.id)).map(item => item.project.id) })).filter(item => item.projectIds.length);
  // Exact normalized capability names are the only asserted common patterns.
  // Similar names alone do not imply equivalent implementations.
  const keys = [...new Set(projects.flatMap(item => item.project.capabilities.map(c => c.name.trim().toLowerCase())))];
  const commonCapabilities = keys.map(key => ({ name: projects.flatMap(item => item.project.capabilities).find(c => c.name.trim().toLowerCase() === key)!.name, evidence: projects.flatMap(item => item.project.capabilities.filter(c => c.name.trim().toLowerCase() === key).map(capability => ({ project: item.project, capability }))) })).filter(item => item.evidence.length > 1);
  return { projects, technologies, shared: technologies.filter(item => item.projectIds.length > 1), commonCapabilities };
}
