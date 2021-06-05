const fs = require('fs');
const express = require('express');
const app = express();
app.get('/mv', (req, res) => {
  fs.readFile('./index.html', (err, html) => res.end(html));
});
app.get('/', (req, res) => { 
 fs.readdirSync('./mv').forEach(file => {
  const mvFile = `./mv/${file}`;
  console.log(mvFile)
  fs.stat(mvFile, (err, stats) => {
    if (err) {
      console.log(err);
      return res.status(404).end('<h1>Não existe um video na pasta</h1>');
    }
    // Variáveis necessárias para montar o header corretamente
    const { range } = req.headers;
    const { size } = stats;
    const start = Number((range || '').replace(/bytes=/, '').split('-')[0]);
    const end = size - 1;
    const chunkSize = (end - start) + 1;
    
    res.set({
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': 'video/mp4'
    });
    
    res.status(206);
    
    const stream = fs.createReadStream(mvFile, { start, end });
    stream.on('open', () => stream.pipe(res));
    stream.on('error', (streamErr) => res.end(streamErr));
  });
})
});
app.listen(3000, () => console.log('localPlayer is ON!!'));