import type { AtlasData, AtlasNode, GraphEdge } from '../metadata/model';
export * from '../metadata/model';
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

