const {remote} = require('electron');
const {app} = remote;
const path = require("path")
let userData
///Users/my/Library/Application Support/AnyaMemo/

// const isDevelopment = process.env.NODE_ENV !== 'production'
const isDevelopment = false
if (isDevelopment) {
  userData = path.join(app.getPath("userData"), "devFolder")
} else {
  userData = app.getPath("userData")
}

console.log("isDevelopment", isDevelopment)

const sync_root = path.join(userData, "sync")
const no_sync_root = path.join(userData, "no_sync")
const db_root = path.join(sync_root, "db")
console.log({db_root, sync_root})
module.exports = {
  sync_root, db_root, no_sync_root
}
