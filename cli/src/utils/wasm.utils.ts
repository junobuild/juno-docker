import {readFileSync} from 'atomically';
import {createHash} from 'crypto';
import type {ModuleDescription} from '../types/module';

export interface Wasm {
  hash: string;
  wasm: Buffer;
}

export const loadWasm = ({wasmPath}: Required<Pick<ModuleDescription, 'wasmPath'>>): Wasm => {
  const wasm = readFileSync(wasmPath);

  return {
    wasm,
    hash: createHash('sha256').update(wasm).digest('hex')
  };
};
