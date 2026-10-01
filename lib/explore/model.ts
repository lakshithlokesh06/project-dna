export const stackSections = ['Frontend', 'Backend', 'Data / AI', 'Infrastructure', 'Testing', 'Tooling'] as const;
export type StackSection = typeof stackSections[number];
export interface Capability { id: string; name: string; description: string; }
export interface ArchitectureConnection { sourceTechnologyId: string; targetTechnologyId: string; description: string; }
export interface Project {
  id: string; slug: string; name: string; description: string; summary: string;
  architecture: string; architectureConnections: ArchitectureConnection[];
  capabilities: Capability[];
}
export interface Technology { id: string; name: string; category: 'Framework' | 'Language' | 'Database' | 'Graphics' | 'Platform' | 'Testing' | 'Automation'; description: string; }
export interface Domain { id: string; name: string; description: string; }
export type Relationship =
  | { id: string; type: 'uses'; projectId: string; technologyId: string; role: string; section: StackSection; usage: string; capabilityIds: string[] }
  | { id: string; type: 'belongs-to'; projectId: string; domainId: string };
export interface AtlasData { projects: Project[]; technologies: Technology[]; domains: Domain[]; relationships: Relationship[]; }
export type AtlasNode = { id: string; kind: 'project' | 'technology'; name: string; description: string; };
export interface GraphEdge { id: string; source: string; target: string; role: string; }
export function createGraph(data: AtlasData): { nodes: AtlasNode[]; edges: GraphEdge[] } {
  const nodes: AtlasNode[] = [...data.projects.map(p => ({ ...p, kind: 'project' as const })), ...data.technologies.map(t => ({ ...t, kind: 'technology' as const }))];
  const ids = new Set(nodes.map(n => n.id));
  if (ids.size !== nodes.length) throw new Error('Atlas node IDs must be unique.');
  const edges = data.relationships.flatMap(r => {
    if (!data.projects.some(p => p.id === r.projectId)) throw new Error(`Unknown project in ${r.id}`);
    if (r.type === 'belongs-to') {
      if (!data.domains.some(d => d.id === r.domainId)) throw new Error(`Unknown domain in ${r.id}`);
      return [];
    }
    if (!data.technologies.some(t => t.id === r.technologyId)) throw new Error(`Unknown technology in ${r.id}`);
    return [{ id: r.id, source: r.projectId, target: r.technologyId, role: r.role }];
  });
  return { nodes, edges };
}
// Deterministic two-column layout: metadata never contains presentation coordinates.
export function layoutGraph(nodes: AtlasNode[]) {
  const positions = new Map<string, { x: number; y: number }>();
  for (const kind of ['project', 'technology'] as const) {
    const group = nodes.filter(n => n.kind === kind);
    group.forEach((node, i) => positions.set(node.id, { x: kind === 'project' ? 24 : 76, y: ((i + 1) / (group.length + 1)) * 100 }));
  }
  return positions;
}

/** Fail early when metadata references missing technologies or capabilities. */
export function validateAtlas(data: AtlasData): AtlasData {
  createGraph(data);
  if (new Set(data.projects.map(p => p.slug)).size !== data.projects.length) throw new Error('Project slugs must be unique.');
  if (new Set(data.relationships.map(r => r.id)).size !== data.relationships.length) throw new Error('Relationship IDs must be unique.');
  for (const project of data.projects) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.slug)) throw new Error(`Invalid project slug: ${project.slug}`);
    const uses = data.relationships.filter(r => r.type === 'uses' && r.projectId === project.id);
    const technologies = new Set(uses.map(r => r.type === 'uses' ? r.technologyId : ''));
    const capabilities = new Set(project.capabilities.map(c => c.id));
    if (capabilities.size !== project.capabilities.length) throw new Error(`Duplicate capability in ${project.id}`);
    for (const use of uses) {
      if (use.type === 'uses' && use.capabilityIds.some(id => !capabilities.has(id))) throw new Error(`Unknown capability in ${use.id}`);
    }
    for (const connection of project.architectureConnections) {
      if (!technologies.has(connection.sourceTechnologyId) || !technologies.has(connection.targetTechnologyId)) throw new Error(`Architecture references technology outside ${project.id}'s stack`);
    }
  }
  return data;
}
