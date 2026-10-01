# Repository metadata

## Source of truth

Each record lives in `lib/metadata/projects/<slug>.json`. `lib/metadata/projects.ts` imports the records in collection order; that order also drives Previous / Next navigation. Add a new file and import it once. Technology definitions live in `technologies.ts`, category definitions in `domains.ts`, and their TypeScript contracts in `model.ts`.

`buildAtlas` validates these records and derives `uses` and `belongs-to` relationships. Landing metrics, project previews, Explore, generated project routes, stack sections, and capabilities all use the resulting shared `atlas`. Do not hand-maintain a second graph or component dataset.

## Record contract

- `id`, `slug`, `name`, `description`, and `summary`: stable identifiers, a concise description, and a substantive overview.
- `domainIds`: one or more references to the six curated categories.
- `repositoryUrl`, optional `demoUrl`: documented HTTP(S) destinations. Repository URLs must identify a GitHub repository. Demo links are documented destinations, not uptime guarantees.
- `status`: `available` (repository available), `in-development` (explicitly unfinished), or `archived`. Available does not mean production-deployed or under active maintenance.
- `year`: repository creation year from the public GitHub API. AI Research Assistant uses local Git history because its repository is absent from the public inventory. This is not necessarily the year work first began.
- `capabilities`: implemented workflow descriptions with project-scoped IDs.
- `stack`: technology ID, architectural section, short role, exact project-specific usage, and related capability IDs. Record substantive dependencies; a manifest entry alone does not establish an implemented capability.
- `architecture` and `architectureConnections`: narrative plus meaningful directed technology relationships. Both endpoints must occur in the project's stack.
- `evidence`: review date, repository documentation URLs, and scope/limitations of verification.

No ML metrics, deployment assertions, or roadmap capabilities are inferred from dependency names. VADER scoring is lexicon-based, DataRoom's quality detection is deterministic, and the expense app has no ML categorizer. Career Recommendation's source confirms CountVectorizer plus MultinomialNB and Joblib artifacts; its skill-impact text uses rules, not the SHAP package. AutoInsight's source and runtime manifest confirm heuristic recommendations without scikit-learn, despite the README stack listing it.

## Initial collection and evidence

Reviewed on 2026-10-01. Public GitHub inventory verified repository spelling, URLs, creation years, and homepage links. The six older flagship records were reviewed against public READMEs. Newer projects were reviewed against their local checkouts' READMEs and available manifests. Local documentation can describe work newer than the published README; source notes identify this basis. AI Research Assistant has a configured GitHub origin but was not in the public inventory; its repository link may require access.

The initial collection includes 19 substantial repositories spanning AI travel planning, automated EDA, job-market analytics, churn analytics, research, news credibility, movie recommendations, visual intelligence, collaborative dataset review, multiplayer games, webcam interaction, expenses, sentiment, emotion analysis, career recommendations, commerce forecasting, student scores, and two distinct portfolio implementations. Small exercises, profile repositories, forks, and unreviewed projects are not automatically imported. Future additions use the same contract.

## Validation and checks

`npm run test:metadata` compiles only the metadata and scope adapter into ignored `.metadata-test/`, then runs Node's test runner. Tests exercise invalid slugs, missing references, duplicate uses, architecture links, unsafe URLs, invalid statuses/years, explicit relationship failures, and scoped graph integrity.

`npm run lint` and `npm run build` also validate the complete dataset at module initialization. Broken metadata stops the build before generating project pages. Runtime checks supplement TypeScript because JSON files are externally editable.

Explore initially scopes to one project for larger collections. Its selector exposes all projects and categories; a technology deep link opens its connected-project scope. Each view is derived from the full atlas. Large views scroll within the graph and retain stable positions, pointer highlighting, keyboard access, and reduced-motion behavior.
