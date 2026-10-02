import type { AtlasData } from './model';
import { projectStack } from './selectors';
export function domainProfiles(data: AtlasData) {
  return data.domains.map(domain => {
    const projects = data.projects.filter(project => data.relationships.some(r => r.type === 'belongs-to' && r.projectId === project.id && r.domainId === domain.id));
    const technologies = data.technologies.map(technology => {
      const projectCount = projects.filter(project => projectStack(data, project.id).some(use => use.technologyId === technology.id)).length;
      const relatedDomains = data.domains.filter(other => other.id !== domain.id && data.relationships.some(r => r.type === 'uses' && r.technologyId === technology.id && data.relationships.some(d => d.type === 'belongs-to' && d.projectId === r.projectId && d.domainId === other.id)));
      return { technology, projectCount, relatedDomains };
    }).filter(item => item.projectCount > 0).sort((a,b) => b.projectCount - a.projectCount || a.technology.name.localeCompare(b.technology.name));
    const capabilities = projects.flatMap(project => project.capabilities.map(capability => ({ capability, project })));
    return { domain, projects, technologies, capabilities };
  });
}
export function searchDomainProjects(projects: AtlasData['projects'], query: string) {
  const term = query.trim().toLowerCase();
  return projects.filter(project => `${project.name} ${project.description} ${project.capabilities.map(c => `${c.name} ${c.description}`).join(' ')}`.toLowerCase().includes(term));
}
