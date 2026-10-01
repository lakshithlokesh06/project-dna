# Project DNA

A responsive technical atlas of real software repositories, built with Next.js App Router, TypeScript, Tailwind CSS v4, and Framer Motion.

## Development

```sh
npm install
npm run dev
```

Open http://localhost:3000. Run `npm run lint`, `npm run test:metadata`, and `npm run build` before releasing. `npm start` serves the production build.

## Structure

- `lib/metadata/`: canonical project records, technology/category registries, validation, and derived atlas
- `lib/explore/`: deterministic graph layout, scope filtering, and shared lookup/URL helpers
- `components/`: identity, navigation, interactive network, stack DNA, and section headings
- `app/`: landing page, Explore, project detail routes, and global design tokens

The landing page, `/explore`, and `/projects/[slug]` share the same validated metadata. Each project page includes its stack, exact technology roles, capabilities, architecture, repository/demo links, status, year, source scope, and collection navigation. Technology links use `/explore?technology=<id>` to highlight their connected projects. Unknown technology IDs safely fall back to normal exploration; unknown projects show a dedicated not-found view.

See [metadata documentation](docs/metadata.md) for the record contract, initial collection, verification scope, and extension workflow. Metadata is curated at build time; there is no live GitHub synchronization or application backend.
