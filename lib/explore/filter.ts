import type { AtlasData } from '../metadata/model';
/** Scope is presentation state; canonical metadata stays intact. */
export function scopeAtlas(data: AtlasData, scope: string, technologyId?: string): AtlasData {
  let projects = data.projects;
  if (scope.startsWith('project:')) projects = projects.filter(p => p.id === scope.slice(8));
  if (scope.startsWith('domain:')) {
    const ids = new Set(data.relationships.flatMap(r => r.type === 'belongs-to' && r.domainId === scope.slice(7) ? [r.projectId] : []));
    projects = projects.filter(p => ids.has(p.id));
  }
  if (scope === 'connected' && technologyId) {
    const ids = new Set(data.relationships.flatMap(r => r.type === 'uses' && r.technologyId === technologyId ? [r.projectId] : []));
    projects = projects.filter(p => ids.has(p.id));
  }
  const projectIds = new Set(projects.map(p => p.id));
  const relationships = data.relationships.filter(r => projectIds.has(r.projectId));
  const technologyIds = new Set(relationships.flatMap(r => r.type === 'uses' ? [r.technologyId] : []));
  return { projects, relationships, technologies: data.technologies.filter(t => technologyIds.has(t.id)), domains: data.domains };
}
