// What the deployed function is actually running on.
//
// The Node version in package.json, in .nvmrc, in the workflow files and in
// the Vercel project setting are four claims about the runtime and none of
// them is the runtime. A build log says which Node the build used, which is
// also not the runtime: a Next.js route runs in its own function and can be
// on a different version from the build that produced it.
//
// Vercel's own notice is about the runtime, not the build: projects on Node
// 20 or older stop building after 1 October 2026. So this endpoint reports
// what the function sees, and the answer can be checked rather than inferred.
//
// It exposes nothing that is not already in a public build log: the Node
// version, the platform and the region. No environment variable is read and
// nothing here is indexable.

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export function GET() {
  return Response.json({
    node: process.version,
    nodeMajor: Number(process.versions.node.split('.')[0]),
    platform: process.platform,
    arch: process.arch,
    region: process.env.VERCEL_REGION ?? null,
    environment: process.env.VERCEL_ENV ?? null,
    meaning: 'The Node version this function is running on. The build log and the project setting are claims about it; this is the thing itself.',
  }, {
    headers: {
      'x-robots-tag': 'noindex, nofollow',
      'cache-control': 'no-store',
    },
  });
}
