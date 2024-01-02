import {createAgent, isNullish} from '@dfinity/utils';
import {CliState} from '../states/cli.state';
import type {CliContext} from '../types/context';
import {nextArg} from '../utils/args.utils';
import {getIdentity} from './auth.services';

export const buildContent = async (args?: string[]): Promise<CliContext> => {
  const statePath = nextArg({args, option: '-c'}) ?? nextArg({args, option: '--state'});

  if (isNullish(statePath)) {
    throw new Error(
      'No path to read and write the CLI state provided as argument of the deploy command.'
    );
  }

  const state = new CliState(statePath);

  const port = nextArg({args, option: '-p'}) ?? nextArg({args, option: '--port'});

  if (isNullish(port)) {
    throw new Error('An icx-proxy port must be provided as argument of the deploy command.');
  }

  const identity = getIdentity(state);

  const agent = await createAgent({
    identity,
    host: `http://localhost:${port}`,
    fetchRootKey: true
  });

  return {identity, agent, state};
};
