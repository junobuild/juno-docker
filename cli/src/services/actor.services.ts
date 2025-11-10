import {
  Actor,
  type ActorConfig,
  type ActorMethod,
  type ActorSubclass,
  type HttpAgent
} from '@icp-sdk/core/agent';
import type {IDL} from '@icp-sdk/core/candid';
import type {Principal} from '@icp-sdk/core/principal';
import type {_SERVICE as ConsoleActor} from '../declarations/console';
import {idlFactory as idlFactorConsole} from '../declarations/console.idl';
import type {_SERVICE as IcpLedgerActor} from '../declarations/icp_ledger';
import {idlFactory as idlFactorIcpLedger} from '../declarations/icp_ledger.idl';
import type {_SERVICE as ObservatoryActor} from '../declarations/observatory';
import {idlFactory as idlFactorObservatory} from '../declarations/observatory.idl';

export const getConsoleActor = async (params: {
  agent: HttpAgent;
  canisterId: string | Principal;
}): Promise<ConsoleActor> =>
  await createActor({
    ...params,
    idlFactory: idlFactorConsole
  });

export const getObservatoryActor = async (params: {
  agent: HttpAgent;
  canisterId: string | Principal;
}): Promise<ObservatoryActor> =>
  await createActor({
    ...params,
    idlFactory: idlFactorObservatory
  });

export const getLedgerActor = async (params: {
  agent: HttpAgent;
  canisterId: string | Principal;
}): Promise<IcpLedgerActor> =>
  await createActor({
    ...params,
    idlFactory: idlFactorIcpLedger
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
