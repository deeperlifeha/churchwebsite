import test from 'node:test';
import assert from 'node:assert/strict';
import worker, {validate} from './worker.mjs';
const ride={name:'Test Visitor',phone:'7175550100',email:'visitor@example.com',pickup:'Example pickup location',date:'2030-01-06',passengers:'2',service:'Sunday worship · 10:30 AM',returnTrip:'Yes',notes:'',consent:true,token:'test-token'};
const env={ALLOWED_ORIGIN:'https://church.example',TURNSTILE_SECRET_KEY:'test',RESEND_API_KEY:'test',EMAIL_FROM:'church@example.com',RIDE_EMAIL_TO:'coordinator@example.com',TWILIO_ACCOUNT_SID:'test',TWILIO_AUTH_TOKEN:'test',TWILIO_FROM:'+17175550101',RIDE_SMS_TO:'+17175550102'};
function request(data=ride,origin=env.ALLOWED_ORIGIN){return new Request('https://api.example/api/ride-request',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(data)});}
test('rejects missing consent, invalid contact details and mismatched service dates',()=>{
 assert.ok(validate(ride,'2026-10-11'));
 for(const change of [{consent:false},{phone:'abc'},{date:'2030-01-07'},{date:'2030-02-31'},{date:'2020-01-05'},{passengers:'0'},{email:'bad email'},{pickup:''},{service:'Other — describe below',notes:''}]) assert.equal(validate({...ride,...change},'2026-10-11'),null);
});
test('blocks unknown origins and unconfigured service before any provider call',async()=>{
 assert.equal((await worker.fetch(request(ride,'https://other.example'),env)).status,403);
 assert.equal((await worker.fetch(request(),{...env,RIDE_SMS_TO:''})).status,503);
});
test('verifies tokens before sending and handles both, partial and failed notifications',async()=>{
 const original=globalThis.fetch;
 try {
  for(const scenario of ['both','partial','failed','bad-token','bad-host']){
   const calls=[];
   globalThis.fetch=async (url,options)=>{
    calls.push({url,options});
    if(url.includes('siteverify'))return Response.json({success:scenario!=='bad-token',action:'ride-request',hostname:scenario==='bad-host'?'other.example':'church.example'});
    if(url.includes('resend'))return scenario==='failed'?Response.json({}, {status:500}):Response.json({id:'email-id'});
    return ['failed','partial'].includes(scenario)?Response.json({}, {status:500}):Response.json({sid:'sms-id',status:'queued'});
   };
   const response=await worker.fetch(request(),env); const body=await response.json();
   if(scenario.startsWith('bad-')){assert.equal(response.status,400);assert.equal(calls.length,1);continue;}
   assert.equal(calls.length,3);
   assert.equal(body.status,{both:'accepted',partial:'partial',failed:'unconfirmed'}[scenario]);
   assert.equal(JSON.parse(calls[1].options.body).to[0],env.RIDE_EMAIL_TO);
   assert.equal(calls[2].options.body.get('To'),env.RIDE_SMS_TO);
   assert.ok(calls[2].options.body.get('Body').includes(ride.pickup));
   assert.ok(calls[2].options.body.get('Body').includes(ride.name));
  }
 } finally {globalThis.fetch=original;}
});
test('rejects oversized requests',async()=>{
 assert.equal((await worker.fetch(request({...ride,notes:'x'.repeat(13000)}),env)).status,413);
});
