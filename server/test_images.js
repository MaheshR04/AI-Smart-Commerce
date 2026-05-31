import https from 'https';

const urls = [
  'https://images.unsplash.com/photo-1513530534585-c7b1394c6d51?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=800'
];

urls.forEach(url => {
  https.get(url, (res) => {
    console.log(`URL: ${url.slice(0, 50)}... STATUS: ${res.statusCode}`);
    res.on('data', () => {});
  });
});
