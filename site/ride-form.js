const form = document.querySelector('#ride-form');
const result = document.querySelector('#ride-result');
const date = document.querySelector('#ride-date');
const service = document.querySelector('#ride-service');
const notes = document.querySelector('#ride-notes');
const phone = document.querySelector('#ride-phone');
date.min = new Intl.DateTimeFormat('en-CA', {timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
function validateRideDetails() {
  date.setCustomValidity('');
  phone.setCustomValidity('');
  notes.setCustomValidity('');
  const weekdays = [0,2,5];
  if (date.value && service.selectedIndex < 3 && new Date(date.value+'T12:00:00Z').getUTCDay() !== weekdays[service.selectedIndex]) {
    date.setCustomValidity('Choose a date that matches the selected service, or select Other for a special event.');
  }
  if (phone.value && (!/^[+\d() .-]{7,30}$/.test(phone.value.trim()) || phone.value.replace(/\D/g,'').length < 10)) {
    phone.setCustomValidity('Enter a phone number with at least 10 digits, including the area code.');
  }
  if (service.selectedIndex === 3 && !notes.value.trim()) notes.setCustomValidity('Please describe the service or event you want to attend.');
}
for (const input of [date,service,notes,phone]) input.addEventListener('input',validateRideDetails);
form.addEventListener('submit', event => {
  for (const input of form.querySelectorAll('input:not([type=checkbox]):not([type=hidden]),textarea')) input.value = input.value.trim();
  validateRideDetails();
  if (!form.reportValidity()) { event.preventDefault(); return; }
  // Native HTTPS POST: the provider handles CAPTCHA, activation and result pages.
  // Do not claim inbox delivery before the church confirms receipt.
  result.textContent = 'Continue on the secure email submission page to complete your request. Your ride still needs confirmation from the church.';
});
