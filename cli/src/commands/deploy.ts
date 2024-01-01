import {createAgent, isNullish} from '@dfinity/utils';
import {CliConfig} from '../configs/cli.config';
import {modules} from '../modules/modules';
import {getIdentity} from '../services/auth.services';
import {nextArg} from '../utils/args.utils';

export const deploy = async (args?: string[]) => {
  const configPath = nextArg({args, option: '-c'}) ?? nextArg({args, option: '--config'});

  if (isNullish(configPath)) {
    throw new Error(
      'No path to read and write the configuration provided as argument of the deploy command.'
    );
  }

  const config = new CliConfig(configPath);

  const port = nextArg({args, option: '-p'}) ?? nextArg({args, option: '--port'});

  if (isNullish(port)) {
    throw new Error('An icx-proxy port must be provided as argument of the deploy command.');
  }

  const identity = getIdentity(config);

  const agent = await createAgent({
    identity,
    host: `http://localhost:${port}`,
    fetchRootKey: true
  });

  await Promise.all(modules.map((mod) => mod.deploy({identity, agent, config})));
};
