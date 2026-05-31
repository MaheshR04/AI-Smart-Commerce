import https from 'https';

const urls = [
  'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1585130401366-fe05a8d813c4?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800'
];

urls.forEach(url => {
  https.get(url, (res) => {
    console.log(`URL: ${url.slice(0, 50)}... STATUS: ${res.statusCode}`);
    res.on('data', () => {});
  });
});
