import {createAgent, isNullish} from '@dfinity/utils';
import kleur from 'kleur';
import {modules} from '../modules/modules';
import {getIdentity} from '../services/auth.services';
import type {Module} from '../services/modules.services';
import {CliState} from '../states/cli.state';
import {nextArg} from '../utils/args.utils';

const {green, cyan, red} = kleur;

export const deploy = async (args?: string[]) => {
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

  const params = {identity, agent, state};

  // 1. Create canisters that do not exist yet
  await Promise.all(
    modules
      .filter((mod) => mod.status(params) !== 'deployed')
      .map(async (mod) => {
        await mod.init(params);
      })
  );

  // 2. Split the canister already deployed and those which still need to be installed
  const [deployed, rest] = modules.reduce(
    ([deployed, rest]: [Module[], Module[]], mod) => {
      const ready = mod.status(params) === 'deployed';

      return [
        [...deployed, ...(ready ? [mod] : [])],
        [...rest, ...(!ready ? [mod] : [])]
      ];
    },
    [[], []]
  );

  // 3. Print out the list of those already deployed
  await Promise.all(
    deployed.map(async (mod) => {
      const id = mod.canisterId(params);

      if (isNullish(id)) {
        console.log(`⚠️  ${red(mod.name)} was not initialized. This is unexpected!`);
        return;
      }

      console.log(`🆗  ${green(mod.name)} already exists. Skipping deployment. ID: ${cyan(id)}`);
    })
  );

  // 4. Deploy / install code in the not yet populated canisters
  await Promise.all(
    rest.map(async (mod) => {
      await mod.deploy({identity, agent, state});
    })
  );
};
