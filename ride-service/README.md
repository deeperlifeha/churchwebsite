> Paused: the website currently uses direct FormSubmit email delivery only. This backend is retained for a future SMS integration and is not called by the form. The designated recipient is verified in Twilio; no sender has been purchased.

# Ride notifications: setup before enabling the form

This separate Cloudflare Worker lets the static GitHub Pages site send an email through Resend and an SMS alert through Twilio. No API credentials belong in `site/`. The form is fillable before configuration; submission explains that delivery is not yet available. Phone/email links remain available. This service has not been deployed or tested with real recipients.

## Connect

1. Email is set to deeperlifeha@gmail.com. Set the owner-approved SMS recipient as the RIDE_SMS_TO Worker secret when SMS work resumes; keep the coordinator’s personal number out of the public repository.
2. Set up a Resend account and verify a sending domain. Set `EMAIL_FROM` to a verified sender. Gmail may receive email but cannot be used as your verified sending domain.
3. Set up Twilio with an SMS-capable sender. Complete any sender registration/verification required by Twilio for the destination. A trial account can only send to verified recipients. Provider charges apply. Obtain the coordinator's agreement to receive these operational alerts.
4. Create a Cloudflare Turnstile widget for the actual website hostname. Copy its public site key to `site/ride-config.js`. The secret goes only into the Worker.
5. In the Cloudflare Worker configuration set `ALLOWED_ORIGIN` to the exact website origin (scheme and hostname, no path or trailing slash). GitHub Pages repository sites use `https://deeperlifeha.github.io` even when the URL has `/churchwebsite/`. For a custom domain use that origin instead. Update the Turnstile hostname too.
6. Set these Worker secrets through the Cloudflare dashboard or `wrangler secret put NAME`: `TURNSTILE_SECRET_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM`, `RIDE_SMS_TO`. Phone numbers must be in international E.164 format, e.g. +1 followed by ten digits. Do not commit secrets or paste them into chat.
7. Deploy `worker.mjs` with the included Wrangler configuration. Put its HTTPS URL plus `/api/ride-request` in `site/ride-config.js`. Publish the updated `site/` files using the existing GitHub Pages workflow.
8. With the owner's authorization, submit a non-sensitive test and confirm receipt in BOTH the church inbox and coordinator handset. Check spam folders. Provider acceptance alone does not prove delivery. Check Resend/Twilio dashboards if an alert is missing.

## Behavior

Email includes full ride details; SMS includes name, pickup address, date, service, passenger count, return-trip preference, callback number, and a reference. Long notes are shortened in SMS, with full notes available in email. The rider is not automatically texted. Requests are not bookings and are never published on the prayer wall.

The service validates inputs, bounds request size, checks the service weekday, allows only the configured website origin, and verifies single-use Turnstile tokens on the server before sending. Tokens must match the site hostname and ride-request action. Both providers are attempted independently. Partial acceptance is reported honestly; the visitor is asked to call instead of resubmitting. There are no automatic send retries. A timeout can leave delivery uncertain.

No ride database or dashboard is included. Requests are handled in the coordinator inbox. Data is processed by Cloudflare, Resend, and Twilio; review provider retention settings and restrict access to the inbox and handset. Provider delivery monitoring is performed in their dashboards. Use provider spending limits/alerts and Cloudflare request rate controls appropriate to traffic before opening the endpoint broadly.

## Tests

Run `node --test ride-service/worker.test.mjs` from the repository root. Tests mock all external services and never send messages.

Official references: https://www.twilio.com/docs/messaging/api/message-resource · https://resend.com/docs/api-reference/emails/send-email · https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
