const fs = require("fs")

function execute(cmd_str) {
  let handler
  return new Promise(((resolve, reject) => {
    handler = require('child_process').exec(cmd_str, function (err, stdout, stderr) {
      if (err) {
        console.error("err", err)
        reject(err)
      } else {
        console.log("stdout=========");
        console.log(stdout)
        resolve(stdout)
      }
    });
    handler.on('exit', function (code) {

    });
  }))
}

async function get_file_path_by_inode(file_inode) {
  const dev_inode = fs.statSync("/Users").dev
  const cmd = `GetFileInfo /.vol/${dev_inode}/${file_inode}`
  const logout = await execute(cmd)
  const text = logout.trim().split("\n")[0]
  const filepath = text.substring(7, text.length - 1)
  console.log(filepath)
  return filepath
}

module.exports = {
  get_file_path_by_inode
}
