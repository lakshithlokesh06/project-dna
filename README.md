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
