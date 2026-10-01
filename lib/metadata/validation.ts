import { stackSections, type AtlasData, type Domain, type ProjectRecord, type Technology } from './model';
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
function fail(message: string): never { throw new Error(`Project DNA metadata: ${message}`); }
function text(value: unknown, field: string): asserts value is string {
  if (typeof value !== 'string' || !value.trim()) fail(`${field} must be a nonempty string`);
}
function list(value: unknown, field: string): asserts value is unknown[] {
  if (!Array.isArray(value)) fail(`${field} must be an array`);
}
function unique(values: unknown[], field: string) {
  if (new Set(values).size !== values.length) fail(`duplicate ${field}`);
}
function identifier(value: unknown, field: string) {
  text(value, field);
  if (!slugPattern.test(value)) fail(`invalid ${field}: ${value}`);
}
function url(value: unknown, field: string, github = false) {
  text(value, field);
  let parsed: URL;
  try { parsed = new URL(value); } catch { return fail(`invalid ${field}`); }
  if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) fail(`invalid ${field}`);
  if (github && (parsed.protocol !== 'https:' || parsed.hostname !== 'github.com' || !/^\/[^/]+\/[^/]+\/?$/.test(parsed.pathname) || parsed.search || parsed.hash)) fail(`${field} must identify a GitHub repository`);
}
export function validateRecords(records: ProjectRecord[], technologies: Technology[], domains: Domain[]) {
  list(records, 'projects'); list(technologies, 'technologies'); list(domains, 'domains');
  unique(records.map(p => p.id), 'project ID'); unique(records.map(p => p.slug), 'project slug');
  unique(records.map(p => p.repositoryUrl.toLowerCase()), 'repository URL');
  unique(technologies.map(t => t.id), 'technology ID'); unique(domains.map(d => d.id), 'domain ID');
  unique([...records.map(p => p.id), ...technologies.map(t => t.id)], 'graph node ID');
  const categories = ['Framework','Language','Database','Graphics','Platform','Testing','Automation','Library','Service'];
  for (const technology of technologies) {
    identifier(technology.id, 'technology ID'); text(technology.name, `${technology.id}.name`); text(technology.description, `${technology.id}.description`);
    if (!categories.includes(technology.category)) fail(`invalid category for ${technology.id}`);
  }
  for (const domain of domains) { identifier(domain.id, 'domain ID'); text(domain.name, `${domain.id}.name`); text(domain.description, `${domain.id}.description`); }
  const technologyIds = new Set(technologies.map(t => t.id));
  const domainIds = new Set(domains.map(d => d.id));
  for (const project of records) {
    const field = project.id;
    identifier(project.id, 'project ID'); identifier(project.slug, 'project slug');
    for (const key of ['name', 'description', 'summary', 'architecture'] as const) text(project[key], `${field}.${key}`);
    url(project.repositoryUrl, `${field}.repositoryUrl`, true);
    if (project.demoUrl !== undefined) url(project.demoUrl, `${field}.demoUrl`);
    if (!Number.isInteger(project.year) || project.year < 1970 || project.year > new Date().getUTCFullYear()) fail(`invalid year in ${field}`);
    if (!['available','in-development','archived','prototype'].includes(project.status)) fail(`invalid status in ${field}`);
    list(project.domainIds, `${field}.domainIds`); unique(project.domainIds, `${field} domain reference`);
    if (!project.domainIds.length || project.domainIds.some(id => !domainIds.has(id))) fail(`unknown or missing domain in ${field}`);
    list(project.capabilities, `${field}.capabilities`); unique(project.capabilities.map(c => c.id), `${field} capability ID`);
    if (!project.capabilities.length) fail(`missing capabilities in ${field}`);
    for (const c of project.capabilities) { identifier(c.id, `${field} capability ID`); text(c.name, `${field}.${c.id}.name`); text(c.description, `${field}.${c.id}.description`); }
    const capabilities = new Set(project.capabilities.map(c => c.id));
    list(project.stack, `${field}.stack`); unique(project.stack.map(u => u.technologyId), `${field} technology use`);
    if (!project.stack.length) fail(`missing stack in ${field}`);
    const stackIds = new Set(project.stack.map(u => u.technologyId));
    for (const use of project.stack) {
      if (!technologyIds.has(use.technologyId)) fail(`unknown technology ${use.technologyId} in ${field}`);
      if (!stackSections.includes(use.section)) fail(`invalid stack section in ${field}`);
      text(use.role, `${field}.${use.technologyId}.role`); text(use.usage, `${field}.${use.technologyId}.usage`);
      list(use.capabilityIds, `${field}.${use.technologyId}.capabilityIds`); unique(use.capabilityIds, `${field} capability reference`);
      if (!use.capabilityIds.length || use.capabilityIds.some(id => !capabilities.has(id))) fail(`unknown or missing capability reference in ${field}`);
    }
    for (const c of project.capabilities) if (!project.stack.some(u => u.capabilityIds.includes(c.id))) fail(`unconnected capability ${c.id} in ${field}`);
    list(project.architectureConnections, `${field}.architectureConnections`);
    unique(project.architectureConnections.map(c => `${c.sourceTechnologyId}:${c.targetTechnologyId}`), `${field} architecture connection`);
    for (const c of project.architectureConnections) {
      if (c.sourceTechnologyId === c.targetTechnologyId || !stackIds.has(c.sourceTechnologyId) || !stackIds.has(c.targetTechnologyId)) fail(`invalid architecture relationship in ${field}`);
      text(c.description, `${field}.architectureConnection.description`);
    }
    if (!project.evidence) fail(`missing evidence in ${field}`);
    text(project.evidence.reviewedOn, `${field}.evidence.reviewedOn`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(project.evidence.reviewedOn) || Number.isNaN(Date.parse(project.evidence.reviewedOn))) fail(`invalid review date in ${field}`);
    list(project.evidence.sources, `${field}.evidence.sources`);
    if (!project.evidence.sources.length) fail(`missing evidence source in ${field}`);
    project.evidence.sources.forEach(source => url(source, `${field}.evidence.source`));
    text(project.evidence.notes, `${field}.evidence.notes`);
  }
}
export function validateAtlas(data: AtlasData): AtlasData {
  unique(data.relationships.map(r => r.id), 'relationship ID');
  const endpoints = new Set<string>();
  for (const relationship of data.relationships) {
    identifier(relationship.id, 'relationship ID');
    const project = data.projects.find(p => p.id === relationship.projectId);
    if (!project) fail(`unknown project in ${relationship.id}`);
    if (relationship.type === 'uses') {
      if (!data.technologies.some(t => t.id === relationship.technologyId)) fail(`unknown technology in ${relationship.id}`);
      if (relationship.capabilityIds.some(id => !project.capabilities.some(c => c.id === id))) fail(`unknown capability in ${relationship.id}`);
      if (!stackSections.includes(relationship.section)) fail(`invalid section in ${relationship.id}`);
      text(relationship.role, `${relationship.id}.role`); text(relationship.usage, `${relationship.id}.usage`);
    } else if (relationship.type === 'belongs-to') {
      if (!data.domains.some(d => d.id === relationship.domainId)) fail(`unknown domain in ${relationship.id}`);
    } else fail('unknown relationship type');
    const key = `${relationship.projectId}:${relationship.type}:${relationship.type === 'uses' ? relationship.technologyId : relationship.domainId}`;
    if (endpoints.has(key)) fail(`duplicate relationship endpoints in ${relationship.id}`);
    endpoints.add(key);
  }
  return data;
}
