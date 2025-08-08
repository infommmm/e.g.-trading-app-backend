import localtunnel from 'localtunnel';
import { writeFileSync } from 'node:fs';

(async () => {
  try {
    const tunnel = await localtunnel({ port: 3000 });
    writeFileSync('tunnel-url.txt', tunnel.url, { encoding: 'utf-8' });
    console.log('Tunnel URL:', tunnel.url);
    tunnel.on('close', () => process.exit(0));
  } catch (e) {
    console.error('Tunnel error:', e);
    process.exit(1);
  }
})();