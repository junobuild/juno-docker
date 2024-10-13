import type {Identity} from '@dfinity/agent';
import {
  Decimal,
  Governance,
  NetworkEconomics,
  Neuron,
  NeuronId,
  NeuronsFundEconomics,
  NeuronsFundMatchedFundingCurveCoefficients,
  Percentage,
  PrincipalId,
  XdrConversionRate
} from '@dfinity/nns-proto';
import {neuronSubaccount} from '@dfinity/sns';
import {MAIN_IDENTITY_KEY} from '../../constants/constants';
import {NEURON_ID} from '../../constants/modules.constants';
import type {ModuleInstallParams} from '../../types/module';

export const prepareGovernanceArgs = ({
  identities
}: Pick<ModuleInstallParams, 'identities'>): Governance => {
  const {[MAIN_IDENTITY_KEY]: identity} = identities;

  // Source: https://github.com/dfinity/ic/blob/e90838a1687f8e0869d85343aac2845d883f74ff/rs/nns/governance/src/governance.rs#L231
  const E8S_PER_ICP = 100_000_000n;
  const DEFAULT_TRANSFER_FEE = 10_000n;

  const fund = new NeuronsFundEconomics();

  const decimal = (value: string): Decimal => {
    const dev = new Decimal();
    dev.setHumanReadable(value);
    return dev;
  };

  fund.setMaxTheoreticalNeuronsFundParticipationAmountXdr(decimal('750_000.0'));

  const efficients = new NeuronsFundMatchedFundingCurveCoefficients();
  efficients.setContributionThresholdXdr(decimal('75_000.0'));
  efficients.setOneThirdParticipationMilestoneXdr(decimal('225_000.0'));
  efficients.setFullParticipationMilestoneXdr(decimal('375_000.0'));

  fund.setNeuronsFundMatchedFundingCurveCoefficients(efficients);

  const percentage = (value: number): Percentage => {
    const dev = new Percentage();
    dev.setBasisPoints(value);
    return dev;
  };

  fund.setMinimumIcpXdrRate(percentage(10_000)); // 1:1
  fund.setMaximumIcpXdrRate(percentage(1_000_000)); // 1:100

  const eco = new NetworkEconomics();
  eco.setRejectCostE8s(Number(E8S_PER_ICP)); // 1 ICP
  eco.setNeuronMinimumStakeE8s(Number(E8S_PER_ICP)); // 1 ICP
  eco.setNeuronManagementFeePerProposalE8s(1_000_000); // 0.01 ICP
  eco.setMinimumIcpXdrRate(100); // 1 XDR
  eco.setNeuronSpawnDissolveDelaySeconds(24 * 60 * 60 * 7); // 7 days
  eco.setMaximumNodeProviderRewardsE8s(1_000_000 * 100_000_000); // 1M ICP
  eco.setTransactionFeeE8s(Number(DEFAULT_TRANSFER_FEE));
  eco.setMaxProposalsToKeepPerTopic(100);
  eco.setNeuronsFundEconomics(fund);

  const xdr = new XdrConversionRate();
  xdr.setTimestampSeconds(1);
  xdr.setXdrPermyriadPerIcp(10_000);

  const neuron = prepareNeuron({identity});

  const gov = new Governance();
  gov.getNeuronsMap().set(neuron.getId()?.getId() ?? NEURON_ID, neuron);
  gov.setWaitForQuietThresholdSeconds(60 * 60 * 24 * 4); // 4 days
  gov.setEconomics(eco);
  gov.setGenesisTimestampSeconds(0);
  gov.setShortVotingPeriodSeconds(60 * 60 * 12); // 12 hours
  gov.setXdrConversionRate(xdr);

  return gov;
};

const prepareNeuron = ({identity}: {identity: Identity}): Neuron => {
  const id = new NeuronId();
  id.setId(NEURON_ID);

  const subAccount = neuronSubaccount({
    index: 0,
    controller: identity.getPrincipal()
  }) as Uint8Array;

  const principalId = new PrincipalId();
  principalId.setSerializedId(identity.getPrincipal().toUint8Array());

  const neuron = new Neuron();
  neuron.setId(id);
  neuron.setAccount(subAccount);
  neuron.setController(principalId);
  neuron.setHotKeysList([principalId]);
  neuron.setCachedNeuronStakeE8s(1_000_000 * 100_000_000); // 1M ICP
  neuron.setCreatedTimestampSeconds(0);
  neuron.setAgingSinceTimestampSeconds(0);
  neuron.setKycVerified(true);
  neuron.setMaturityE8sEquivalent(0);
  neuron.setNotForProfit(true);
  neuron.setDissolveDelaySeconds(24 * 60 * 60 * 365 * 8); // 8 * 365 days

  return neuron;
};
