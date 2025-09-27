import {assertNonNullish, isNullish} from '@dfinity/utils';
import kleur from 'kleur';
import {
  createServer,
  type IncomingMessage,
  type OutgoingHttpHeaders,
  type Server,
  type ServerResponse
} from 'node:http';
import {consoleModule} from '../modules/console';
import {observatory} from '../modules/observatory';
import {satellite} from '../modules/satellite';
import {buildContext} from '../services/context.services';
import {collectIdentities} from '../services/identity.services';
import {setController} from '../services/server/controller.services';
import {transfer} from '../services/server/ledger.services';
import {upgradeSatellite} from '../services/server/satellite.services';
import {buildSputnik} from '../services/server/sputnik.services';
import type {CliContext} from '../types/context';
import {nextArg} from '../utils/args.utils';

const {red} = kleur;

const buildServer = ({context}: {context: CliContext}): Server =>
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
    // eslint-disable-next-line @typescript-eslint/prefer-destructuring
    const command = pathname.split('/')[1];
    // eslint-disable-next-line @typescript-eslint/prefer-destructuring
    const subCommand = pathname.split('/')[2];

    const done = () => {
      res.writeHead(200, headers);
      res.end('Done');
    };

    const error404 = () => {
      res.writeHead(404, headers);
      res.end('Unknown command');
    };

    const error500 = () => {
      res.writeHead(500, headers);
      res.end('Unexpected error');
    };

    // eslint-disable-next-line complexity
    const handleRequest = async () => {
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
      const satelliteBuild = process.env.CLI_BUILD === 'satellite';

      if (!satelliteBuild && ['console', 'observatory'].includes(command)) {
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

      const consoleBuild = process.env.CLI_BUILD === 'console';

      if (command === 'satellite') {
        switch (subCommand) {
          case 'controller':
            await setController({
              context,
              searchParams,
              key: satellite.key
            });
            done();
            return;
        }

        if (!consoleBuild) {
          switch (subCommand) {
            case 'upgrade':
              // We don't await the promise on purpose given the process takes some time.
              // eslint-disable-next-line @typescript-eslint/no-floating-promises
              upgradeSatellite({
                context,
                searchParams
              });
              done();
              return;
          }
        }

        error404();
        return;
      }

      if (!consoleBuild && command === 'sputnik') {
        switch (subCommand) {
          case 'build':
            // We don't await the promise on purpose given the process takes some time.
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            buildSputnik();
            done();
            return;
        }

        error404();
        return;
      }

      if (command === 'admin') {
        switch (subCommand) {
          case 'identities': {
            const identities = collectIdentities({context});

            const headers: OutgoingHttpHeaders = {
              ...corsHeaders,
              'Content-Type': 'application/json'
            };

            res.writeHead(200, headers);
            res.end(JSON.stringify(identities));
            return;
          }
        }

        error404();
        return;
      }

      if (command === 'health') {
        res.writeHead(200, headers);
        res.end('Ok');
        return;
      }

      error404();
    };

    try {
      await handleRequest();
    } catch (err: unknown) {
      console.log(red('️‼️  Unexpected error while processing the request:'), err);
      error500();
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
