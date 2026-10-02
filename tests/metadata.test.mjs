import test from 'node:test';
import assert from 'node:assert/strict';
import compiledAtlas from '../.metadata-test/metadata/index.js';
import compiledRecords from '../.metadata-test/metadata/projects.js';
import compiledTechnologies from '../.metadata-test/metadata/technologies.js';
import compiledDomains from '../.metadata-test/metadata/domains.js';
import compiledValidation from '../.metadata-test/metadata/validation.js';
import compiledFilter from '../.metadata-test/explore/filter.js';
const { atlas, buildAtlas } = compiledAtlas;
const { projectRecords } = compiledRecords;
const { technologies } = compiledTechnologies;
const { domains } = compiledDomains;
const { validateAtlas } = compiledValidation;
const { scopeAtlas } = compiledFilter;
function invalidRecord(mutate, expected) {
  const records = structuredClone(projectRecords);
  mutate(records);
  assert.throws(() => buildAtlas(records, technologies, domains), expected);
}
test('the repository collection produces complete project-to-technology relationships', () => {
  assert.equal(atlas.projects.length, 23);
  assert.ok(['data-science', 'nlp-ai', 'data-analytics', 'full-stack', 'games-cv', 'portfolio-web'].every(id => atlas.domains.some(d => d.id === id)));
  assert.equal(atlas.relationships.filter(r => r.type === 'uses').length, projectRecords.reduce((total,p) => total + p.stack.length, 0));
  assert.ok(atlas.projects.every(p => p.repositoryUrl.startsWith('https://github.com/')));
});
test('invalid and duplicate route slugs are rejected', () => {
  invalidRecord(records => { records[0].slug = '../escape'; }, /invalid project slug/);
  invalidRecord(records => { records[1].slug = records[0].slug; }, /duplicate project slug/);
});
test('missing technologies and duplicate technology uses fail before rendering', () => {
  invalidRecord(records => { records[0].stack[0].technologyId = 'missing'; }, /unknown technology/);
  invalidRecord(records => { records[0].stack.push(records[0].stack[0]); }, /duplicate .*technology use/);
});
test('invalid categories, capability references, and architecture links are rejected', () => {
  invalidRecord(records => { records[0].domainIds = ['missing']; }, /unknown or missing domain/);
  invalidRecord(records => { records[0].stack[0].capabilityIds = ['missing']; }, /unknown or missing capability/);
  invalidRecord(records => { records[0].architectureConnections[0].targetTechnologyId = 'missing'; }, /invalid architecture relationship/);
  invalidRecord(records => { records[0].architectureConnections[0].targetTechnologyId = records[0].architectureConnections[0].sourceTechnologyId; }, /invalid architecture relationship/);
});
test('unsafe URLs, incomplete roles, statuses, and years are rejected', () => {
  invalidRecord(records => { records[0].repositoryUrl = 'javascript:alert(1)'; }, /invalid .*repositoryUrl/);
  invalidRecord(records => { records[0].demoUrl = 'https://user:secret@example.com'; }, /invalid .*demoUrl/);
  invalidRecord(records => { records[0].stack[0].usage = ''; }, /nonempty string/);
  invalidRecord(records => { records[0].status = 'production'; }, /invalid status/);
  invalidRecord(records => { records[0].year = 1900.5; }, /invalid year/);
});
test('invalid and duplicate explicit relationships are rejected', () => {
  const broken = structuredClone(atlas);
  broken.relationships[0].projectId = 'missing';
  assert.throws(() => validateAtlas(broken), /unknown project/);
  const duplicate = structuredClone(atlas);
  duplicate.relationships.push({ ...duplicate.relationships[0], id: 'new-id' });
  assert.throws(() => validateAtlas(duplicate), /duplicate relationship endpoints/);
  const wrongType = structuredClone(atlas);
  wrongType.relationships[0].type = 'unrecognized';
  assert.throws(() => validateAtlas(wrongType), /unknown relationship type/);
});
test('project and category scopes retain only valid endpoints', () => {
  for (const scope of [`project:${atlas.projects[0].id}`, 'domain:games-cv']) {
    const scoped = scopeAtlas(atlas, scope);
    assert.ok(scoped.projects.length > 0);
    assert.ok(scoped.relationships.every(r => scoped.projects.some(p => p.id === r.projectId)));
    assert.ok(scoped.relationships.filter(r => r.type === 'uses').every(r => scoped.technologies.some(t => t.id === r.technologyId)));
    validateAtlas(scoped);
  }
});
test('technology deep-link scope includes every connected project', () => {
  const scoped = scopeAtlas(atlas, 'connected', 'python');
  const expected = atlas.relationships.filter(r => r.type === 'uses' && r.technologyId === 'python').map(r => r.projectId).sort();
  assert.deepEqual(scoped.projects.map(p => p.id).sort(), expected);
});

test('approved additions appear in project, domain, and technology scopes', () => {
  const additions = ['house-price-prediction-web-app', 'ai-resume-analyzer', 'student-performance-visualization', 'pcl-6'];
  for (const id of additions) {
    const record = projectRecords.find(p => p.id === id);
    assert.ok(record);
    assert.equal(atlas.projects.filter(p => p.slug === record.slug).length, 1);
    validateAtlas(scopeAtlas(atlas, `project:${id}`));
    for (const domain of record.domainIds) assert.ok(scopeAtlas(atlas, `domain:${domain}`).projects.some(p => p.id === id));
    for (const use of record.stack) assert.ok(scopeAtlas(atlas, 'connected', use.technologyId).projects.some(p => p.id === id));
  }
  assert.equal(projectRecords.find(p => p.id === 'pcl-6').status, 'prototype');
  assert.ok(!atlas.projects.some(p => p.slug === 'project-dna'));
});

import compiledTechnology from '../.metadata-test/explore/technology.js';
test('technology profiles preserve exact uses and project-local capabilities', () => {
  for (const technology of atlas.technologies) {
    const profile = compiledTechnology.technologyProfile(atlas, technology.id);
    const uses = atlas.relationships.filter(r => r.type === 'uses' && r.technologyId === technology.id);
    assert.equal(profile.projects.length, uses.length);
    assert.equal(profile.patterns.reduce((total, item) => total + item.count, 0), uses.length);
    for (const item of profile.projects) {
      assert.equal(item.use.usage, uses.find(use => use.projectId === item.project.id).usage);
      assert.deepEqual(item.capabilities.map(c => c.id).sort(), [...item.use.capabilityIds].sort());
    }
  }
  assert.equal(compiledTechnology.technologyProfile(atlas, 'unknown'), undefined);
});

import compiledSkills from '../.metadata-test/explore/skills.js';
test('skill evidence counts, domains, capabilities and co-occurrences derive from metadata', () => {
  const skills = compiledSkills.deriveSkills(atlas);
  assert.equal(skills.length, atlas.technologies.length);
  for (const skill of skills) {
    const uses = atlas.relationships.filter(r => r.type === 'uses' && r.technologyId === skill.technology.id);
    assert.equal(skill.projects.length, uses.length);
    assert.equal(skill.evidence.reduce((sum, group) => sum + group.projects.length, 0), uses.length);
    const projectIds = new Set(uses.map(use => use.projectId));
    const domainIds = [...new Set(atlas.relationships.filter(r => r.type === 'belongs-to' && projectIds.has(r.projectId)).map(r => r.domainId))].sort();
    assert.deepEqual(skill.domains.map(domain => domain.id).sort(), domainIds);
    for (const related of skill.related) {
      assert.notEqual(related.technology.id, skill.technology.id);
      assert.equal(related.projectCount, atlas.relationships.filter(r => r.type === 'uses' && r.technologyId === related.technology.id && projectIds.has(r.projectId)).length);
    }
    for (const group of skill.evidence) assert.ok(group.projects.every(item => item.use.section === group.section));
  }
  const filtered = compiledSkills.filterSkills(skills, { category: 'Language', domain: 'data-science', minimum: 2, query: 'python' });
  assert.deepEqual(filtered.map(item => item.technology.id), ['python']);
  assert.equal(compiledSkills.filterSkills(skills, { category: 'all', domain: 'all', minimum: 100, query: '' }).length, 0);
});

import compiledTimeline from '../.metadata-test/explore/timeline.js';
test('timeline stages preserve chronological adoption without inventing within-year dates', () => {
  const data = structuredClone(atlas);
  data.projects[0].year = 2024;
  data.projects[1].year = 2025;
  const stages = compiledTimeline.deriveTimeline(data);
  assert.deepEqual(stages.map(stage => stage.year), [2024, 2025, 2026]);
  assert.equal(stages.reduce((sum, stage) => sum + stage.projects.length, 0), data.projects.length);
  const seen = new Set();
  for (const stage of stages) {
    for (const technology of stage.introducedTechnologies) {
      assert.ok(!seen.has(technology.id));
      const firstYear = Math.min(...data.relationships.filter(r => r.type === 'uses' && r.technologyId === technology.id).map(r => data.projects.find(p => p.id === r.projectId).year));
      assert.equal(stage.year, firstYear);
    }
    stage.technologies.forEach(t => seen.add(t.id));
    assert.ok(stage.projects.every(item => item.project.year === stage.year));
  }
  assert.equal(seen.size, data.technologies.length);
  const filtered = compiledTimeline.filterTimeline(stages, 'data-science', 'python');
  assert.ok(filtered.length > 0);
  assert.ok(filtered.every(stage => stage.projects.every(item => item.domains.some(d => d.id === 'data-science') && item.stack.some(use => use.technologyId === 'python'))));
  for (const stage of filtered) assert.deepEqual(stage.introducedTechnologies, stages.find(item => item.year === stage.year).introducedTechnologies);
  assert.equal(compiledTimeline.filterTimeline(stages, 'missing', 'all').length, 0);
  assert.equal(compiledTimeline.deriveTimeline(atlas).length, 1);
});

import compiledDomainProfiles from '../.metadata-test/explore/domains.js';
test('domain profiles preserve project counts, technology use and cross-domain evidence', () => {
  const profiles = compiledDomainProfiles.domainProfiles(atlas);
  assert.equal(profiles.length, 6);
  const represented = new Set();
  for (const profile of profiles) {
    const expected = atlas.relationships.filter(r => r.type === 'belongs-to' && r.domainId === profile.domain.id).map(r => r.projectId).sort();
    assert.deepEqual(profile.projects.map(p => p.id).sort(), expected);
    profile.projects.forEach(p => represented.add(p.id));
    for (const item of profile.technologies) {
      assert.equal(item.projectCount, atlas.relationships.filter(r => r.type === 'uses' && r.technologyId === item.technology.id && expected.includes(r.projectId)).length);
      assert.ok(item.relatedDomains.every(d => d.id !== profile.domain.id && atlas.relationships.some(r => r.type === 'uses' && r.technologyId === item.technology.id && atlas.relationships.some(b => b.type === 'belongs-to' && b.projectId === r.projectId && b.domainId === d.id))));
    }
    assert.equal(profile.capabilities.length, profile.projects.reduce((sum,p) => sum + p.capabilities.length, 0));
    assert.equal(compiledDomainProfiles.searchDomainProjects(profile.projects, 'unlikely-no-match').length, 0);
  }
  assert.equal(represented.size, 23);
  assert.ok(compiledDomainProfiles.searchDomainProjects(atlas.projects, '  house price  ').length > 0);
});

import compiledGraphView from '../.metadata-test/explore/graph-view.js';
test('relationship explorer filters, strengths, focus and cluster positions remain metadata-backed', () => {
  const full = compiledGraphView.relationshipGraph(atlas, { domain: 'all', category: 'all', query: '' });
  assert.equal(full.nodes.length, atlas.projects.length + atlas.technologies.length);
  for (const edge of full.edges) {
    const use = atlas.relationships.find(r => r.id === edge.id);
    assert.equal(edge.capabilityCount, use.capabilityIds.length);
    assert.equal(edge.sharedProjectCount, atlas.relationships.filter(r => r.type === 'uses' && r.technologyId === edge.target).length);
    assert.equal(edge.strength, edge.capabilityCount + edge.sharedProjectCount);
  }
  const focused = compiledGraphView.relationshipGraph(atlas, { domain: 'all', category: 'all', query: '', focusId: 'python' });
  assert.ok(focused.edges.every(edge => edge.target === 'python' || edge.source === 'python'));
  assert.equal(focused.nodes.length, focused.edges.length + 1);
  const filtered = compiledGraphView.relationshipGraph(atlas, { domain: 'data-science', category: 'Language', query: 'python' });
  assert.ok(filtered.edges.length > 0);
  assert.ok(filtered.nodes.filter(n => n.kind === 'technology').every(n => n.id === 'python'));
  assert.ok(filtered.nodes.filter(n => n.kind === 'project').every(n => atlas.relationships.some(r => r.type === 'belongs-to' && r.projectId === n.id && r.domainId === 'data-science')));
  assert.equal(compiledGraphView.relationshipGraph(atlas, { domain: 'all', category: 'all', query: 'no-matching-node-xyz' }).nodes.length, 0);
  const layout = compiledGraphView.clusterLayout(atlas, full.nodes);
  assert.equal(layout.positions.size, full.nodes.length);
  assert.equal(new Set([...layout.positions.values()].map(p => `${p.x}:${p.y}`)).size, full.nodes.length);
  assert.ok([...layout.positions.values()].every(p => p.x >= 0 && p.x <= layout.width && p.y >= 0 && p.y <= layout.height));
});

import compiledCompare from '../.metadata-test/explore/compare.js';
test('comparison sanitizes URL selections and derives overlap and unique technologies', () => {
  const slugs = atlas.projects.slice(0, 3).map(p => p.slug);
  assert.deepEqual(compiledCompare.comparisonSlugs(atlas, `missing,${slugs[0]},${slugs[0]},${slugs[1]},${slugs[2]},${atlas.projects[3].slug}`), slugs);
  const result = compiledCompare.compareProjects(atlas, slugs);
  assert.equal(result.projects.length, 3);
  for (const item of result.technologies) {
    assert.deepEqual(item.projectIds, result.projects.filter(p => p.stack.some(use => use.technologyId === item.technology.id)).map(p => p.project.id));
  }
  assert.ok(result.shared.every(item => item.projectIds.length > 1));
  for (const pattern of result.commonCapabilities) assert.ok(pattern.evidence.every(item => item.capability.name.toLowerCase().trim() === pattern.name.toLowerCase().trim()));
  assert.equal(compiledCompare.compareProjects(atlas, []).projects.length, 0);
});
