import type { AtlasData } from './model';

export function technologyProfile(data: AtlasData, technologyId: string) {
  const technology = data.technologies.find(item => item.id === technologyId);
  if (!technology) return undefined;
  const projects = data.relationships.flatMap(relation => {
    if (relation.type !== 'uses' || relation.technologyId !== technologyId) return [];
    const project = data.projects.find(item => item.id === relation.projectId);
    return project ? [{ project, use: relation, capabilities: project.capabilities.filter(item => relation.capabilityIds.includes(item.id)) }] : [];
  });
  const patterns = [...new Set(projects.map(item => item.use.section))].map(section => ({
    section,
    count: projects.filter(item => item.use.section === section).length,
    roles: [...new Set(projects.filter(item => item.use.section === section).map(item => item.use.role))],
  }));
  return { technology, projects, patterns, capabilityCount: projects.reduce((count, item) => count + item.capabilities.length, 0) };
}
