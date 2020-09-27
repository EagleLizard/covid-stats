
import fs, { WriteStream } from 'fs';

import fetch, { Response } from 'node-fetch';

import { DATA_PATH } from './constants';
import { mkdirIfNotExist } from './files';

export enum STATES_ENUM {
  UT = 'UT',
}

const COVID_BASE_URI = 'https://api.covidtracking.com/v1';

const stateMap: {[key in STATES_ENUM]: string} = {
  [STATES_ENUM.UT]: 'ut',
}

export async function downloadStateCsv(state: STATES_ENUM): Promise<string> {
  return new Promise((resolve, reject) =>  {
    let stateStr: string, uri: string, dataFileName: string, dataFilePath: string,
      csvWs: WriteStream, response: Response;
    (async () => {
      stateStr = stateMap[state];
      uri = `${COVID_BASE_URI}/states/${stateStr}/daily.csv`;
      dataFileName = 'ut.csv';
      dataFilePath = `${DATA_PATH}/${dataFileName}`;
      csvWs = fs.createWriteStream(dataFilePath);

      csvWs.on('error', err => {
        return reject(err);
      });

      csvWs.on('finish', () => {
        resolve(dataFilePath);
      });

      await mkdirIfNotExist(DATA_PATH);
      response = await fetch(uri);
      response.body.pipe(csvWs);
    })();
  })
}
