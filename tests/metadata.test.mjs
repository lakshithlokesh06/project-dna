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
  assert.ok(atlas.projects.length >= 19);
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
