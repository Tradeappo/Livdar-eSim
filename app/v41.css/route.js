import { V41_STYLES } from '../../lib/v41-source.js';

export const dynamic = 'force-static';

export function GET() {
  return new Response(V41_STYLES, {
    headers: {
      'content-type': 'text/css; charset=utf-8',
      'cache-control': 'public, max-age=31536000, immutable',
    },
  });
}
