const fs = require("fs")
const path = require("path")
const config_util = require("./config_util.js");

function readJson(conf_path) {
  return JSON.parse(fs.readFileSync(conf_path).toString())
}

function writeJson(desc_path, obj) {
  fs.writeFileSync(desc_path, JSON.stringify(obj, null, 2))
}


function getRootConf() {
  const root_db_folder_conf = path.join(config_util.db_root, ".folder_description.json")
  const root_conf = readJson(root_db_folder_conf)
  return root_conf
}

module.exports = {
  readJson,
  writeJson,
  getRootConf
}
