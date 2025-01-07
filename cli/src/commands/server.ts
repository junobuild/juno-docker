import {assertNonNullish, isNullish} from '@dfinity/utils';
import type {OutgoingHttpHeaders} from 'http';
import {createServer, type IncomingMessage, type Server, type ServerResponse} from 'node:http';
import {consoleModule} from '../modules/console';
import {observatory} from '../modules/observatory';
import {buildContext} from '../services/context.services';
import {setController} from '../services/controller.services';
import {transfer} from '../services/ledger.services';
import type {CliContext} from '../types/context';
import {nextArg} from '../utils/args.utils';

const buildServer = ({
  context
}: {
  context: CliContext;
}): Server<typeof IncomingMessage, typeof ServerResponse> =>
  createServer(async ({url, headers: {host}}: IncomingMessage, res: ServerResponse) => {
    // https://stackoverflow.com/a/54309023/5404186
    const corsHeaders: OutgoingHttpHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
      'Access-Control-Max-Age': 2592000, // 30 days
      'Access-Control-Allow-Headers': 'content-type'
    };

    const headers: OutgoingHttpHeaders = {
      ...corsHeaders,
      'Content-Type': 'text/plain'
    };

    if (isNullish(url)) {
      res.writeHead(400, headers);
      res.end('No URL provided.');
      return;
    }

    const {pathname, searchParams} = new URL(url, `http://${host}`);
    const command = pathname.split('/')[1];
    const subCommand = pathname.split('/')[2];

    const done = () => {
      res.writeHead(200, headers);
      res.end('Done.');
    };

    const error404 = () => {
      res.writeHead(404, headers);
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

    if (consoleBuild && ['console', 'observatory'].includes(command)) {
      switch (subCommand) {
        case 'controller':
          await setController({
            context,
            searchParams,
            key: command === 'observatory' ? observatory.key : consoleModule.key
          });
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
