const moment = require("moment")
const fs = require("fs")
const path = require("path")
const assert = require('assert-plus');
const json_util = require('./json_util');
const config_util = require('./config_util');
const inode_util = require('./inode_util');
const {shell} = require('electron')
const {Message} = require('element-ui');

async function open_link(item, auto_update_link = true) {
  console.log(item)
  const link = item["link"]
  if (!link) {
    Message.error("无效链接")
    console.error("空链接")
    return
  }

  if (!link.startsWith("file://")) {
    shell.openExternal(link)
    return
  }

  const the_path = link.replace("file://", "")//判断目标目录是否存在
  if (fs.existsSync(the_path)) {
    console.log("直接打开:", the_path)
    shell.openExternal(link)
    return
  }

  console.log("目标文件不存在，通过inode进行查找...", link)
  const path_by_inode = await inode_util.get_file_path_by_inode(item["inode"])
  if (!path_by_inode || !fs.existsSync(path_by_inode)) {//查找到新的路径
    console.error("目标文件不存在，且无法通过inode定位文件位置")
    Message.error("目标文件不存在")
    return
  }
  const new_link = "file://" + path_by_inode
  shell.openExternal(new_link)

  if (auto_update_link) {
    console.log("更新链接")
    item.link = new_link
    writeItemToDisk(item, item._full_path)
  }
}


function getDefSpanWhenNewItem(start_path) {
  // let start_path = "/Users/my/Library/Application Support/sylink/sync/db/A/B/C"
  // let end_path = "/Users/my/Library/Application Support/sylink/sync/db"
  const end_path = config_util.db_root
  const tmp_arr2 = end_path.split("/")
  const tmp_arr = start_path.split("/")

  for (let i = tmp_arr.length; i >= tmp_arr2.length; i--) {
    const location = tmp_arr.slice(0, i).join("/")
    const json_file_path = path.join(location, ".folder_description.json")
    console.log("check", json_file_path)
    if (fs.existsSync(json_file_path)) {
      // console.error("json_util.readJson(json_file_path)", json_util.readJson(json_file_path))
      return json_util.readJson(json_file_path).span
    }
  }
  return []
}


function createNewItem(item_path, link, inode, span, is_on = true) {
  const create_at_str = moment().format('YYYY-M-D HH:mm:ss')
  const rev_plan = create_plan_array(span)
  const obj = {
    link: link,
    inode: inode, //不一定有
    created_at: create_at_str,
    is_on: is_on,
    star: 0,
    rev_plan: rev_plan,
    rev_history: [],
    version: 1,
  }

  //写入磁盘
  writeItemToDisk(obj, item_path)
}

//这里使用 YYYY-M-D 格式
function create_plan_array(span) {
  const rev_plan = []
  let counter = 0
  for (const s of span) {
    counter += s
    const plan = {
      plan_at: moment().add(counter, 'days').format('YYYY-M-D'),
    }
    rev_plan.push(plan)
  }
  return rev_plan
}

function load_item_to_db(item_path) {
  //路径为相对于磁盘的全路径
  const item = load_item_file(item_path)
  memroyDB[item_path] = item
}


function copyWithoutAuxiliaryKeys(obj) {
  const tmp = {}
  for (const key of Object.keys(obj)) {
    if (key.startsWith("_")) {
      continue
    }
    tmp[key] = obj[key]
  }
  return tmp
}


function writeItemToDisk(obj, full_path) {
  //去掉以_开头的key（辅助字段）
  obj = copyWithoutAuxiliaryKeys(obj)
  const json_str = JSON.stringify(obj, null, 2)
  fs.writeFileSync(full_path, json_str)
  console.log(`writeItemToDisk:${full_path}`)
  console.log(json_str)
}

function setDb(full_path, obj) {
  memroyDB[full_path] = obj
}

function walk(dir) {
  let results = [];
  fs.readdirSync(dir).forEach(function (name) {
    const full_path = dir + '/' + name;
    const stat = fs.statSync(full_path);
    if (stat && stat.isDirectory()) { //文件夹，继续递归遍历
      results = results.concat(walk(full_path));
    } else {//普通文件
      if (!name.startsWith(".") && name.endsWith(".json")) {
        results.push({
          "full_path": full_path,
          "parent_full_path": dir,
          "name": name
        });
      }
    }
  });
  return results;
}


function readAllItemsFromDisk() {
  //1.递归遍历所有.json 结尾文件
  const all_json_files = walk(config_util.db_root)

  //2.并非所有json文件都能被读取
  const result = []
  for (const obj of all_json_files) {
    try {
      result.push(load_item_file(obj.full_path))
    } catch (e) {
      console.log("加载失败:", obj, e)
    }
  }
  return result
}

function load_item_file(json_file_path) {
  const info = json_util.readJson(json_file_path)
  info._name = path.basename(json_file_path)  //没有.json后缀的名字
  info._show_name = info._name.substring(0, info._name.length - 5)
  info._full_path = json_file_path
  info._parent_path = path.dirname(json_file_path)
  info._parent_short_path = info._parent_path.replace(config_util.db_root, "")
  return info
}

//============================================ 内存数据库

let memroyDB

function initMemoryDB() {
  const t1 = new Date().getTime()

  const all_items = readAllItemsFromDisk()
  memroyDB = {}
  all_items.forEach(obj => {
    memroyDB[obj._full_path] = obj
  })

  const t2 = new Date().getTime()
  console.log("initMemoryDB用时：", t2 - t1)
}


function refreshDB() {
  initMemoryDB()
}


function readItemFromDB(full_path) {
  return memroyDB[full_path]
}


//优先使用db中内容，否则尝试从磁盘加载，若磁盘不存在，抛出异常
function readItemFromDbOrDisk(full_path) {
  if (!memroyDB[full_path]) {
    if (fs.existsSync(full_path)) {
      load_item_to_db(full_path)
      console.log("db中不存在，从文件中加载:", full_path)
    } else {
      throw new Error("db与磁盘中都不存在:" + full_path)
    }
  }
  return memroyDB[full_path]
}

function getAllItemsFromDB() {
  return Object.values(memroyDB)
}


function deleteItemFromDbAndDisk(full_path) {
  fs.rmSync(full_path)
  delete memroyDB[full_path]
}

function deleteItemFromDisk(full_path) {
  fs.rmSync(full_path)
}

function getDB() {
  return memroyDB
}

module.exports = {
  createNewItem,
  getDefSpanWhenNewItem,
  initMemoryDB,
  readItemFromDB,
  getAllItemsFromDB,
  deleteItemFromDbAndDisk,
  writeItemToDisk,
  setDb,
  deleteItemFromDisk,
  refreshDB,
  getDB,
  load_item_file,
  load_item_to_db,
  open_link,
  create_plan_array,
  readItemFromDbOrDisk
}
