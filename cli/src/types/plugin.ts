import {HttpAgent, Identity} from '@dfinity/agent';
import {CliConfig} from '../configs/cli.config';
import {Segment} from './segment';

export type DeployParams = {identity: Identity; agent: HttpAgent; config: CliConfig};

export type SegmentDescription = Omit<Segment, 'canisterId'> & Partial<Pick<Segment, 'canisterId'>>;

export interface Plugin {
  deploy: (params: DeployParams) => Promise<void>;
}
