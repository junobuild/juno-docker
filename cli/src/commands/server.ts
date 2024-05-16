import {assertNonNullish, isNullish} from '@dfinity/utils';
import {createServer, type IncomingMessage, type Server, type ServerResponse} from 'node:http';
import {buildContext} from '../services/context.services';
import {transfer} from '../services/ledger.services';
import type {CliContext} from '../types/context';
import {nextArg} from '../utils/args.utils';

const buildServer = ({
  context
}: {
  context: CliContext;
}): Server<typeof IncomingMessage, typeof ServerResponse> =>
  createServer(async ({url, headers: {host}}: IncomingMessage, res: ServerResponse) => {
    if (isNullish(url)) {
      res.writeHead(400, {'Content-Type': 'text/plain'});
      res.end('No URL provided.');
      return;
    }

    const {pathname, searchParams} = new URL(url, `http://${host}`);
    const command = pathname.split('/')[1];
    const subCommand = pathname.split('/')[2];

    const done = () => {
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end('Done.');
    };

    switch (command) {
      case 'ledger':
        switch (subCommand) {
          case 'transfer':
            await transfer({context, searchParams});
            done();
            break;
        }
        break;
      default:
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('Unknown command');
    }
  });

export const adminServer = async (args?: string[]) => {
  const port = nextArg({args, option: '--admin-port'});

  assertNonNullish(port);

  const context = await buildContext(args);

  buildServer({context}).listen(port, () => {
    console.log(`👑  Admin server started on port ${port}.`);
  });
};
