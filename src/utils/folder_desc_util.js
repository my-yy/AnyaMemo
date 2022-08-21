const fs = require("fs")
const path = require("path")

function create_root_desc(db_root) {
  const desc_path = path.join(db_root, ".folder_description.json")
  if (!fs.existsSync(desc_path)) {
    const obj = {
      span: [0, 1, 3, 7, 11, 25, 50, 100],
      // rev_mode: "预设间隔"
    }
    //2.创建
    fs.writeFileSync(desc_path, JSON.stringify(obj, null, 2))
    console.log("创建ROOT文件夹预设", obj)
  }
}


function createFolderDescription(folder_path, span) {
  const desc_path = path.join(folder_path, ".folder_description.json")
  const obj = {
    span: span,
  }
  fs.writeFileSync(desc_path, JSON.stringify(obj, null, 2))
}

function removeFolderDesc(folder_full_path) {
  const desc_path = path.join(folder_full_path, ".folder_description.json")
  if (fs.existsSync(desc_path)) {
    fs.rmSync(desc_path)
    console.log("delete folder_description:", desc_path)
  }
}


module.exports = {
  create_root_desc,
  removeFolderDesc,
  createFolderDescription
}

