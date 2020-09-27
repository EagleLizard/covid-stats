
import { promisify } from 'util';
import fs from 'fs';
const readFile = promisify(fs.readFile);

import csvParse from 'csv-parse';

export type CovidData = {
  date: Date;
  time_stamp: number;
  positiveIncrease: number;
  deathIncrease: number;
};

export async function parseCsvFromFile(filePath: string): Promise<any[][]> {
  let fileData: string;
  fileData = (await readFile(filePath)).toString();
  return new Promise((resolve, reject) => {
    csvParse(fileData, (err, output) => {
      if(err) {
        return reject(err);
      }
      resolve(output as any[][]);
    });
  });
}

export function convertRowData(csvRowData: any[][]) {
  let headers: string[], convertedRows: any[];
  headers = csvRowData[0];
  convertedRows = Array(csvRowData.length - 1).fill(0);
  for(let i = 1, currRow: any[]; i < csvRowData.length, currRow = csvRowData[i]; ++i) {
    let convertedRow: any;
    convertedRow = headers.reduce((acc, curr, idx) => {
      acc[curr] = currRow[idx];
      return acc;
    }, {} as any);
    convertedRows[i - 1] = convertedRow;
  }
  return convertedRows;
}

export function parseCovidData(csvData: any[]): CovidData[] {
  let parsedData: CovidData[];
  parsedData = csvData.map(dataObj => {
    let rawDataDate: string, dataYear: number, dataMonth: number, dataDay: number;
    let dataDate: Date;
    rawDataDate = dataObj.date;
    dataYear = +rawDataDate.substring(0, 4);
    dataMonth = +rawDataDate.substring(4, 6);
    dataDay = +rawDataDate.substring(6);
    // console.log(dataYear);
    // console.log(dataMonth);
    // console.log(dataDay);
    // console.log('');
    dataDate = new Date(dataYear, dataMonth - 1, dataDay);
    return {
      date: dataDate,
      time_stamp: dataDate.valueOf(),
      positiveIncrease: +dataObj.positiveIncrease,
      deathIncrease: +dataObj.deathIncrease,
    };
    // return Object.assign({}, dataObj, {
    //   positiveIncrease: dataObj.positiveIncrease,
    // });
  });
  return parsedData;
}
