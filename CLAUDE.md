@AGENTS.md

## Claude-specific notes

- Use `pnpm` for all package operations (not npm or yarn).
- Run `pnpm dev` to start the dev server; it uses Turbopack.
- Run `pnpm preview` to test the Cloudflare Workers build locally.
- After changing the OpenAPI spec, regenerate types with `pnpm api:types`.
