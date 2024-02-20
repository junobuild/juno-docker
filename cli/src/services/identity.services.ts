import {Ed25519KeyIdentity} from '@dfinity/identity';
import {nonNullish} from '@dfinity/utils';
import type {CliState} from '../states/cli.state';

export const getIdentity = ({
  state,
  key,
  seed
}: {
  state: CliState;
  key: string;
  seed: Uint8Array;
}): Ed25519KeyIdentity => {
  const identity = state.getIdentity(key);

  if (nonNullish(identity)) {
    const [_, token] = identity;
    return Ed25519KeyIdentity.fromParsedJson(token);
  }

  const newIdentity = Ed25519KeyIdentity.generate(seed);
  state.saveIdentity({key, jsonIdentity: newIdentity.toJSON()});

  return newIdentity;
};
