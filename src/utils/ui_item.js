import item_util from "@/utils/item_util";
import fs from "fs";
import {Message} from 'element-ui';

const {shell} = require('electron')
async function onRightClick(event, the_dom, item, that) {
  console.log(item, that)
  const options = [
    {
      icon: require("../assets/icon_setting.png"),
      name: "设置",
      id: "setting",
    },
    // {
    //   icon: require("../assets/icon_json.png"),
    //   name: "JSON文件",
    //   id: "open_json"
    // },
    // {
    //   icon: require("../assets/icon_finder.png"),
    //   name: "所在文件夹",
    //   id: "open_parent_folder"
    // },
    {
      icon: require("../assets/icon_trash.png"),
      name: "删除",
      id: "delete"
    },

  ]


  let ans = await showMenu(event, options, the_dom)
  if (ans < 0) {
    return
  }
  const the_id = options[ans].id


  if (the_id === "setting") {
    const new_item = await getAppInstance().$refs.DialogItem.editItem(item)
    that.$emit("edited", new_item)
  } else if (the_id === "open_json") {
    shell.openExternal("file://" + item._full_path)
  } else if (the_id === "open_parent_folder") {
    shell.openExternal("file://" + item._parent_path)
  } else if (the_id === "delete") {
    try {
      await that.$confirm('此操作将永久删除该记录, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
    } catch (e) {
      return
    }
    //1.文件删除
    const full_path = item._full_path
    if (!fs.existsSync(full_path)) {
      Message.error("JSON文件不存在")
      console.error("JSON文件不存在:", full_path)
      return
    }
    fs.rmSync(full_path)
    //2.数据库删除
    const db = item_util.getDB()
    delete db[full_path]
    that.$emit("deleted")
  }
}

export default {
  onRightClick
}
