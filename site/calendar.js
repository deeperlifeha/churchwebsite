import {eventsForMonth} from './calendar-data.js';
const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const today = new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const parts = new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',year:'numeric',month:'numeric'}).formatToParts(new Date());
let year = Number(parts.find(p=>p.type==='year').value);
let month = Number(parts.find(p=>p.type==='month').value)-1;
const output = document.querySelector('#calendar-output');
const selector = document.querySelector('#calendar-month');
const annual = document.querySelector('#calendar-year-view');
const heading = document.querySelector('#calendar-year');
function element(tag, text, className) {
  const node=document.createElement(tag);
  if(text) node.textContent=text;
  if(className) node.className=className;
  return node;
}
months.forEach((name,index)=>{ const option=element('option',name);option.value=index;selector.append(option); });
selector.value=month;
function renderMonth(index) {
  const section=element('section',null,'calendar-month');
  const title=element('h2',`${months[index]} ${year}`);
  section.append(title);
  const grid=element('div',null,'month-grid');
  grid.setAttribute('aria-label',`${months[index]} ${year} calendar`);
  ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(day=>grid.append(element('div',day,'weekday')));
  const start=new Date(Date.UTC(year,index,1)).getUTCDay();
  for(let i=0;i<start;i++){const blank=element('div',null,'calendar-blank');blank.setAttribute('aria-hidden','true');grid.append(blank);}
  const events=eventsForMonth(year,index);
  const days=new Date(Date.UTC(year,index+1,0)).getUTCDate();
  for(let day=1;day<=days;day++) {
    const event=events.find(e=>e.day===day);
    const date=`${year}-${String(index+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const cell=element('div',null,`calendar-day ${event ? 'has-event' : 'no-event'}`);
    const label=element('time',String(day),'date-number');label.dateTime=date;
    label.setAttribute('aria-label',`${months[index]} ${day}, ${year}`);
    if(date===today){cell.classList.add('today');label.setAttribute('aria-current','date');}
    cell.append(label);
    if(event) {const item=element('div',null,`calendar-event ${event.kind}`);item.append(element('strong',event.title),element('span',event.time));cell.append(item);}
    grid.append(cell);
  }
  section.append(grid);return section;
}
function render(){
  heading.textContent=year;
  selector.disabled=annual.checked;
  output.replaceChildren(...(annual.checked ? months.map((_,i)=>renderMonth(i)) : [renderMonth(month)]));
  document.querySelector('#calendar-status').textContent=annual.checked ? `Showing all twelve months of ${year}.` : `Showing ${months[month]} ${year}.`;
}
document.querySelector('#previous-year').addEventListener('click',()=>{if(year>1900){year--;render();}});
document.querySelector('#next-year').addEventListener('click',()=>{if(year<2100){year++;render();}});
selector.addEventListener('change',()=>{month=Number(selector.value);render();});
annual.addEventListener('change',render);
render();
