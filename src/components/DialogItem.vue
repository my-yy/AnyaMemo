<template>
  <el-dialog
    v-if="item"
    :visible.sync="dialogVisible"
    :title="isEditMode?'设置':'新建'"
    width="95%"
  >
    <div class="setting_wrapper">
      <div class="line">
        <div class="label">
          名称
        </div>
        <el-input
          v-model="item._show_name"
          type="textarea"
          autosize
          resize="none"
        />
        <el-tooltip
          class="item"
          effect="dark"
          content="读取剪贴板"
          placement="top"
          transition=""
        >
          <el-button
            size="mini"
            style="margin-left: 10px"
            @click="readFromClipboard"
          >
            <img
              src="../assets/icon_paste3.png"
              style="height: 1em"
            >
          </el-button>
        </el-tooltip>
      </div>
      <div class="line">
        <div class="label">
          链接
        </div>
        <el-input
          v-model="item.link"
          :disabled="!!item.inode"
          type="textarea"
          autosize
          resize="none"
        />
      </div>
      <div class="line">
        <div class="label">
          启用复习
        </div>
        <el-switch v-model="item.is_on" />
      </div>
      <div
        v-if="!isEditMode"
        class="line"
      >
        <div>复习间隔</div>
        <el-input v-model="item._span_str" />
      </div>

      <div v-if="isEditMode && item.is_on">
        <div class="label">
          复习计划
        </div>
        <EditRevPlan :item="item" />
      </div>
      <div v-if="isEditMode&& item.rev_history.length>0">
        <div class="label">
          复习记录
        </div>
        <div class="rev_history_wrapper">
          <div
            v-for="p in item.rev_history"
            class="rev_history_item"
          >
            {{ p.plan_at.split(" ")[0] }}
          </div>
        </div>
      </div>
    </div>
    <div class="bottom_bar">
      <div class="json_btn">
        <el-tooltip
          class="item"
          effect="dark"
          content="打开JSON文件"
          placement="top"
          transition=""
        >
          <el-button
            v-show="isEditMode"
            size="mini"
            round
            @click="openJson"
          >
            <img
              src="../assets/icon_json.png"
              style="height: 1em"
            >
          </el-button>
        </el-tooltip>
      </div>
      <el-button @click="onSave">
        完 成
      </el-button>
    </div>
  </el-dialog>
</template>

<script>

import json_util from "@/utils/json_util";
import config_util from "@/utils/config_util";
import rev_util from "@/utils/rev_util";
import filename_util from "@/utils/filename_util";
import item_util from "@/utils/item_util";
import clipboard_util from "@/utils/clipboard_util";
import EditRevPlan from "@/components/EditRevPlan";
import path from "path"
import fs from "fs"

const assert = require('assert-plus');
const {shell} = require('electron')
export default {
  name: 'DialogItem',
  components: {EditRevPlan},
  data() {
    return {
      item: {},
      isEditMode: false,
      dialogVisible: false,
    }
  },
  computed: {},
  methods: {
    newItem(cur_location) {
      return new Promise((resolve, reject) => {
        this.resolve = resolve
        this.isEditMode = false
        const span = item_util.getDefSpanWhenNewItem(cur_location)
        assert.ok(!!span)
        this.item = {
          _show_name: "",
          link: "",
          is_on: true,
          _parent_path: cur_location,
          span: span,
          _span_str: span.join(",")
        }
        this.dialogVisible = true

      })
    },
    editItem(item) {
      return new Promise((resolve, reject) => {
        this.resolve = resolve
        this.isEditMode = true
        this.item = JSON.parse(JSON.stringify(item))
        this.cache_item = item
        this.dialogVisible = true
      })
    },
    onSaveNew() {
      const name = this.item._show_name
      const link = this.item.link.trim()
      const is_on = this.item.is_on
      const span = rev_util.str2span(this.item._span_str);
      const cur_location = this.item._parent_path
      const item_path = path.join(cur_location, name + ".json")
      item_util.createNewItem(item_path, link, null, span, is_on)
      item_util.load_item_to_db(item_path)
      this.$message.success('已创建');
      this.dialogVisible = false
      this.resolve(true)
      this.resolve = null
    },
    onSaveEdit() {
      const name = this.item._show_name.trim()
      const cache_name = this.cache_item._show_name
      const db = item_util.getDB()
      if (name !== cache_name) {
        const old_path = this.item._full_path
        console.log(`文件名变更:${cache_name}==>${name}`)
        console.log("delete file:", old_path)
        assert.ok(fs.existsSync(old_path))
        fs.rmSync(old_path)
        delete db[old_path]
      }
      const cur_location = this.item._parent_path
      const item_path = path.join(cur_location, name + ".json")
      item_util.writeItemToDisk(this.item, item_path)
      const load_item = item_util.load_item_file(item_path)
      db[item_path] = load_item
      console.log("更新:", item_path, load_item)
      this.dialogVisible = false
      this.$message.success('已更新');
      this.resolve(load_item)
      this.resolve = null
    },
    onSave() {
      const name = this.item._show_name.trim()
      const cur_location = this.item._parent_path

      //名称语法检查，是否可作为文件名
      if (!filename_util.isValid(name)) {
        this.$message.error('名称不合法');
        return;
      }

      if (this.isEditMode) {
        this.onSaveEdit()
        return;
      }
      //新建模式
      const item_path = path.join(cur_location, name + ".json")
      if (fs.existsSync(item_path)) {
        this.$message.error('文件名已重复');
        return;
      }
      this.onSaveNew()
    },


    readFromClipboard() {
      const [name, link] = clipboard_util.detect_link()
      console.log(name, link)
      this.item._show_name = name
      this.item.link = link
    },
    openJson() {
      shell.openExternal("file://" + this.item._full_path)
    }

  }
}
</script>

<style scoped>

.line {
  display: flex;
  flex-direction: row;
  /*border: 1px red solid;*/
  align-items: center;
}

.label {
  /*color: red;*/
  margin-right: 5px;
  min-width: 4em;
  font-weight: bold;
}

.rev_history_wrapper {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}

.rev_history_item {
  margin: 3px;
}


.setting_wrapper > div {
  margin: 10px;
}

.bottom_bar {
  text-align: center;
  position: relative;
}

.json_btn {
  position: absolute;
  left: 10px;

}

</style>
