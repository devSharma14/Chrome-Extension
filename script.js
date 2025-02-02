document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('calculate-button').addEventListener('click', async () => {
    const playlistUrl = document.getElementById('playlist-url').value;
    const playlistId = getPlaylistIdFromUrl(playlistUrl);
  
    if (playlistId) {
      const apiKey = ''; // Enter your own API key generated by you :-) 
      const playlistInfo = await fetchPlaylistInfo(playlistId, apiKey);
      displayPlaylistInfo(playlistInfo);
    } else {
      alert('Invalid playlist URL');
    }
  });
});

function getPlaylistIdFromUrl(url) {
  return new URL(url).searchParams.get('list');
}

async function fetchPlaylistInfo(playlistId, apiKey) {
  let nextPageToken = '';
  let videoCount = 0;
  let totalDuration = 0;

  do {
    const response = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=50&playlistId=${playlistId}&key=${apiKey}&pageToken=${nextPageToken}`);
    const data = await response.json();
    nextPageToken = data.nextPageToken || '';

    const videoIds = data.items.map(item => item.contentDetails.videoId);
    const videoInfo = await fetchVideoInfo(videoIds, apiKey);

    videoCount += videoInfo.lengths.length;
    totalDuration += videoInfo.totalDuration;
  } while (nextPageToken);

  return {
    videoCount,
    totalDuration,
    averageDuration: totalDuration / videoCount
  };
}

async function fetchVideoInfo(videoIds, apiKey) {
  const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds.join(',')}&key=${apiKey}`);
  const data = await response.json();

  let totalDuration = 0;
  const lengths = data.items.map(item => {
    const duration = parseDuration(item.contentDetails.duration);
    totalDuration += duration;
    return duration;
  });

  return { lengths, totalDuration };
}

function parseDuration(duration) {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  const hours = parseInt(match[1]) || 0;
  const minutes = parseInt(match[2]) || 0;
  const seconds = parseInt(match[3]) || 0;
  return (hours * 3600) + (minutes * 60) + seconds;
}

function displayPlaylistInfo(playlistInfo) {
  document.getElementById('playlist-info').innerHTML = `
    <p>Total No. of videos: ${playlistInfo.videoCount}</p>
    <p>Total duration: ${formatDuration(playlistInfo.totalDuration)}</p>
    <p>Average duration: ${formatDuration(playlistInfo.averageDuration)}</p>
  `;
}

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h} Hrs ${m} Mins`;
}
