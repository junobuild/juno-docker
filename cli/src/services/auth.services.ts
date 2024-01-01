import {Ed25519KeyIdentity} from '@dfinity/identity';
import {isNullish, nonNullish} from '@dfinity/utils';
import {CliConfig} from '../configs/cli.config';

export const getIdentity = (config: CliConfig): Ed25519KeyIdentity => {
  const token = config.getToken();

  console.log('⚠️ Token ---------->', isNullish(token));

  if (nonNullish(token)) {
    return Ed25519KeyIdentity.fromParsedJson(token);
  }

  const identity = Ed25519KeyIdentity.generate();
  config.saveToken(identity.toJSON());

  return identity;
};
