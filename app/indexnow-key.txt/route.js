export const dynamic = 'force-dynamic';

export function GET() {
  const key = process.env.INDEXNOW_KEY || '';
  if (!/^[A-Za-z0-9-]{8,128}$/.test(key)) {
    return new Response('Not configured\n', {
      status: 404,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
  }
  return new Response(`${key}\n`, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=300, s-maxage=300',
    },
  });
}
