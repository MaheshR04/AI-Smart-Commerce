import https from 'https';

https.get('https://images.unsplash.com/photo-1517256064527-09c53b2d0bc6?auto=format&fit=crop&q=80&w=800', (res) => {
  console.log('STATUS:', res.statusCode);
  res.on('data', () => {});
}).on('error', (err) => {
  console.error('ERROR:', err.message);
});
