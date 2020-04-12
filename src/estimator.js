
class Estimator {
  constructor(data) {
    this.reportedCases = data.reportedCases;

    this.daysToElapse = Estimator.calculateDaysToElapse(
      data.periodType,
      data.timeToElapse
    );

    this.factor = Estimator.discardDecimal(
      2 ** Estimator.discardDecimal(this.daysToElapse / 3)
    );

    this.totalHospitalBeds = data.totalHospitalBeds;

    this.avgDailyIncomePopulation = data.region.avgDailyIncomePopulation;
    this.avgDailyIncomeInUSD = data.region.avgDailyIncomeInUSD;
  }

  static calculateDaysToElapse(periodType, timeToElapse) {
    let toReturn = 0;
    switch (periodType) {
      case 'days':
        toReturn = timeToElapse;
        break;

      case 'months':
        toReturn = timeToElapse * 30;
        break;

      case 'weeks':
        toReturn = timeToElapse * 7;
        break;

      default:
        break;
    }
    return toReturn;
  }

  static discardDecimal(value) {
    return Math.trunc(value);
  }

  estimate(by) {
    const toReturn = {};

    const currentlyInfectedImpact = Estimator.discardDecimal(this.reportedCases * by);
    toReturn.currentlyInfected = currentlyInfectedImpact;

    const infectionsByRequestedTimeImpact = currentlyInfectedImpact * this.factor;
    toReturn.infectionsByRequestedTime = infectionsByRequestedTimeImpact;


    const severeCasesByRequestedTimeImpact = Estimator.discardDecimal(
      0.15 * infectionsByRequestedTimeImpact
    );
    toReturn.severeCasesByRequestedTime = severeCasesByRequestedTimeImpact;

    const availableBeds = 0.35 * this.totalHospitalBeds;
    toReturn.hospitalBedsByRequestedTime = Estimator.discardDecimal(
      availableBeds - severeCasesByRequestedTimeImpact
    );

    toReturn.casesForICUByRequestedTime = Estimator.discardDecimal(
      0.05 * infectionsByRequestedTimeImpact
    );


    toReturn.casesForVentilatorsByRequestedTime = Estimator.discardDecimal(
      0.02 * infectionsByRequestedTimeImpact
    );


    toReturn.dollarsInFlight = Estimator.discardDecimal(
      (
        infectionsByRequestedTimeImpact * this.avgDailyIncomePopulation * this.avgDailyIncomeInUSD
      ) / this.daysToElapse
    );

    return toReturn;
  }

  estimateImpact() {
    return this.estimate(10);
  }

  estimateSevereImpact() {
    return this.estimate(50);
  }
}

const covid19ImpactEstimator = (data) => {
  const estimator = new Estimator(data);

  return {
    data,
    impact: estimator.estimateImpact(),
    severeImpact: estimator.estimateSevereImpact()
  };
};

export default covid19ImpactEstimator;
