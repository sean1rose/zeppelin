'use strict';

const server = require('../server/server');
const Promise = require('bluebird');

const ds = server.dataSources.db;

// migrate one table at a time to prevent overloading the database with connections
// get the tables from the data source directly

let lbTables = Object.keys(ds.connector._models);

ds.adapter.pg.connect((err, client, done) => {
  if (err) {
    throw err;
  }
  let automigratePromise;
  if (process.env.UPDATE) {
    // update the tables
    lbTables = lbTables.slice(1);
    automigratePromise = new Promise((resolve) => {
      console.log(`\nRunning the update database schema script for node environment: ${process.env.NODE_ENV}\n`);
      ds.autoupdate(lbTables, (err) => {
        if (err) {
          throw err;
        }
        console.log('The following Loopback tables:\n');
        for (let lbTable of lbTables) {
          console.log(lbTable);
        }
        console.log('\nwere updated.');
        console.log(`\n${lbTables.length} Loopback tables updated in ${ds.adapter.name} for node environment: ${process.env.NODE_ENV}\n`);
        resolve();
      });
    });
  } else {
    console.log(`\nRunning the create database schema script for node environment: ${process.env.NODE_ENV}\n`);
    // create the tables if UPDATE is not specified as part of the environment variables
    automigratePromise = new Promise((resolve) => {
      ds.automigrate(lbTables, (err) => {
        if (err) {
          throw err;
        }
        console.log('The following Loopback tables:\n');
        for (let lbTable of lbTables) {
          console.log(lbTable);
        }
        console.log('\nwere created.');
        console.log(`\n${lbTables.length} Loopback tables created in ${ds.adapter.name} for node environment: ${process.env.NODE_ENV}\n`);
        resolve();
      });
    });
  }
  automigratePromise.then(() => {
    done();
    process.exit();
  }).catch(err => {
    console.log(err);
  });
});

