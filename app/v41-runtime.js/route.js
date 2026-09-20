import { V41_INLINE_SCRIPTS } from '../../lib/v41-source.js';

export const dynamic = 'force-static';

function runtime() {
  return `(() => {
    const locale = document.currentScript?.dataset?.locale || document.documentElement.lang || 'en';
    try { localStorage.setItem('livdarLang', locale); } catch (error) {}
    document.documentElement.lang = locale;
    const sourceScripts = ${JSON.stringify(V41_INLINE_SCRIPTS)};
    for (const source of sourceScripts) {
      const script = document.createElement('script');
      script.text = source;
      document.head.appendChild(script);
      script.remove();
    }
    document.dispatchEvent(new Event('DOMContentLoaded'));
  })();`;
}

export function GET() {
  return new Response(runtime(), {
    headers: {
      'content-type': 'text/javascript; charset=utf-8',
      'cache-control': 'public, max-age=31536000, immutable',
    },
  });
}
