import {ICManagementCanister} from '@dfinity/ic-management';
import {Principal} from '@dfinity/principal';
import type {Segment} from '../declarations/console';
import {CONSOLE_CANISTER_ID} from '../modules/console';
import type {CliContext} from '../types/context';
import {loadWasm} from '../utils/wasm.utils';
import {getConsoleActor} from './actor.services';

export const setController = async ({
  context,
  searchParams
}: {
  context: CliContext;
  searchParams: URLSearchParams;
}) => {
  const {agent} = context;

  const id = searchParams.get('id') ?? '';

  // Set the controller to the canister.
  const {updateSettings, canisterStatus} = ICManagementCanister.create({
    agent
  });

  const {
    settings: {controllers}
  } = await canisterStatus(Principal.from(CONSOLE_CANISTER_ID));

  await updateSettings({
    canisterId: Principal.from(CONSOLE_CANISTER_ID),
    settings: {
      controllers: [...controllers.map((p) => p.toText()), id]
    }
  });

  // Add controller to the memory of the canister to allow guarded calls.
  const {set_controllers} = await getConsoleActor({
    agent,
    canisterId: CONSOLE_CANISTER_ID
  });

  await set_controllers({
    controllers: [Principal.fromText(id)],
    controller: {
      metadata: [],
      scope: {Admin: null},
      expires_at: []
    }
  });
};

export const installRelease = async ({
  context,
  key,
  name,
  version,
  wasmPath
}: {
  context: CliContext;
  key: string;
  name: string;
  version: string;
  wasmPath: string;
}) => {
  const {wasm} = loadWasm({wasmPath});

  const {agent} = context;
  const {reset_release, load_release} = await getConsoleActor({
    agent,
    canisterId: CONSOLE_CANISTER_ID
  });

  const segmentType = (): Segment => {
    switch (key) {
      case 'satellite':
        return {Satellite: null};
      case 'orbiter':
        return {Orbiter: null};
      default:
        return {MissionControl: null};
    }
  };

  await reset_release(segmentType());

  const chunkSize = 700000;

  const wasmModule = [...new Uint8Array(wasm)];

  for (let start = 0; start < wasmModule.length; start += chunkSize) {
    const chunks = wasmModule.slice(start, start + chunkSize);
    await load_release(segmentType(), chunks, version);
  }

  console.log(`💫  ${name} uploaded to Console.`);
};
