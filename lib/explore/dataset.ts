import type { AtlasData } from './model';
export const atlas: AtlasData = {
  projects: [
    { id: 'orbit', name: 'Orbit', description: 'A calmer workspace for distributed teams.', summary: 'A collaborative workspace with typed workflows, server-rendered dashboards, and durable team activity history.' },
    { id: 'forma', name: 'Forma', description: 'An open canvas for generative ideas.', summary: 'A browser-based creative canvas that combines reusable interface components with interactive 3D scenes.' },
    { id: 'current', name: 'Current', description: 'Turning complex data into clear signals.', summary: 'An analytics pipeline that processes event streams and serves fast, focused dashboards through a Python API.' },
  ],
  technologies: [
    { id: 'nextjs', name: 'Next.js', category: 'Framework', description: 'Routing, server rendering, and application composition for React projects.' },
    { id: 'typescript', name: 'TypeScript', category: 'Language', description: 'Static types that make shared contracts and complex interfaces easier to maintain.' },
    { id: 'react', name: 'React', category: 'Framework', description: 'Composable components and state-driven interfaces for the web.' },
    { id: 'postgres', name: 'PostgreSQL', category: 'Database', description: 'Relational storage for structured records, queries, and reliable transactions.' },
    { id: 'threejs', name: 'Three.js', category: 'Graphics', description: 'A toolkit for rendering interactive 3D scenes in the browser.' },
    { id: 'python', name: 'Python', category: 'Language', description: 'A versatile language for data processing and backend services.' },
    { id: 'fastapi', name: 'FastAPI', category: 'Framework', description: 'Typed HTTP APIs with validation and automatic interface documentation.' },
    { id: 'redis', name: 'Redis', category: 'Database', description: 'In-memory storage for caching, queues, and fast transient state.' },
  ],
  domains: [
    { id: 'developer-tools', name: 'Developer tools', description: 'Systems that help people build and collaborate.' },
    { id: 'creative-tech', name: 'Creative technology', description: 'Tools for visual experimentation and expression.' },
    { id: 'analytics', name: 'Data & analytics', description: 'Systems that turn information into insight.' },
  ],
  relationships: [
    { id: 'orbit-domain', type: 'belongs-to', projectId: 'orbit', domainId: 'developer-tools' },
    { id: 'forma-domain', type: 'belongs-to', projectId: 'forma', domainId: 'creative-tech' },
    { id: 'current-domain', type: 'belongs-to', projectId: 'current', domainId: 'analytics' },
    { id: 'orbit-next', type: 'uses', projectId: 'orbit', technologyId: 'nextjs', role: 'Application framework' },
    { id: 'orbit-ts', type: 'uses', projectId: 'orbit', technologyId: 'typescript', role: 'Shared type contracts' },
    { id: 'orbit-react', type: 'uses', projectId: 'orbit', technologyId: 'react', role: 'Workspace interface' },
    { id: 'orbit-pg', type: 'uses', projectId: 'orbit', technologyId: 'postgres', role: 'Team records' },
    { id: 'forma-ts', type: 'uses', projectId: 'forma', technologyId: 'typescript', role: 'Canvas types' },
    { id: 'forma-react', type: 'uses', projectId: 'forma', technologyId: 'react', role: 'Editor interface' },
    { id: 'forma-three', type: 'uses', projectId: 'forma', technologyId: 'threejs', role: '3D rendering' },
    { id: 'current-pg', type: 'uses', projectId: 'current', technologyId: 'postgres', role: 'Analytics storage' },
    { id: 'current-python', type: 'uses', projectId: 'current', technologyId: 'python', role: 'Event processing' },
    { id: 'current-api', type: 'uses', projectId: 'current', technologyId: 'fastapi', role: 'Dashboard API' },
    { id: 'current-redis', type: 'uses', projectId: 'current', technologyId: 'redis', role: 'Query cache' },
  ],
};
