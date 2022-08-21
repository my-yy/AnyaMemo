<template>
  <div class="home">
    <div style="text-align: right">
      <el-tooltip
        class="item"
        effect="dark"
        content="新建条目"
        placement="top"
        transition=""
      >
        <el-button
          size="mini"
          icon="el-icon-link"
          circle
          @click="onCreateNewItem"
        />
      </el-tooltip>
      <el-tooltip
        class="item"
        effect="dark"
        content="新建文件夹"
        placement="top"
        transition=""
      >
        <el-button
          size="mini"
          icon="el-icon-folder-add"
          circle
          @click="new_folder"
        />
      </el-tooltip>
      <el-tooltip
        class="item"
        effect="dark"
        content="刷新"
        placement="top"
        transition=""
      >
        <el-button
          size="mini"
          icon="el-icon-refresh-right"
          circle
          @click="refreshDB"
        />
      </el-tooltip>
      <!--      <button @clck="onClearDB">Clear!</button>-->
    </div>
    <LocationBar
      :location="cur_location"
      @change="onLocationChange($event)"
    />

    <div
      id="drop_container"
      class="list_wrapper"
    >
      <FolderItem
        v-for="(i,idx) in folders"
        :key="idx"
        :folder="i"
        @edit="onEditFolder(i)"
        @dblclick.native="onFolderClick(i)"
        @deleted="onFolderDeleted(i)"
        @openFolder="openFolder(i)"
        @dropfile="onDropFileOnFolder(i,$event)"
      />
      <FileItem
        v-for="(i,idx) in files"
        :key="i.name"
        :item="i"
        @dblclick.native="onItemClick(i)"
        @openJson="openJson(i)"
        @deleted="onItemDeleted(i)"
        @edited="onItemEdited(i,$event)"
      />
      <div
        v-if="(files.length+folders.length)===0"
        style="text-align: center;font-size: xxx-large;color: lightgray"
      >
        无内容
      </div>
    </div>


    <DialogItem ref="DialogItem"/>
    <DialogFolder ref="DialogFolder"/>
    <DialogFolderNew ref="DialogFolderNew"/>
  </div>
</template>

<script>
// @ is an alias to /src
import FileItem from '@/components/FileItem.vue'
import LocationBar from '@/components/LocationBar.vue'
import FolderItem from '@/components/FolderItem.vue'
import DialogItem from '@/components/DialogItem.vue'
import DialogFolder from '@/components/DialogFolder.vue'
import DialogFolderNew from '@/components/DialogFolderNew.vue'

const {remote} = require('electron');
const {app} = remote;
const fs = require("fs")
const path = require("path")
import json_util from "../utils/json_util"
import drag_util_v2 from "../utils/drag_util"
import item_util from "../utils/item_util"
import folder_util from "../utils/folder_util"

const assert = require('assert-plus');
const {shell} = require('electron')
import moment from "moment"
import config_util from "@/utils/config_util";

const db_root = config_util.db_root

function readJson(conf_path) {
  return JSON.parse(fs.readFileSync(conf_path).toString())
}

export default {
  name: 'Home',
  components: {
    FileItem, FolderItem, DialogItem, DialogFolder, DialogFolderNew, LocationBar
  },
  data() {
    return {
      files: [],
      folders: [],
      cur_location: db_root,
    }
  },
  computed: {},
  mounted() {
    this.refresh()
    drag_util_v2.setupListener("drop_container", files => {
      this.onDrop(files, this.cur_location)
    })

  },
  beforeDestroy() {
    drag_util_v2.removeListener("drop_container")
  },
  methods: {
    onDropFileOnFolder(folder, files) {
      console.log(folder, files)
      this.onDrop(files, folder.full_path)
    },
    async onEditFolder(f) {
      await this.$refs.DialogFolder.editFolder(f)
      this.refresh()
    },
    onItemEdited(item, new_item) {
      console.log("onItemEdited", new_item)
      const idx = this.files.indexOf(item)
      this.files.splice(idx, 1, new_item)
    },
    refreshDB() {
      item_util.initMemoryDB()
      this.refresh()
    },
    async onCreateNewItem() {
      const result = await this.$refs.DialogItem.newItem(this.cur_location)
      if (result) {
        this.refresh()
      }
    },
    onFolderDeleted(i) {
      this.folders.splice(this.folders.indexOf(i), 1)
    },

    onItemDeleted(i) {
      this.files.splice(this.files.indexOf(i), 1)

    },
    onLocationChange(cur_location) {
      this.cur_location = cur_location
      this.refresh()
    },
    openFolder(i) {
      shell.openExternal("file://" + path.join(this.cur_location, i.name))
    },
    openJson(i) {
      console.log("openJson")
      shell.openExternal("file://" + path.join(this.cur_location, i.name + ".json"))
    },
    async onDrop(files, location) {
      if (files.length === 0) {
        return
      }
      console.log("获得drag的文件数量：", files.length)
      const span = item_util.getDefSpanWhenNewItem(location)

      for (const file of files) {
        const stat = fs.statSync(file.path)
        const inode = stat.ino
        const path_uri = "file://" + file.path
        const name = file.name
        //一个有效的名字
        let counter = 0
        let aim_full_path
        while (true) {
          let save_name
          if (counter === 0) {
            save_name = name + ".json"
          } else {
            save_name = `${name}(${counter}).json`
          }
          aim_full_path = path.join(location, save_name)
          if (!fs.existsSync(aim_full_path)) {//
            break
          }
          counter += 1
        }
        item_util.createNewItem(aim_full_path, path_uri, inode, span, true)
        item_util.load_item_to_db(aim_full_path)
      }
      this.$message.success(`导入:${files.length}项`)
      this.refresh()
    },
    refresh() {
      //1.得到所有文件名
      const [folders, items] = folder_util.listLocation(this.cur_location)
      this.folders = folders
      this.files = items
    },
    async new_folder() {
      if (await this.$refs.DialogFolderNew.newFolder(this.cur_location)) {
        this.refresh()
      }
    },
    onFolderClick(f) {
      this.cur_location = f.full_path
      this.refresh()
    },
    onItemClick(item) {
      //1.读取内容
      const obj = JSON.parse(fs.readFileSync(item._full_path).toString())
      item_util.open_link(obj)
    },
    onClearDB() {
      fs.rmSync(db_root, {recursive: true, force: true});
      fs.mkdirSync(db_root)
      const foder_desc_util = require("../utils/folder_desc_util")
      foder_desc_util.create_root_desc(db_root)
    },

  }
}
</script>
<style scoped>
.home {
  display: flex;
  flex-direction: column;
  padding: 1em;
}


.list_wrapper {
  flex-grow: 1;
  overflow-y: auto;
  margin: 5px;
}
</style>
