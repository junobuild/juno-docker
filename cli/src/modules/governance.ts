import {
  Decimal,
  Governance,
  NetworkEconomics,
  NeuronsFundEconomics,
  Percentage
} from '@dfinity/nns-proto';
import {
  NeuronsFundMatchedFundingCurveCoefficients,
  XdrConversionRate
} from '@dfinity/nns-proto/dist/proto/governance_pb';
import {Module} from '../services/modules.services';
import type {ModuleDescription, ModuleInstallParams} from '../types/module';

const GOVERNANCE: ModuleDescription = {
  key: 'governance',
  name: 'NNS Governance',
  canisterId: 'rrkah-fqaaa-aaaaa-aaaaq-cai'
};

class GovernanceModule extends Module {
  override async install({state, identities, ...rest}: ModuleInstallParams): Promise<void> {
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

    const gov = new Governance();
    gov.setWaitForQuietThresholdSeconds(60 * 60 * 24 * 4); // 4 days
    gov.setEconomics(eco);
    gov.setGenesisTimestampSeconds(0);
    gov.setShortVotingPeriodSeconds(60 * 60 * 12); // 12 hours
    gov.setXdrConversionRate(xdr);

    await super.install({
      state,
      arg: gov.serializeBinary(),
      identities,
      ...rest
    });
  }
}

export const governance = new GovernanceModule(GOVERNANCE);
