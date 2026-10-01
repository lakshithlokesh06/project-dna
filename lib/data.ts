import { atlas } from './explore/dataset';
import { projectDomains, projectStack } from './explore/selectors';
// Editorial placeholder content. Replace with a data source in a future phase.
export const metrics = [
  { value: '024', label: 'Projects', detail: 'Ideas, made real' },
  { value: '038', label: 'Technologies', detail: 'The building blocks' },
  { value: '008', label: 'Domains', detail: 'Different problem spaces' },
  { value: '056', label: 'Capabilities', detail: 'What the code can do' },
];
const identities = [ { color: 'lime', icon: 'orbit' }, { color: 'purple', icon: 'forma' }, { color: 'blue', icon: 'current' } ];
export const projects = atlas.projects.map((project, index) => ({
  ...project,
  domain: projectDomains(atlas, project.id).map(d => d.name).join(', '),
  stack: projectStack(atlas, project.id).filter(item => !['Infrastructure', 'Testing'].includes(item.section)).slice(0, 3).map(item => ({ id: item.technology.id, name: item.technology.name })),
  ...identities[index % identities.length],
}));
export const technologies = atlas.technologies.slice(0, 4).map(technology => ({
  ...technology,
  count: atlas.relationships.filter(r => r.type === 'uses' && r.technologyId === technology.id).length,
}));
