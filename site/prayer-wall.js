import { prayerRequests } from './prayer-requests.js';

const wall = document.querySelector('#prayer-requests');
const empty = document.querySelector('#wall-empty');
const valid = prayerRequests.filter(request => request && typeof request.id === 'string' && typeof request.title === 'string' && typeof request.message === 'string');
if (valid.length) empty.hidden = true;

for (const request of valid) {
  const card = document.createElement('article');
  card.className = 'prayer-card';
  const title = document.createElement('h3');
  title.textContent = request.title;
  const meta = document.createElement('p');
  meta.className = 'prayer-meta';
  meta.textContent = request.displayName || 'Anonymous';
  if (/^\d{4}-\d{2}-\d{2}$/.test(request.date || '')) {
    const date = new Date(request.date + 'T12:00:00Z');
    if (!Number.isNaN(date.getTime())) meta.textContent += ' · ' + new Intl.DateTimeFormat('en-US', {dateStyle:'medium', timeZone:'UTC'}).format(date);
  }
  const body = document.createElement('p');
  body.className = 'prayer-body';
  body.textContent = request.message;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'button prayer-button';
  const key = 'dlbc-prayed:' + request.id;
  let prayed = false;
  try { prayed = localStorage.getItem(key) === 'yes'; } catch { /* Local storage can be unavailable. */ }
  function update() {
    button.textContent = prayed ? 'You prayed for this' : 'I prayed for this';
    button.setAttribute('aria-pressed', String(prayed));
  }
  update();
  button.addEventListener('click', () => {
    prayed = !prayed;
    try { if (prayed) localStorage.setItem(key, 'yes'); else localStorage.removeItem(key); } catch { /* Still works for this visit. */ }
    update();
  });
  card.append(title, meta, body, button);
  wall.append(card);
}
