const CHANNEL_ID = 'UCZUcxIouz0Kef_1DSi1NLqw';
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

export function latestVideoId(feed) {
  return feed.match(/<yt:videoId\b[^>]*>([^<]+)<\/yt:videoId>/)?.[1] ?? null;
}

export default async () => {
  try {
    const response = await fetch(FEED_URL, {headers: {Accept: 'application/atom+xml'}});
    if (!response.ok) throw new Error(`YouTube feed returned ${response.status}`);
    const videoId = latestVideoId(await response.text());
    if (!videoId) throw new Error('YouTube feed did not include a video ID');
    return new Response(JSON.stringify({videoId}), {
      headers: {'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300, s-maxage=900'}
    });
  } catch {
    return new Response(JSON.stringify({error: 'Latest video is temporarily unavailable'}), {
      status: 502,
      headers: {'Content-Type': 'application/json', 'Cache-Control': 'no-store'}
    });
  }
};