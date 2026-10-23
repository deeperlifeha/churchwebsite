const fallbackVideoId = 'Nnxnork_tNE';
const iframe = document.querySelector('[data-latest-youtube]');

function embedUrl(videoId) {
  return `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?rel=0&playsinline=1`;
}

if (iframe) {
  fetch('/.netlify/functions/latest-youtube')
    .then(response => response.ok ? response.json() : Promise.reject(new Error('Latest video unavailable')))
    .then(({videoId}) => {
      if (typeof videoId === 'string' && /^[\w-]{11}$/.test(videoId)) iframe.src = embedUrl(videoId);
    })
    .catch(() => { iframe.src = embedUrl(fallbackVideoId); });
}