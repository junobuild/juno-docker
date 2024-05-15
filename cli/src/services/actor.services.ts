import {
  Actor,
  type ActorConfig,
  type ActorMethod,
  type ActorSubclass,
  type HttpAgent
} from '@dfinity/agent';
import type {IDL} from '@dfinity/candid';
import type {Principal} from '@dfinity/principal';
import type {_SERVICE as ConsoleActor} from '../declarations/console';
import {idlFactory as idlFactorConsole} from '../declarations/console.idl';

export const getConsoleActor = async (params: {
  agent: HttpAgent;
  canisterId: string | Principal;
}): Promise<ConsoleActor> =>
  await createActor({
    ...params,
    idlFactory: idlFactorConsole
  });

const createActor = async <T = Record<string, ActorMethod>>({
  canisterId,
  idlFactory,
  config = {},
  agent
}: {
  canisterId: string | Principal;
  idlFactory: IDL.InterfaceFactory;
  agent: HttpAgent;
  config?: Pick<ActorConfig, 'callTransform' | 'queryTransform'>;
}): Promise<ActorSubclass<T>> =>
  await Actor.createActor(idlFactory, {
    agent,
    canisterId,
    ...config
  });
