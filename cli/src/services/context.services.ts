import {createAgent, isNullish} from '@dfinity/utils';
import {MAIN_IDENTITY_KEY, MINTER_IDENTITY_KEY} from '../constants/constants';
import {CliState} from '../states/cli.state';
import type {CliContext} from '../types/context';
import {nextArg} from '../utils/args.utils';
import {getIdentity} from './identity.services';

export const buildContext = async (args?: string[]): Promise<CliContext> => {
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

  /**
   * Agent-js seems to require a random (or different) seed to generate different principal when executed in a row.
   * See https://forum.dfinity.org/t/ed25519keyidentity-generate-without-args-generates-same-principal/27659.
   */
  const generateSeed = (index: number): Uint8Array => {
    if (index >= 256) {
      throw new Error('This implementation supports only 256 seeds');
    }

    const bytes: Uint8Array = new Uint8Array(32).fill(0);
    bytes[31] = index;

    return bytes;
  };

  const mainIdentity = getIdentity({key: MAIN_IDENTITY_KEY, state, seed: generateSeed(0)});
  const minterIdentity = getIdentity({key: MINTER_IDENTITY_KEY, state, seed: generateSeed(1)});

  const agent = await createAgent({
    identity: mainIdentity,
    host: `http://localhost:${port}`,
    fetchRootKey: true
  });

  return {
    identities: {[MAIN_IDENTITY_KEY]: mainIdentity, [MINTER_IDENTITY_KEY]: minterIdentity},
    agent,
    state
  };
};
