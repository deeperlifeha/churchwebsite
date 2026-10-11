const required = ['ALLOWED_ORIGIN','TURNSTILE_SECRET_KEY','RESEND_API_KEY','EMAIL_FROM','RIDE_EMAIL_TO','TWILIO_ACCOUNT_SID','TWILIO_AUTH_TOKEN','TWILIO_FROM','RIDE_SMS_TO'];
const services = ['Sunday worship · 10:30 AM','Tuesday Bible study · 5:30 PM','Friday revival hour · 6:00 PM','Other — describe below'];
export function validate(data, today) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  const lengths = {name:100,phone:30,email:254,pickup:300,date:10,service:80,returnTrip:30,notes:1000,token:2048};
  const clean = {};
  for (const [key,max] of Object.entries(lengths)) {
    if (data[key] !== undefined && typeof data[key] !== 'string') return null;
    clean[key] = (data[key] || '').trim();
    if (clean[key].length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(clean[key])) return null;
  }
  if (!clean.name || !clean.pickup || !clean.token || data.consent !== true) return null;
  if (!/^[+\d() .-]{7,30}$/.test(clean.phone) || clean.phone.replace(/\D/g,'').length < 10) return null;
  if (clean.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.email)) return null;
  const date = new Date(clean.date+'T12:00:00Z');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(clean.date) || !Number.isFinite(date.getTime()) || date.toISOString().slice(0,10) !== clean.date || clean.date < today) return null;
  if (!services.includes(clean.service) || !['Yes','No','Please discuss with me'].includes(clean.returnTrip)) return null;
  const index=services.indexOf(clean.service);
  if (index < 3 && date.getUTCDay() !== [0,2,5][index]) return null;
  if (index === 3 && !clean.notes) return null;
  const passengers = Number(data.passengers);
  if (!Number.isInteger(passengers) || passengers < 1 || passengers > 50) return null;
  return {...clean, passengers};
}
export default {
  async fetch(request, env) {
    const origin=request.headers.get('Origin');
    const headers={'Content-Type':'application/json','Cache-Control':'no-store','Vary':'Origin'};
    if (origin === env.ALLOWED_ORIGIN) headers['Access-Control-Allow-Origin']=origin;
    const reply=(status,body)=>new Response(JSON.stringify(body),{status,headers});
    if(new URL(request.url).pathname !== '/api/ride-request') return reply(404,{message:'Not found.'});
    if(!origin || origin !== env.ALLOWED_ORIGIN) return reply(403,{message:'This website is not allowed to submit requests.'});
    if(request.method === 'OPTIONS') return new Response(null,{status:204,headers:{...headers,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Access-Control-Max-Age':'600'}});
    if(request.method !== 'POST') return reply(405,{message:'Use POST.'});
    if(required.some(key=>!env[key])) return reply(503,{message:'Online requests are not available yet. Please call or email the church.'});
    if(!request.headers.get('Content-Type')?.startsWith('application/json')) return reply(415,{message:'Expected JSON.'});
    if(Number(request.headers.get('Content-Length')) > 12000) return reply(413,{message:'Request is too large.'});
    let data;
    try {
      // Bound streamed input even if Content-Length is absent or incorrect.
      const reader=request.body.getReader(); let length=0; const chunks=[];
      for(;;){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>12000){await reader.cancel();return reply(413,{message:'Request is too large.'});}chunks.push(value);}
      const bytes=new Uint8Array(length);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
      data=JSON.parse(new TextDecoder().decode(bytes));
    } catch {return reply(400,{message:'Invalid request.'});}
    const today=new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
    const ride=validate(data,today);
    if(!ride) return reply(400,{message:'Check your contact details, passenger count, consent, and service date. The date must match the selected service; describe any other service in the notes.'});
    try {
      const verified=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({secret:env.TURNSTILE_SECRET_KEY,response:ride.token,remoteip:request.headers.get('CF-Connecting-IP') || undefined}),signal:AbortSignal.timeout(8000)});
      const check=await verified.json();
      if(!verified.ok || !check.success || check.action !== 'ride-request' || check.hostname !== new URL(env.ALLOWED_ORIGIN).hostname) return reply(400,{message:'Verification expired or failed. Please verify again.'});
    } catch {return reply(503,{message:'Verification is unavailable. Please call or email the church.'});}
    const reference=crypto.randomUUID();
    const text=`Ride request ${reference}\n\nName: ${ride.name}\nPhone: ${ride.phone}\nEmail: ${ride.email || 'Not provided'}\nPickup: ${ride.pickup}\nDate: ${ride.date}\nService: ${ride.service}\nPassengers: ${ride.passengers}\nReturn trip: ${ride.returnTrip}\nNotes: ${ride.notes || 'None'}\n\nThe requester consented to sharing these details with the ride coordinator by email and SMS. Please contact them to confirm availability. This is not a confirmed booking.`;
    // Send the actionable ride details to both destinations. Long notes remain in email.
    const sms=`Church ride request ${reference.slice(0,8)}\nName: ${ride.name}\nPhone: ${ride.phone}\nPickup: ${ride.pickup}\nDate: ${ride.date}\nService: ${ride.service}\nPassengers: ${ride.passengers}\nReturn: ${ride.returnTrip}\nNotes: ${ride.notes ? ride.notes.slice(0,350)+(ride.notes.length>350?'… See email for full notes.':'') : 'None'}\nPlease contact the rider to confirm. Full request also sent by email.`;
    const results=await Promise.allSettled([
      fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':reference},body:JSON.stringify({from:env.EMAIL_FROM,to:[env.RIDE_EMAIL_TO],subject:`Church ride request - ${ride.date}`,text,...(ride.email?{reply_to:ride.email}:{})}),signal:AbortSignal.timeout(12000)}).then(async response=>({accepted:response.ok && Boolean((await response.json()).id)})),
      fetch(`https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(env.TWILIO_ACCOUNT_SID)}/Messages.json`,{method:'POST',headers:{Authorization:`Basic ${btoa(env.TWILIO_ACCOUNT_SID+':'+env.TWILIO_AUTH_TOKEN)}`,'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({From:env.TWILIO_FROM,To:env.RIDE_SMS_TO,Body:sms}),signal:AbortSignal.timeout(12000)}).then(async response=>{const body=await response.json();return {accepted:response.ok && Boolean(body.sid) && !['failed','undelivered','canceled'].includes(body.status)};})
    ]);
    const accepted=results.filter(result=>result.status==='fulfilled' && result.value.accepted).length;
    // Provider acceptance is not proof of inbox/handset delivery. Do not log contact details.
    if(accepted===2) return reply(202,{status:'accepted',reference});
    if(accepted===1) return reply(207,{status:'partial',reference});
    return reply(502,{status:'unconfirmed',message:'We could not confirm notification delivery. Please call or email the church before trying again.'});
  }
};
