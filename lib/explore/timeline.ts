import type { AtlasData } from './model';
import { projectDomains, projectStack } from './selectors';

export function deriveTimeline(data: AtlasData) {
  const seenTechnologies = new Set<string>();
  const seenDomains = new Set<string>();
  return [...new Set(data.projects.map(project => project.year))].sort((a, b) => a - b).map(year => {
    // Year is the metadata's chronological precision; titles provide a stable
    // display order within a year, not an inferred development sequence.
    const projects = data.projects.filter(project => project.year === year).sort((a, b) => a.name.localeCompare(b.name)).map(project => ({ project, stack: projectStack(data, project.id), domains: projectDomains(data, project.id) }));
    const technologies = data.technologies.filter(technology => projects.some(item => item.stack.some(use => use.technologyId === technology.id)));
    const domains = data.domains.filter(domain => projects.some(item => item.domains.some(itemDomain => itemDomain.id === domain.id)));
    const introducedTechnologies = technologies.filter(item => !seenTechnologies.has(item.id));
    const introducedDomains = domains.filter(item => !seenDomains.has(item.id));
    technologies.forEach(item => seenTechnologies.add(item.id));
    domains.forEach(item => seenDomains.add(item.id));
    const milestone = `${projects.length} ${projects.length === 1 ? 'project' : 'projects'} across ${domains.length} ${domains.length === 1 ? 'domain' : 'domains'}. ${introducedTechnologies.length} technologies first recorded in this year; ${technologies.length - introducedTechnologies.length} carried forward from earlier years.`;
    return { year, projects, technologies, domains, introducedTechnologies, introducedDomains, milestone };
  });
}
export function filterTimeline(stages: ReturnType<typeof deriveTimeline>, domain: string, technology: string) {
  return stages.map(stage => ({ ...stage, projects: stage.projects.filter(item => (domain === 'all' || item.domains.some(d => d.id === domain)) && (technology === 'all' || item.stack.some(use => use.technologyId === technology))) })).filter(stage => stage.projects.length > 0);
}
