const zipdir = require('zip-dir');
const fs = require('fs');
const path = require('path');
const moment = require('moment')
const {Message} = require('element-ui');
const config_util = require("./config_util")


async function backupDB() {
  const folder = config_util.db_root
  const aim_folder = path.dirname(folder)
  const aim_name = `db-${moment().format('YYYY-M-D_HH-mm-ss')}.zip`
  const aim_path = path.join(aim_folder, aim_name)
  await zipdir(folder, {saveTo: aim_path});
  Message.success(aim_name)
}

//npm install npm install zip-dir
//https://www.npmjs.com/package/zip-dir
module.exports = {
  backupDB
}
