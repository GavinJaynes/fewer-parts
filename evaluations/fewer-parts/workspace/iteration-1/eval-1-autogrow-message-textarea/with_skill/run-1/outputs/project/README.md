# Acme Library

Small static front-end for an internal resource library. Tailwind CSS v4 (CSS-first config in `src/input.css`), no JavaScript framework.

- Build: `pnpm run build` (writes `dist/output.css`).
- Pages: `index.html` (library home), `contact.html` (send a message to the librarians).
- Browser targets: current stable Chrome, Edge, Firefox and Safari, including iOS Safari and Android Chrome.
- Conventions: Tailwind utilities in markup; shared tokens in `@theme` in `src/input.css`; small vanilla JS modules in `src/`.
