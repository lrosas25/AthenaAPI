import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Service } from 'node-windows';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const svc = new Service({
  name: 'Athena API',
  description: 'Node JS Script for Athena API',
  script: path.join(__dirname, 'server.js')
});

svc.on('uninstall', function() {
  //svc.start();
  // console.log('Service uninstalled successfully!');
});

svc.uninstall();