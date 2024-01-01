import {createAgent, isNullish} from '@dfinity/utils';
import {internetIdentity} from '../plugins/internet-identity';
import {getIdentity} from '../services/auth.services';
import {nextArg} from '../utils/args.utils';

export const deploy = async (args?: string[]) => {
  const port = nextArg({args, option: '-p'}) ?? nextArg({args, option: '--port'});

  if (isNullish(port)) {
    throw new Error('An icx-proxy port must be provided as argument of the deploy command.');
  }

  const identity = getIdentity();

  const agent = await createAgent({
    identity,
    host: `http://localhost:${port}`,
    fetchRootKey: true
  });

  await Promise.all([internetIdentity.deploy({identity, agent})]);
};
