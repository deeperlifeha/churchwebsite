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
const ride=readFileSync('site/ride.html','utf8');
assert.ok(ride.includes('action="https://formsubmit.co/deeperlifeha@gmail.com" method="POST"'),'Ride form must POST to the church email service');
assert.ok(!ride.includes('name="_captcha" value="false"'),'Keep submission verification enabled');
for(const field of ['Full name','Phone','Pickup address','Service date','Passengers','Return trip','Consent']) assert.ok(ride.includes(`name="${field}"`),`Missing ride email field: ${field}`);
console.log(`Checked ${pages.length} pages: headings, active navigation, ride links, and local assets.`);
