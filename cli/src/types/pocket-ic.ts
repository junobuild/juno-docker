import * as z from 'zod';

const zNullable = <T extends z.ZodTypeAny>(schema: T) => schema.nullish();

const socketAddrRegex = /^(?:\[?[A-Fa-f0-9:.]+\]?|\d{1,3}(?:\.\d{1,3}){3}):\d{1,5}$/;

const SocketAddrSchema = z.string().regex(socketAddrRegex, {
  message: "Expected SocketAddr like '127.0.0.1:8080' or '[::1]:8080'"
});

const RawTimeSchema = z.strictObject({
  nanos_since_epoch: z.number().int().nonnegative()
});

const AutoProgressConfigSchema = z.strictObject({
  artificial_delay_ms: zNullable(z.number().int().nonnegative())
});

const HttpsConfigSchema = z.strictObject({
  cert_path: z.string(),
  key_path: z.string()
});

const IcpConfigFlagSchema = z.enum(['Disabled', 'Enabled']);

const IcpFeatureSchema = z.literal('DefaultConfig');

const SubnetInstructionConfigSchema = z.enum(['Production', 'Benchmarking']);

const BlobIdSchema = z.string();
const SubnetStateConfigSchema = z.union([
  z.literal('New'),
  z.strictObject({FromPath: z.string()}),
  z.strictObject({FromBlobStore: BlobIdSchema})
]);

const InitialTimeSchema = z.union([
  z.strictObject({Timestamp: RawTimeSchema}),
  z.strictObject({AutoProgress: AutoProgressConfigSchema})
]);

const SubnetSpecSchema = z.strictObject({
  state_config: SubnetStateConfigSchema,
  instruction_config: SubnetInstructionConfigSchema
});

const ExtendedSubnetConfigSetSchema = z.strictObject({
  nns: zNullable(SubnetSpecSchema),
  sns: zNullable(SubnetSpecSchema),
  ii: zNullable(SubnetSpecSchema),
  fiduciary: zNullable(SubnetSpecSchema),
  bitcoin: zNullable(SubnetSpecSchema),
  system: z.array(SubnetSpecSchema),
  application: z.array(SubnetSpecSchema),
  verified_application: z.array(SubnetSpecSchema)
});

const InstanceHttpGatewayConfigSchema = z.strictObject({
  ip_addr: zNullable(z.string()),
  port: zNullable(z.number().int().min(0).max(65535)),
  domains: zNullable(z.array(z.string())),
  https_config: zNullable(HttpsConfigSchema)
});

const IcpConfigSchema = z.strictObject({
  beta_features: zNullable(IcpConfigFlagSchema),
  canister_backtrace: zNullable(IcpConfigFlagSchema),
  function_name_length_limits: zNullable(IcpConfigFlagSchema),
  canister_execution_rate_limiting: zNullable(IcpConfigFlagSchema)
});

export const IcpFeaturesSchema = z.strictObject({
  registry: zNullable(IcpFeatureSchema),
  cycles_minting: zNullable(IcpFeatureSchema),
  icp_token: zNullable(IcpFeatureSchema),
  cycles_token: zNullable(IcpFeatureSchema),
  nns_governance: zNullable(IcpFeatureSchema),
  sns: zNullable(IcpFeatureSchema),
  ii: zNullable(IcpFeatureSchema),
  nns_ui: zNullable(IcpFeatureSchema)
});

const IncompleteStateSchema = z.enum(['Disabled', 'Enabled']);

export const InstanceConfigSchema = z.strictObject({
  subnet_config_set: ExtendedSubnetConfigSetSchema,
  http_gateway_config: zNullable(InstanceHttpGatewayConfigSchema),
  state_dir: zNullable(z.string()),
  icp_config: zNullable(IcpConfigSchema),
  log_level: zNullable(z.string()),
  bitcoind_addr: zNullable(z.array(SocketAddrSchema)),
  icp_features: zNullable(IcpFeaturesSchema),
  incomplete_state: zNullable(IncompleteStateSchema),
  initial_time: zNullable(InitialTimeSchema)
});

export type InstanceHttpGatewayConfig = z.infer<typeof InstanceHttpGatewayConfigSchema>;
export type InstanceConfig = z.infer<typeof InstanceConfigSchema>;
export type SubnetSpec = z.infer<typeof SubnetSpecSchema>;
export type IcpConfig = z.infer<typeof IcpConfigSchema>;
export type IcpFeature = z.infer<typeof IcpFeatureSchema>;
export type IcpFeatures = z.infer<typeof IcpFeaturesSchema>;
export type InitialTime = z.infer<typeof InitialTimeSchema>;
export type IncompleteState = z.infer<typeof IncompleteStateSchema>;
