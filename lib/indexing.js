// One server-side decision for pages, robots, sitemaps and QA.
//
// Vercel previews must stay closed even if a broadly scoped environment
// variable accidentally says otherwise. Production can still be closed
// explicitly for an incident or a staged launch.
export function indexingAllowed(env = process.env) {
  if (env.VERCEL_ENV && env.VERCEL_ENV !== 'production') return false;
  return env.NEXT_PUBLIC_ALLOW_INDEXING !== 'false';
}
