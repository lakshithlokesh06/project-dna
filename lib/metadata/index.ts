import { projectRecords } from './projects';
import { technologies } from './technologies';
import { domains } from './domains';
import { validateRecords, validateAtlas } from './validation';
import type { AtlasData, Domain, ProjectRecord, Technology } from './model';
export function buildAtlas(records: ProjectRecord[], technologyRegistry: Technology[], domainRegistry: Domain[]): AtlasData {
  validateRecords(records, technologyRegistry, domainRegistry);
  return validateAtlas({
    projects: records,
    technologies: technologyRegistry.filter(t => records.some(p => p.stack.some(u => u.technologyId === t.id))),
    domains: domainRegistry,
    relationships: records.flatMap(project => [
      ...project.domainIds.map(domainId => ({ id: `${project.id}-domain-${domainId}`, type: 'belongs-to' as const, projectId: project.id, domainId })),
      ...project.stack.map(use => ({ ...use, id: `${project.id}-uses-${use.technologyId}`, type: 'uses' as const, projectId: project.id })),
    ]),
  });
}
// The only assembled source read by landing, exploration, and project routes.
export const atlas = buildAtlas(projectRecords, technologies, domains);
