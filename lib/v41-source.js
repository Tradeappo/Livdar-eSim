import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

// Parse the supplied artifact once and expose its original parts. The visual
// source remains untouched; CSS and runtime are served as cacheable assets so
// they are not duplicated into every page's HTML and RSC payload.
export const V41_SOURCE = readFileSync(join(process.cwd(), 'source', 'livdar-esim-v41.source'), 'utf8');
export const V41_VERSION = createHash('sha256').update(V41_SOURCE).digest('hex').slice(0, 12);
const head = V41_SOURCE.match(/<head[^>]*>([\s\S]*?)<\/head>/i)?.[1] || '';
const body = V41_SOURCE.split(/<body[^>]*>/i)[1] || '';

export const V41_STYLES = [...head.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((match) => match[1]).join('\n');
export const V41_INLINE_SCRIPTS = [...V41_SOURCE.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].map((match) => match[1]);
export const V41_MARKUP = body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
export const V41_FOOTER = V41_MARKUP.match(/<footer class="footer-card" id="guides">[\s\S]*?<\/footer>/i)?.[0] || '';
export const V41_MARKETPLACE_MARKUP = V41_FOOTER ? V41_MARKUP.replace(V41_FOOTER, '') : V41_MARKUP;
