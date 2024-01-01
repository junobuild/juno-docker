import {Ed25519KeyIdentity} from '@dfinity/identity';
import {isNullish, nonNullish} from '@dfinity/utils';
import {getToken, saveToken} from '../configs/cli.config';

export const getIdentity = (): Ed25519KeyIdentity => {
  const token = getToken();

  console.log('⚠️ Token ---------->', isNullish(token));

  if (nonNullish(token)) {
    return Ed25519KeyIdentity.fromParsedJson(token);
  }

  const identity = Ed25519KeyIdentity.generate();
  saveToken(identity.toJSON());

  return identity;
};
