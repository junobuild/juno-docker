import {IDL} from '@dfinity/candid';
import {existsSync} from 'node:fs';
import {MAIN_IDENTITY_KEY} from '../../constants/constants';
import {DEV_SATELLITE} from '../../constants/dev.constants';
import {Module} from '../../services/modules/module.services';
import type {ModuleDescription, ModuleInstallParams} from '../../types/module';

export const SATELLITE: ModuleDescription = {
  key: 'satellite',
  name: 'Satellite',
  canisterId: 'jx5yt-yyaaa-aaaal-abzbq-cai'
};

export class SatelliteModule extends Module {
  override async install({
    identities: {[MAIN_IDENTITY_KEY]: mainIdentity, ...otherIdentities},
    ...rest
  }: ModuleInstallParams): Promise<void> {
    const arg = IDL.encode(
      [
        IDL.Record({
          controllers: IDL.Vec(IDL.Principal)
        })
      ],
      [{controllers: [mainIdentity.getPrincipal()]}]
    );

    await super.install({
      identities: {[MAIN_IDENTITY_KEY]: mainIdentity, ...otherIdentities},
      ...rest,
      arg
    });
  }
}

export const initSatelliteModule = (): SatelliteModule =>
  new SatelliteModule({
    ...SATELLITE,
    ...(existsSync(DEV_SATELLITE) && {wasmPath: DEV_SATELLITE})
  });

export const satellite = initSatelliteModule();
