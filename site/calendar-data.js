// Dates are calendar dates in Harrisburg (America/New_York), not UTC instants.
export function eventsForMonth(year, month) {
  const events = [];
  const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  for (let day = 1; day <= days; day++) {
    const weekday = new Date(Date.UTC(year, month, day)).getUTCDay();
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (weekday === 0) events.push({date, day, kind:'worship', title:day <= 7 ? 'Worship & Communion Service' : 'Worship Service', time:'10:30 AM–12:30 PM'});
    if (weekday === 1) events.push({date, day, kind:'study', title:'Bible Study', time:'5:30–6:30 PM'});
    if (weekday === 5) {
      const vigil = day >= 8 && day <= 14;
      events.push({date, day, kind:vigil ? 'vigil' : 'revival', title:vigil ? 'Vigil' : 'Revival Hour', time:vigil ? '9:30 PM–12:00 AM (Saturday)' : '6:00–7:00 PM'});
    }
  }
  return events;
}
