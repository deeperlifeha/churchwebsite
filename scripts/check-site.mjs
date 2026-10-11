import {readFileSync,readdirSync,existsSync} from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve('site');
const pages=readdirSync(root).filter(name=>name.endsWith('.html'));
for(const name of pages){
 const html=readFileSync(path.join(root,name),'utf8');
 assert.equal((html.match(/<h1(?:\s|>)/g)||[]).length,1,`${name}: expected one page heading`);
 assert.equal((html.match(/aria-current="page"/g)||[]).length,1,`${name}: expected one active navigation link`);
 assert.ok(html.includes('href="ride.html"'),`${name}: missing ride link`);
 for(const [,url] of html.matchAll(/(?:href|src)="([^"]+)"/g)){
  if(/^(?:[a-z]+:|#|\/\/)/i.test(url))continue;
  const target=path.resolve(root,url.split(/[?#]/)[0]);
  assert.ok(target.startsWith(root+path.sep) && existsSync(target),`${name}: missing local target ${url}`);
 }
}
const config=readFileSync('site/ride-config.js','utf8');
assert.ok(!/TWILIO_AUTH_TOKEN|RESEND_API_KEY/.test(config),'Secrets must not be in public config');
console.log(`Checked ${pages.length} pages: headings, active navigation, ride links, and local assets.`);
