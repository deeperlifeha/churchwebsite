import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateServiceDate} from '../site/ride-validation.js';
test('reject invalid dates, past dates, and days without services',()=>{
 for(const value of ['', '2026-02-30','2026-10-01','2026-10-20'])assert.ok(validateServiceDate(value,'2026-10-17').error);
});
test('match actual calendar services and vigil replacement',()=>{
 assert.equal(validateServiceDate('2026-11-01','2026-10-17').event.title,'Worship & Communion Service');
 assert.equal(validateServiceDate('2026-11-13','2026-10-17').event.kind,'vigil');
 assert.equal(validateServiceDate('2026-11-06','2026-10-17').event.kind,'revival');
 assert.equal(validateServiceDate('2026-10-19','2026-10-17').event.kind,'study');
});
