import {test} from 'node:test';
import assert from 'node:assert/strict';
import {eventsForMonth} from '../site/calendar-data.js';
test('weekly schedule, communion and second-Friday replacement throughout multiple years',()=>{
  for(const year of [2026,2027,2028]) for(let month=0;month<12;month++) {
    const events=eventsForMonth(year,month);
    const vigil=events.filter(e=>e.kind==='vigil');
    assert.equal(vigil.length,1);
    assert.ok(vigil[0].day>=8 && vigil[0].day<=14);
    assert.match(vigil[0].time,/Saturday/);
    assert.equal(events.filter(e=>e.title.includes('Communion')).length,1);
    for(let day=1;day<=new Date(Date.UTC(year,month+1,0)).getUTCDate();day++) {
      const weekday=new Date(Date.UTC(year,month,day)).getUTCDay();
      const matches=events.filter(e=>e.day===day);
      assert.equal(matches.length,[0,1,5].includes(weekday)?1:0);
      if(weekday===0)assert.equal(matches[0].time,'10:30 AM–12:30 PM');
      if(weekday===1)assert.equal(matches[0].time,'5:30–6:30 PM');
    }
  }
});
test('October 2026 and leap-year boundaries',()=>{
  const october=eventsForMonth(2026,9);
  assert.equal(october.find(e=>e.kind==='vigil').date,'2026-10-09');
  assert.equal(october.find(e=>e.title.includes('Communion')).date,'2026-10-04');
  assert.equal(eventsForMonth(2032,1).find(e=>e.day===29).kind,'worship');
});
