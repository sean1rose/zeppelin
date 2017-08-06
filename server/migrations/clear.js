'use strict';

const app = require('../server');

const settings = app.dataSources.db.settings;
const db = require('../../common/helpers/db')(settings);

console.log(`\nRunning the clear database script for node environment: ${process.env.NODE_ENV}\n`);
const sql =
  'CREATE OR REPLACE FUNCTION strip_all_triggers() RETURNS text AS $$ DECLARE\
  triggNameRecord RECORD;\
  triggTableRecord RECORD;\
  BEGIN\
  FOR triggNameRecord IN select distinct(trigger_name) from information_schema.triggers where trigger_schema = \'public\' LOOP\
  FOR triggTableRecord IN SELECT distinct(event_object_table) from information_schema.triggers where trigger_name = triggNameRecord.trigger_name LOOP\
  RAISE NOTICE \'Dropping trigger: % on table: %\', triggNameRecord.trigger_name, triggTableRecord.event_object_table;\
  EXECUTE \'DROP TRIGGER \' || triggNameRecord.trigger_name || \' ON \' || triggTableRecord.event_object_table || \';\';\
  END LOOP;\
  END LOOP;\
  \
  RETURN \'done\';\
  END;\
  $$ LANGUAGE plpgsql SECURITY DEFINER;\
  \
  select strip_all_triggers();\
  DROP SCHEMA public CASCADE;\
  CREATE SCHEMA public;';
return db.any(sql).then(() => {
  console.log(`ran clear db successfully on NODE_ENV=${process.env.NODE_ENV}`);
  process.exit();
}).catch(err => {
  console.trace(err);
});
