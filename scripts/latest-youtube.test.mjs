import {test} from 'node:test';
import assert from 'node:assert/strict';
import {latestVideoId} from '../netlify/functions/latest-youtube.mjs';

test('reads the newest YouTube video ID from the channel feed', () => {
  const feed = '<feed><entry><yt:videoId xmlns:yt="urn:youtube">abcDEF_1234</yt:videoId></entry></feed>';
  assert.equal(latestVideoId(feed), 'abcDEF_1234');
});

test('returns null when the channel feed has no video', () => {
  assert.equal(latestVideoId('<feed></feed>'), null);
});