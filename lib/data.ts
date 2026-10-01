import { atlas } from './metadata';
import { projectDomains, projectStack } from './explore/selectors';
export const metrics = [
  { value: atlas.projects.length.toString().padStart(3, '0'), label: 'Projects', detail: 'Ideas, made real' },
  { value: atlas.technologies.length.toString().padStart(3, '0'), label: 'Technologies', detail: 'The building blocks' },
  { value: atlas.domains.length.toString().padStart(3, '0'), label: 'Domains', detail: 'Different problem spaces' },
  { value: atlas.projects.reduce((total, p) => total + p.capabilities.length, 0).toString().padStart(3, '0'), label: 'Capabilities', detail: 'What the code can do' },
];
const identities = [ { color: 'lime', icon: 'orbit' }, { color: 'purple', icon: 'forma' }, { color: 'blue', icon: 'current' } ];
export const projects = atlas.projects.slice(0, 3).map((project, index) => ({
  ...project,
  domain: projectDomains(atlas, project.id).map(d => d.name).join(', '),
  stack: projectStack(atlas, project.id).filter(item => !['Infrastructure', 'Testing'].includes(item.section)).slice(0, 3).map(item => ({ id: item.technology.id, name: item.technology.name })),
  ...identities[index % identities.length],
}));
export const technologies = atlas.technologies.slice(0, 4).map(technology => ({
  ...technology,
  count: atlas.relationships.filter(r => r.type === 'uses' && r.technologyId === technology.id).length,
}));
