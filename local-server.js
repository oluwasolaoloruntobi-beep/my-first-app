const http = require('http');
const fs = require('fs');
const path = require('path');

const base = process.cwd();
const galleryDir = path.join(base, 'gallery');
const picturesDir = path.join(galleryDir, 'pictures');
const videosDir = path.join(galleryDir, 'videos');
const port = Number.parseInt(process.argv[2], 10) || 8000;

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ogg': 'video/ogg',
  '.mov': 'video/quicktime'
};

function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function readFolder(folderPath, allowedExtensions, webPrefix, done) {
  fs.readdir(folderPath, { withFileTypes: true }, (err, entries) => {
    if (err) {
      done([]);
      return;
    }

    const files = entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((name) => allowedExtensions.includes(path.extname(name).toLowerCase()))
      .filter((name) => !/^logo\./i.test(name))
      .sort((a, b) => a.localeCompare(b))
      .map((name) => `${webPrefix}/${name}`);

    done(files);
  });
}

http
  .createServer((req, res) => {
    const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);

    if (urlPath === '/api/gallery') {
      readFolder(picturesDir, ['.png', '.jpg', '.jpeg', '.webp', '.svg'], 'gallery/pictures', (images) => {
        readFolder(videosDir, ['.mp4', '.webm', '.ogg', '.mov'], 'gallery/videos', (videos) => {
          sendJson(res, 200, { images, videos });
        });
      });
      return;
    }

    const relative = urlPath === '/' ? 'index.html' : urlPath.replace(/^\//, '');
    const filePath = path.join(base, relative);

    if (!filePath.startsWith(base)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Not Found');
        return;
      }

      res.writeHead(200, { 'Content-Type': mime[path.extname(filePath).toLowerCase()] || 'application/octet-stream' });
      res.end(data);
    });
  })
  .listen(port, '127.0.0.1', () => {
    console.log(`Server running at http://127.0.0.1:${port}`);
  });
