import {Rule} from '@junobuild/admin';

export type SatelliteCollection = Omit<Rule, 'created_at' | 'updated_at'>;

export interface SatelliteCollections {
  db: SatelliteCollection[];
  storage: SatelliteCollection[];
}

export interface SatelliteController {
  id: string;
  scope: 'write' | 'admin';
}

export interface SatelliteConfig {
  collections: SatelliteCollections;
  controllers?: SatelliteController[];
}

export interface JunoDevConfig {
  satellite: SatelliteConfig;
}
