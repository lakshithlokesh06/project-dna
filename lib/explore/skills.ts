import type { AtlasData } from './model';
import { technologyProfile } from './technology';
import { projectDomains } from './selectors';

export function deriveSkills(data: AtlasData) {
  return data.technologies.map(technology => {
    const profile = technologyProfile(data, technology.id)!;
    const domains = data.domains.filter(domain => profile.projects.some(({ project }) => projectDomains(data, project.id).some(item => item.id === domain.id)));
    // Stack layers provide stable, metadata-backed groups. Exact roles stay attached
    // to each project rather than inferring capabilities from technology names.
    const evidence = profile.patterns.map(pattern => ({
      section: pattern.section,
      projects: profile.projects.filter(item => item.use.section === pattern.section),
    }));
    const related = data.technologies.filter(item => item.id !== technology.id).map(item => ({
      technology: item,
      projectCount: profile.projects.filter(({ project }) => data.relationships.some(relation => relation.type === 'uses' && relation.projectId === project.id && relation.technologyId === item.id)).length,
    })).filter(item => item.projectCount > 0).sort((a, b) => b.projectCount - a.projectCount || a.technology.name.localeCompare(b.technology.name));
    return { ...profile, domains, evidence, related };
  }).sort((a, b) => b.projects.length - a.projects.length || a.technology.name.localeCompare(b.technology.name));
}
export type SkillProfile = ReturnType<typeof deriveSkills>[number];
export function filterSkills(profiles: SkillProfile[], filters: { category: string; domain: string; minimum: number; query: string }) {
  return profiles.filter(profile => (filters.category === 'all' || profile.technology.category === filters.category)
    && (filters.domain === 'all' || profile.domains.some(domain => domain.id === filters.domain))
    && profile.projects.length >= filters.minimum
    && `${profile.technology.name} ${profile.technology.description}`.toLowerCase().includes(filters.query.trim().toLowerCase()));
}
