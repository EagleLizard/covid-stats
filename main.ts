
import sourceMapSupport from 'source-map-support';
sourceMapSupport.install();

import { downloadStateCsv, STATES_ENUM } from './covid-api';
import { convertRowData, CovidData, parseCovidData, parseCsvFromFile } from './parse-csv';
import { scaleTo } from './math-util';

( async () => {
  try {
    await main();
  } catch(e) {
    console.error(e);
  }
})();

async function main() {
  let historicDataPath: string, rowData: any[][], convertedRowData: any[], csvData: any[];
  historicDataPath = await downloadStateCsv(STATES_ENUM.UT);
  console.log(historicDataPath);
  rowData = await parseCsvFromFile(historicDataPath);
  convertedRowData = convertRowData(rowData);
  csvData = parseCovidData(convertedRowData);
  csvData.sort((a, b) => {
    let aStamp, bStamp;
    aStamp = a.time_stamp;
    bStamp = b.time_stamp;
    if(aStamp > bStamp) {
      return 1;
    } else if(aStamp < bStamp) {
      return -1;
    }
    return 0;
  });
  console.log(convertedRowData[0]);
  console.log(csvData[0]);

  analyzeCovidData(csvData);
}

function analyzeCovidData(covidData: CovidData[]) {
  let minIncrease: number, maxIncrease: number;
  minIncrease = Infinity;
  maxIncrease = -1;
  for(let i = 0, currData: CovidData; i < covidData.length, currData = covidData[i]; ++i) {
    let positiveIncreaseLog: number;
    positiveIncreaseLog = Math.log(currData.positiveIncrease);
    console.log(positiveIncreaseLog);
    if(currData.positiveIncrease < minIncrease) {
      minIncrease = currData.positiveIncrease;
    }
    if(currData.positiveIncrease > maxIncrease) {
      maxIncrease = currData.positiveIncrease;
    }
  }
  console.log(maxIncrease);
  console.log(minIncrease);
  process.stdout.write(`\n`);
  for(let i = 0, currData: CovidData; i < covidData.length, currData = covidData[i]; ++i) {
    let positiveIncreaseScaled: number;
    let outStr: string, positiveIncreaseOutStr: string;
    let yearVal: number, monthVal: number, dayVal: number;
    let yearStr: string, monthStr: string, dayStr: string, datePrefix: string;
    yearVal = currData.date.getFullYear();
    monthVal = currData.date.getMonth() + 1;
    dayVal = currData.date.getDate();
    monthStr = (monthVal < 10)
      ? `0${monthVal}`
      : `${monthVal}`
    ;
    dayStr = (dayVal < 10)
      ? `0${dayVal}`
      : `${dayVal}`
    ;
    datePrefix = `${monthStr}/${dayStr}`;
    positiveIncreaseScaled = Math.round(
      scaleTo(currData.positiveIncrease, [minIncrease, maxIncrease], [5, 95])
    );
    positiveIncreaseOutStr = '•'.repeat(positiveIncreaseScaled);
    outStr = `${datePrefix} ${positiveIncreaseOutStr}\n`;
    process.stdout.write(outStr);
  }
}
