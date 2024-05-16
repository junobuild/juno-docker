import {assertNonNullish, isNullish} from '@dfinity/utils';
import {createServer, type IncomingMessage, type ServerResponse} from 'node:http';
import {nextArg} from '../utils/args.utils';

const server = createServer(({url, headers: {host}}: IncomingMessage, res: ServerResponse) => {
  if (isNullish(url)) {
    res.writeHead(400, {'Content-Type': 'text/plain'});
    res.end('No URL provided.');
    return;
  }

  const {pathname, searchParams} = new URL(url, `http://${host}`);
  const command = pathname.slice(1);
  const _args = searchParams.get('args') ?? '';

  switch (command) {
    case 'deploy':
    case 'start':
    case 'wait':
    case 'watch':
    case 'version':
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end('Done.');
      break;
    default:
      res.writeHead(404, {'Content-Type': 'text/plain'});
      res.end('Unknown command');
  }
});

export const adminServer = (args?: string[]) => {
  const port = nextArg({args, option: '-p'}) ?? nextArg({args, option: '--port'});

  assertNonNullish(port);

  server.listen(port, () => {
    console.log(`👑  Admin server started on port ${port}.`);
  });
};
