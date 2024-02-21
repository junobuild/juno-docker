import {Ed25519KeyIdentity} from '@dfinity/identity';
import {nonNullish} from '@dfinity/utils';
import type {CliState} from '../states/cli.state';

export const getIdentity = ({state, key}: {state: CliState; key: string}): Ed25519KeyIdentity => {
  const identity = state.getIdentity(key);

  if (nonNullish(identity)) {
    const [_, token] = identity;
    return Ed25519KeyIdentity.fromParsedJson(token);
  }

  // TODO: bump agent-js and remove null
  // Workaround for agent-js issue https://forum.dfinity.org/t/ed25519keyidentity-generate-without-args-generates-same-principal/27659
  const newIdentity = Ed25519KeyIdentity.generate(null as unknown as Uint8Array | undefined);
  state.saveIdentity({key, jsonIdentity: newIdentity.toJSON()});

  return newIdentity;
};
