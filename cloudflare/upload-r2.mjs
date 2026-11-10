// Bulk-load *validated* Atlas export files to Cloudflare R2.
// Run after export-cloudflare.mjs succeeded and R2 API credentials are provided.
// Dry run by default: set ATLAS_UPLOAD=1 to perform uploads.
// Uploads route-manifest.json last so the Worker never advertises incomplete pages.
// Does not alter Vercel, production DNS, or the Atlas source-of-truth registry.
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const ROOT='.atlas-cloudflare-export';
const BUCKET=process.env.ATLAS_R2_BUCKET || 'livdar-atlas-data';
const MANIFEST='atlas/metadata/route-manifest.json';
const execute=process.env.ATLAS_UPLOAD==='1';
const account=process.env.CLOUDFLARE_ACCOUNT_ID;
const access=process.env.R2_ACCESS_KEY_ID;
const secret=process.env.R2_SECRET_ACCESS_KEY;
const client=execute ? new S3Client({
  region:'auto',
  endpoint:'https://'+account+'.r2.cloudflarestorage.com',
  credentials:{accessKeyId:access,secretAccessKey:secret},
}) : null;
if (execute && (!account || !access || !secret)) throw new Error('Missing CLOUDFLARE_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY');

async function* walk(dir) {
  for (const e of await readdir(dir,{withFileTypes:true})) {
    const full=join(dir,e.name);
    if (e.isDirectory()) yield* walk(full);
    else if (e.isFile()) yield full;
  }
}
const files=[];
for await(const full of walk(ROOT)) files.push({full,key:relative(ROOT,full).split(sep).join('/')});
const manifest=files.find(f=>f.key===MANIFEST);
if (!manifest) throw new Error('Validated route manifest missing. Refusing upload.');
const metadata=JSON.parse(await readFile(manifest.full,'utf8'));
if (metadata.schema!==1 || !Array.isArray(metadata.paths)) throw new Error('Invalid route manifest');
const expected=metadata.paths.length+(metadata.sitemaps||[]).length+1;
if (files.length !== expected) throw new Error('Export mismatch: expected '+expected+' files, got '+files.length);
console.log(JSON.stringify({bucket:BUCKET,files:files.length,html:metadata.paths.length,sitemaps:(metadata.sitemaps||[]).length,dryRun:!execute}));
if (!execute) process.exit(0);
let uploaded=0;
const queue=files.filter(f=>f.key!==MANIFEST);
const concurrency=Number(process.env.ATLAS_UPLOAD_CONCURRENCY||8);
let cursor=0;
async function worker() {
  while(cursor<queue.length){
    const item=queue[cursor++];
    const body=await readFile(item.full);
    const contentType=item.key.endsWith('.xml')?'application/xml; charset=utf-8': 'text/html; charset=utf-8';
    await client.send(new PutObjectCommand({Bucket:BUCKET,Key:item.key,Body:body,ContentType:contentType}));
    uploaded++;
    if(uploaded%250===0) console.log('Uploaded',uploaded,'of',queue.length);
  }
}
await Promise.all(Array.from({length:Math.min(Math.max(concurrency,1),16)},()=>worker()));
const body=await readFile(manifest.full);
await client.send(new PutObjectCommand({Bucket:BUCKET,Key:MANIFEST,Body:body,ContentType:'application/json'}));
console.log(JSON.stringify({uploaded:uploaded+1,bucket:BUCKET,ready:true}));
