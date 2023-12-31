import {ICManagementCanister, InstallMode} from '@dfinity/ic-management';
import {Ed25519KeyIdentity} from '@dfinity/identity';
import {createAgent} from '@dfinity/utils';
import {createHash} from 'crypto';
import {readFile} from 'node:fs/promises';

export const deploy = async (args?: string[]) => {
  const identity = Ed25519KeyIdentity.generate();
  const token = identity.toJSON();

  const loadWasm = async (file: string): Promise<{hash: string; wasm: Buffer}> => {
    const wasm = await readFile(file);

    return {
      wasm,
      hash: createHash('sha256').update(wasm).digest('hex')
    };
  };

  const {wasm} = await loadWasm('./target/internet_identity.gz');

  const agent = await createAgent({
    identity,
    host: 'http://localhost:5987',
    fetchRootKey: true
  });

  const {provisionalCreateCanisterWithCycles, installCode} = ICManagementCanister.create({
    agent
  });

  const canisterId = await provisionalCreateCanisterWithCycles({
    settings: {
      controllers: [identity.getPrincipal().toString()]
    }
  });

  console.log(`🚀 ----> ${canisterId.toString()}`);

  await installCode({
    mode: InstallMode.Install,
    canisterId,
    wasmModule: wasm,
    arg: new Uint8Array()
  });
};
