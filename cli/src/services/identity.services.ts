import {Ed25519KeyIdentity} from '@dfinity/identity';
import {nonNullish} from '@dfinity/utils';
import type {CliState} from '../states/cli.state';
import type {CliContext} from '../types/context';

export const getIdentity = ({state, key}: {state: CliState; key: string}): Ed25519KeyIdentity => {
  const identity = state.getIdentity(key);

  if (nonNullish(identity)) {
    const [_, token] = identity;
    return Ed25519KeyIdentity.fromParsedJson(token);
  }

  const newIdentity = Ed25519KeyIdentity.generate();
  state.saveIdentity({key, jsonIdentity: newIdentity.toJSON()});

  return newIdentity;
};

export const collectIdentities = ({
  context: {identities}
}: {
  context: CliContext;
}): Record<string, string> =>
  Object.entries(identities).reduce(
    (acc, [key, identity]) => ({
      ...acc,
      [key]: identity.getPrincipal().toText()
    }),
    {}
  );
