import express from 'express';
import cors from 'cors';
import { shopping } from './api/index.js';
import HandleErrors from './utils/error-handler.js'; // Adjust the path accordingly

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

export default async function (app, channel) {
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cors());
  app.use(express.static(__dirname + '/public'));

  //api
  await shopping(app, channel);
}
