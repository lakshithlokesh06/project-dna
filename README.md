# Project DNA

A restrained, responsive foundation for an atlas of software projects.

## Development

```sh
npm install
npm run dev
```

Open http://localhost:3000. `npm run lint` checks the source and `npm run build` creates a production build.

## Structure

- `app/`: landing page, global design tokens, and metadata
- `components/`: navigation, identity, animated constellation, and section headings
- `lib/data.ts`: explicitly illustrative project, technology, and metric content

Built with Next.js App Router, TypeScript, Tailwind CSS v4, and Framer Motion. Navigation uses real page anchors; concept previews are intentionally informational. No project detail pages, backend, or graph data system is implemented. The decorative constellation respects reduced motion. System fonts avoid external font requests.

## Interactive atlas

`/explore` renders a deterministic, responsive bipartite network. Project nodes use square markers; technologies use circular markers. Pointer hover and keyboard focus trace direct relationships, and selecting a node opens its metadata and related nodes. Escape closes details. On phones, the details panel sits below the graph.

`lib/explore/model.ts` owns typed projects, technologies, domains, relationships, validation, and the layout adapter. `lib/explore/dataset.ts` supplies illustrative metadata without coordinates. `components/explore/network.tsx` accepts any `AtlasData` dataset. Add unique stable IDs and relationships to expand the atlas; domains are metadata shown in project details, rather than additional graph nodes. The two-column layout grows vertically with the dataset and avoids physics simulation. For large future datasets, introduce filtering or a different layout adapter.
