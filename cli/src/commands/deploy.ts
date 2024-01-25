import {isNullish} from '@dfinity/utils';
import kleur from 'kleur';
import {modules} from '../modules/modules';
import {buildContext} from '../services/context.services';
import type {Module} from '../services/modules.services';

const {green, cyan, red} = kleur;

export const deploy = async (args?: string[]) => {
  const context = await buildContext(args);

  // 1. Create canisters that do not exist yet
  await Promise.all(
    modules
      .filter((mod) => mod.status(context) === undefined)
      .map(async (mod) => {
        await mod.prepare(context);
      })
  );

  // 2. Split the canister already deployed and those which still need to be installed
  const [deployed, rest] = modules.reduce(
    ([deployed, rest]: [Module[], Module[]], mod) => {
      const ready = mod.isDeployed(context);

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
      const id = mod.canisterId(context);

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
      await mod.install(context);
    })
  );
};
