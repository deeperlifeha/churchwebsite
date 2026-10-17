import {eventsForMonth} from './calendar-data.js';
export function validateServiceDate(value, today) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return {error:'Choose a service date.'};
  if (value < today) return {error:'Choose today or a future service date.'};
  const [year, month] = value.split('-').map(Number);
  const event = eventsForMonth(year,month-1).find(event=>event.date===value);
  return event ? {event} : {error:'Choose a Sunday, Monday, or Friday service date.'};
}
