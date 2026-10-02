import type { AtlasData, AtlasNode } from './model';
import { createGraph } from './model';
export function relationshipGraph(data: AtlasData, filters: { domain: string; category: string; query: string; focusId?: string }) {
  const projects = data.projects.filter(p => filters.domain === 'all' || data.relationships.some(r => r.type === 'belongs-to' && r.projectId === p.id && r.domainId === filters.domain));
  const ids = new Set(projects.map(p => p.id));
  const uses = data.relationships.filter(r => r.type === 'uses' && ids.has(r.projectId) && data.technologies.some(t => t.id === r.technologyId && (filters.category === 'all' || t.category === filters.category)));
  const graph = createGraph({ ...data, projects: projects.filter(p => uses.some(r => r.projectId === p.id)), technologies: data.technologies.filter(t => uses.some(r => r.type === 'uses' && r.technologyId === t.id)), relationships: uses });
  const query = filters.query.trim().toLowerCase();
  const matches = new Set(graph.nodes.filter(n => `${n.name} ${n.description}`.toLowerCase().includes(query)).map(n => n.id));
  let edges = graph.edges.filter(e => !query || matches.has(e.source) || matches.has(e.target));
  if (filters.focusId) edges = edges.filter(e => e.source === filters.focusId || e.target === filters.focusId);
  const endpoints = new Set(edges.flatMap(e => [e.source, e.target]));
  const nodes = graph.nodes.filter(n => endpoints.has(n.id) || (!filters.focusId && matches.has(n.id) && (!query || matches.has(n.id))));
  return { nodes, edges: edges.map(edge => {
    const use = uses.find(r => r.id === edge.id)!;
    const capabilityCount = use.type === 'uses' ? use.capabilityIds.length : 0;
    const sharedProjectCount = data.relationships.filter(r => r.type === 'uses' && r.technologyId === edge.target).length;
    return { ...edge, capabilityCount, sharedProjectCount, strength: capabilityCount + sharedProjectCount };
  }), matches };
}
export function clusterLayout(data: AtlasData, nodes: AtlasNode[]) {
  const primaryDomain = (projectId: string) => data.relationships.find(r => r.type === 'belongs-to' && r.projectId === projectId);
  function cluster(node: AtlasNode) {
    if (node.kind === 'project') { const domain = primaryDomain(node.id); return domain?.type === 'belongs-to' ? domain.domainId : data.domains[0]?.id; }
    const votes = data.domains.map(domain => ({ id: domain.id, count: nodes.filter(n => n.kind === 'project' && data.relationships.some(r => r.type === 'uses' && r.projectId === n.id && r.technologyId === node.id) && primaryDomain(n.id)?.type === 'belongs-to' && (primaryDomain(n.id) as { domainId: string }).domainId === domain.id).length }));
    return votes.sort((a,b) => b.count - a.count)[0]?.id;
  }
  const positions = new Map<string, { x: number; y: number }>();
  const clusters: { id: string; name: string; y: number; height: number }[] = [];
  let y = 30;
  for (const domain of data.domains) {
    const group = nodes.filter(n => cluster(n) === domain.id);
    if (!group.length) continue;
    const height = Math.max(group.filter(n => n.kind === 'project').length, group.filter(n => n.kind === 'technology').length) * 64 + 60;
    clusters.push({ id: domain.id, name: domain.name, y, height });
    for (const kind of ['project','technology'] as const) group.filter(n => n.kind === kind).sort((a,b) => a.name.localeCompare(b.name)).forEach((node,i) => positions.set(node.id,{x:kind === 'project' ? 210 : 660,y:y + 64 + i * 64}));
    y += height + 24;
  }
  return { positions, clusters, width: 880, height: Math.max(440,y) };
}
