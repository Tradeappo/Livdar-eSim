import { evaluateProgrammaticCandidate } from '../../../../lib/programmatic/eligibility.js';
import taxonomy from '../../../../data/programmatic-taxonomy.json' with { type: 'json' };
import { contentLocales } from '../../../../lib/content/index.js';

export const dynamic = 'force-dynamic';

function authorized(request) {
  const token = process.env.SEO_AUTOMATION_TOKEN;
  return Boolean(token && request.headers.get('authorization') === `Bearer ${token}`);
}

export async function POST(request) {
  if (!process.env.SEO_AUTOMATION_TOKEN) {
    return Response.json({ error: 'Automation is not configured.' }, { status: 503 });
  }
  if (!authorized(request)) return Response.json({ error: 'Unauthorized.' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const family = taxonomy.families.find((item) => item.key === body?.candidate?.family);
  if (!body?.candidate || !family) return Response.json({ error: 'A candidate with a known family is required.' }, { status: 400 });

  return Response.json({
    generationEnabled: taxonomy.generationEnabled,
    result: evaluateProgrammaticCandidate(body.candidate, family, contentLocales()),
  });
}
