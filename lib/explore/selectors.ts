import type { AtlasData } from './model';
export function projectHref(data: AtlasData, id: string) {
  const project = data.projects.find(p => p.id === id);
  return project ? `/projects/${encodeURIComponent(project.slug)}` : '/explore';
}
export function technologyHref(id: string) { return `/explore?technology=${encodeURIComponent(id)}`; }
export function projectStack(data: AtlasData, projectId: string) {
  return data.relationships.flatMap(relation => {
    if (relation.type !== 'uses' || relation.projectId !== projectId) return [];
    const technology = data.technologies.find(t => t.id === relation.technologyId);
    return technology ? [{ ...relation, technology }] : [];
  });
}
export function projectDomains(data: AtlasData, projectId: string) {
  return data.relationships.flatMap(r => r.type === 'belongs-to' && r.projectId === projectId ? data.domains.filter(d => d.id === r.domainId) : []);
}
