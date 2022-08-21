const json_util = require("./json_util")
const item_util = require("./item_util")
const fs = require("fs")
const path = require("path")


function listLocation(location) {
  //1.当前文件夹下的所有非隐藏文件
  const all_file_names = fs.readdirSync(location).filter(name => !name.startsWith("."))
  all_file_names.sort()

  //2.folder
  const folder_names = all_file_names.filter(name => fs.lstatSync(path.join(location, name)).isDirectory())
  const folders = folder_names.map(name => loadFolderObject(location, name))

  //3.item:
  const json_names = all_file_names.filter(name => name.endsWith(".json"))
  //并非所有json文件都能被正确读取
  const items = []
  for (const name of json_names) {
    let ans
    try {
      ans = item_util.readItemFromDbOrDisk(path.join(location, name))
    } catch (e) {
      console.log("item加载失败:", name, e)
      continue
    }
    items.push(ans)
  }
  console.log({folders, items})
  return [folders, items]
}


function loadFolderObject(cur_location, name) {
  const full_path = path.join(cur_location, name)
  const obj = {
    full_path, name
  }
  //进一步检查是否有json文件
  const folder_conf = path.join(full_path, ".folder_description.json")
  if (fs.existsSync(folder_conf)) {
    const conf = json_util.readJson(folder_conf)
    obj.span = conf.span
    obj.use_span = true
  }
  return obj
}


module.exports = {
  listLocation
}
