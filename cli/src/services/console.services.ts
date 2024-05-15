import type {Segment} from '../declarations/console';
import type {CliContext} from '../types/context';
import type {ModuleCanisterId} from '../types/module';
import {loadWasm} from '../utils/wasm.utils';
import {getConsoleActor} from './actor.services';

export const installRelease = async ({
  context,
  consoleCanisterId,
  key,
  name,
  version,
  wasmPath
}: {
  context: CliContext;
  consoleCanisterId: ModuleCanisterId;
  key: string;
  name: string;
  version: string;
  wasmPath: string;
}) => {
  const {wasm} = loadWasm({wasmPath});

  const {agent} = context;
  const {reset_release, load_release} = await getConsoleActor({
    agent,
    canisterId: consoleCanisterId
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
