


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

  }


  return toReturn;

}


/*
// input format

{
region: {
  name: "Africa",
  avgAge: 19.7,
  avgDailyIncomeInUSD: 5,
  avgDailyIncomePopulation: 0.71
},
periodType: "days",
timeToElapse: 58,
reportedCases: 674,
population: 66622705,
totalHospitalBeds: 1380614
}
*/

const covid19ImpactEstimator = (data) => {

  let toReturn = {
    data: data,
    // impact: {},
    // severeImpact: {}
  };

  let impact = {};
  let severeImpact = {};

  let reportedCases  = data['reportedCases'];

  let currentlyInfectedImpact =  discardDecimal(reportedCases * 10);
  impact['currentlyInfected'] = currentlyInfectedImpact;
  let currentlyInfectedSevere = discardDecimal(reportedCases * 50);
  severeImpact['currentlyInfected'] = currentlyInfectedSevere;

  let daysToElapse = calculateDaysToElapse(data['periodType'],data['timeToElapse']);

  let factor = discardDecimal(Math.pow( 2, discardDecimal(daysToElapse/3)));
  let infectionsByRequestedTimeImpact = currentlyInfectedImpact * factor;
  impact['infectionsByRequestedTime'] = infectionsByRequestedTimeImpact;

  let infectionsByRequestedTimeSevere = currentlyInfectedSevere * factor;
  severeImpact['infectionsByRequestedTime'] = infectionsByRequestedTimeSevere;

  let severeCasesByRequestedTimeImpact = discardDecimal( 15/100 * infectionsByRequestedTimeImpact);
  impact['severeCasesByRequestedTime'] = severeCasesByRequestedTimeImpact;
  let severeCasesByRequestedTimeSevere = discardDecimal(15/100 * infectionsByRequestedTimeSevere);
  severeImpact['severeCasesByRequestedTime'] = severeCasesByRequestedTimeSevere;

  let totalHospitalBeds = data['totalHospitalBeds'];
  let availableHospitalBeds = discardDecimal( 35/100 * totalHospitalBeds);

  let hospitalBedsByRequestedTimeImpact = availableHospitalBeds - severeCasesByRequestedTimeImpact;
  impact['hospitalBedsByRequestedTime'] = hospitalBedsByRequestedTimeImpact;
  let hospitalBedsByRequestedTimeSevere = availableHospitalBeds - severeCasesByRequestedTimeSevere;
  severeImpact['hospitalBedsByRequestedTime'] = hospitalBedsByRequestedTimeSevere;

  let casesForICUByRequestedTimeImpact = discardDecimal(5/100*infectionsByRequestedTimeImpact);
  impact['casesForICUByRequestedTime'] = casesForICUByRequestedTimeImpact;
  let casesForICUByRequestedTimeSevere = discardDecimal( 5/100*infectionsByRequestedTimeSevere);
  severeImpact['casesForICUByRequestedTime'] = casesForICUByRequestedTimeSevere;

  let casesForVentilatorsByRequestedTimeImpact = discardDecimal( 2/100*infectionsByRequestedTimeImpact);
  impact['casesForVentilatorsByRequestedTime'] = casesForVentilatorsByRequestedTimeImpact;
  let casesForVentilatorsByRequestedTimeSevere = discardDecimal( 2/100*infectionsByRequestedTimeSevere);
  severeImpact['casesForVentilatorsByRequestedTime'] = casesForVentilatorsByRequestedTimeSevere;

  let avgDailyIncomePopulation = data['region']['avgDailyIncomePopulation'];
  let avgDailyIncomeInUSD = data['region']['avgDailyIncomeInUSD'];

  let dollarsInFlightImpact =  discardDecimal(
    (infectionsByRequestedTimeImpact * avgDailyIncomePopulation * avgDailyIncomeInUSD) / daysToElapse
  );
  impact['dollarsInFlight'] = dollarsInFlightImpact;

  let dollarsInFlightSevere = discardDecimal(
    (infectionsByRequestedTimeSevere * avgDailyIncomePopulation * avgDailyIncomeInUSD) / daysToElapse
  );
  severeImpact['dollarsInFlight'] = dollarsInFlightSevere;

  toReturn['impact'] = impact;
  toReturn['severeImpact'] = severeImpact;

  return toReturn;

};

export default covid19ImpactEstimator;
