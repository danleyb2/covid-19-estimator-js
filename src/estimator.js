
function discardDecimal(value) {
  return Math.floor(value);
}

function calculateDaysToElapse(periodType, timeToElapse) {
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

const covid19ImpactEstimator = (data) => {
  const toReturn = {
    data
    // impact: {},
    // severeImpact: {}
  };

  const impact = {};
  const severeImpact = {};

  const { reportedCases } = data;

  const currentlyInfectedImpact = discardDecimal(reportedCases * 10);
  impact.currentlyInfected = currentlyInfectedImpact;
  const currentlyInfectedSevere = discardDecimal(reportedCases * 50);
  severeImpact.currentlyInfected = currentlyInfectedSevere;

  const daysToElapse = calculateDaysToElapse(data.periodType, data.timeToElapse);

  const factor = discardDecimal(2 ** discardDecimal(daysToElapse / 3));
  const infectionsByRequestedTimeImpact = currentlyInfectedImpact * factor;
  impact.infectionsByRequestedTime = infectionsByRequestedTimeImpact;

  const infectionsByRequestedTimeSevere = currentlyInfectedSevere * factor;
  severeImpact.infectionsByRequestedTime = infectionsByRequestedTimeSevere;

  const severeCasesByRequestedTimeImpact = discardDecimal(0.15 * infectionsByRequestedTimeImpact);
  impact.severeCasesByRequestedTime = severeCasesByRequestedTimeImpact;
  const severeCasesByRequestedTimeSevere = discardDecimal(0.15 * infectionsByRequestedTimeSevere);
  severeImpact.severeCasesByRequestedTime = severeCasesByRequestedTimeSevere;

  const { totalHospitalBeds } = data;
  const availableBeds = 0.35 * totalHospitalBeds;

  const bedsByRequestedTimeImpact = discardDecimal(
    availableBeds - severeCasesByRequestedTimeImpact
  );

  impact.hospitalBedsByRequestedTime = bedsByRequestedTimeImpact;
  const bedsByRequestedTimeSevere = availableBeds - severeCasesByRequestedTimeSevere;
  severeImpact.hospitalBedsByRequestedTime = bedsByRequestedTimeSevere;

  const casesForICUByRequestedTimeImpact = discardDecimal(0.05 * infectionsByRequestedTimeImpact);
  impact.casesForICUByRequestedTime = casesForICUByRequestedTimeImpact;
  const casesForICUByRequestedTimeSevere = discardDecimal(0.05 * infectionsByRequestedTimeSevere);
  severeImpact.casesForICUByRequestedTime = casesForICUByRequestedTimeSevere;

  const casesForVentilatorsImpact = discardDecimal(0.02 * infectionsByRequestedTimeImpact);
  impact.casesForVentilatorsByRequestedTime = casesForVentilatorsImpact;
  const casesForVentilatorsSevere = discardDecimal(0.02 * infectionsByRequestedTimeSevere);
  severeImpact.casesForVentilatorsByRequestedTime = casesForVentilatorsSevere;

  const { avgDailyIncomePopulation } = data.region;
  const { avgDailyIncomeInUSD } = data.region;

  const dollarsInFlightImpact = discardDecimal(
    (
      infectionsByRequestedTimeImpact * avgDailyIncomePopulation * avgDailyIncomeInUSD
    ) / daysToElapse
  );
  impact.dollarsInFlight = dollarsInFlightImpact;

  const dollarsInFlightSevere = discardDecimal(
    (
      infectionsByRequestedTimeSevere * avgDailyIncomePopulation * avgDailyIncomeInUSD
    ) / daysToElapse
  );
  severeImpact.dollarsInFlight = dollarsInFlightSevere;

  toReturn.impact = impact;
  toReturn.severeImpact = severeImpact;

  return toReturn;
};

export default covid19ImpactEstimator;
