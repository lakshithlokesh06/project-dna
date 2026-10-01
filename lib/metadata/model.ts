export const stackSections = ['Frontend', 'Backend', 'Data / AI', 'Infrastructure', 'Testing', 'Tooling'] as const;
export type StackSection = typeof stackSections[number];
export interface Capability { id: string; name: string; description: string; }
export interface ArchitectureConnection { sourceTechnologyId: string; targetTechnologyId: string; description: string; }
export interface Project {
  id: string; slug: string; name: string; description: string; summary: string;
  architecture: string; architectureConnections: ArchitectureConnection[];
  capabilities: Capability[];
  repositoryUrl: string; demoUrl?: string; status: 'available' | 'in-development' | 'archived'; year: number;
  evidence: { reviewedOn: string; sources: string[]; notes: string };
}
export interface Technology { id: string; name: string; category: 'Framework' | 'Language' | 'Database' | 'Graphics' | 'Platform' | 'Testing' | 'Automation' | 'Library' | 'Service'; description: string; }
export interface Domain { id: string; name: string; description: string; }
export type Relationship =
  | { id: string; type: 'uses'; projectId: string; technologyId: string; role: string; section: StackSection; usage: string; capabilityIds: string[] }
  | { id: string; type: 'belongs-to'; projectId: string; domainId: string };
export interface AtlasData { projects: Project[]; technologies: Technology[]; domains: Domain[]; relationships: Relationship[]; }
export type AtlasNode = { id: string; kind: 'project' | 'technology'; name: string; description: string; };
export interface GraphEdge { id: string; source: string; target: string; role: string; }
export interface TechnologyUse {
  technologyId: string; section: StackSection; role: string; usage: string; capabilityIds: string[];
}
export interface ProjectRecord extends Project { domainIds: string[]; stack: TechnologyUse[]; }
export const projectStatusLabels: Record<Project['status'], string> = {
  available: 'Repository available', 'in-development': 'In development', archived: 'Archived',
};
