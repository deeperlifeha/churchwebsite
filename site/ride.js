import {validateServiceDate} from './ride-validation.js';
const form=document.querySelector('#ride-form');
const date=document.querySelector('#service-date');
const summary=document.querySelector('#service-summary');
const service=document.querySelector('#service-details');
function today(){const p=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());return ['year','month','day'].map(k=>p.find(v=>v.type===k).value).join('-');}
function update(){
 date.min=today();
 const result=validateServiceDate(date.value,date.min);
 date.setCustomValidity(result.error || '');
 service.value=result.event ? `${result.event.title} — ${result.event.time} Eastern Time` : '';
 summary.textContent=date.value ? (result.error || service.value) : 'Select a date to see the service and time.';
 return !result.error;
}
date.min=today();
date.addEventListener('change',update);
form.addEventListener('submit',event=>{
 for(const field of form.querySelectorAll('input[type="text"], input[type="tel"], input[type="email"], textarea')) field.value=field.value.trim();
 update();
 if(!form.reportValidity()){event.preventDefault();return;}
 document.querySelector('#ride-status').textContent='Continue on the submission page and complete its verification. Your ride is only confirmed when the church contacts you.';
});
