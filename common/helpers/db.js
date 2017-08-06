/**
 * Created by mike on 9/6/16.
 */

'use strict';

const _ = require('lodash');

const Promise = require('bluebird');

const pgp = require('pg-promise')({
  // Initialization Options
  promiseLib: Promise,
  noLocking: true,
  pgFormatting: true,
});

let dbArray = [];

module.exports = (settings) => {
  let db;
  if (dbArray.length) {
    const foundDB = _.find(dbArray, {host: settings.host});
    if (foundDB) {
      db = foundDB.db;
    } else {
      db = pgp(settings);
      dbArray.push({
        host: settings.host,
        db: db,
        poolSize: settings.poolSize,
      });
    }
  } else {
    db = pgp(settings);
    dbArray.push({
      host: settings.host,
      db: db,
      poolSize: settings.poolSize,
    });
  }
  return db;
};
