import {assertNonNullish, isNullish} from '@dfinity/utils';
import {createServer, type IncomingMessage, type Server, type ServerResponse} from 'node:http';
import {setController} from '../services/console.services';
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

    const error404 = () => {
      res.writeHead(404, {'Content-Type': 'text/plain'});
      res.end('Unknown command');
    };

    if (command === 'ledger') {
      switch (subCommand) {
        case 'transfer':
          await transfer({context, searchParams});
          done();
          return;
      }

      error404();
      return;
    }

    // If the CLI was build for the satellite but the /console/ is queried, then the feature is not supported.
    const consoleBuild = process.env.CLI_BUILD === 'console';

    if (consoleBuild && command === 'console') {
      switch (subCommand) {
        case 'controller':
          await setController({context, searchParams});
          done();
          return;
      }

      error404();
      return;
    }

    error404();
  });

export const adminServer = async (args?: string[]) => {
  const port = nextArg({args, option: '--admin-port'});

  assertNonNullish(port);

  const context = await buildContext(args);

  buildServer({context}).listen(port, () => {
    console.log(`👑  Admin server started on port ${port}.`);
  });
};
