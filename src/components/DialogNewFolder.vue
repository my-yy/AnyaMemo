<template>
  <el-dialog
    :title="isEditMode?'设置':'创建文件夹'"
    :visible.sync="dialogVisible"
    width="80%"
  >
    <el-form
      ref="form"
      label-width="10em"
    >
      <el-form-item label="名称">
        <el-input v-model="folder.name" />
      </el-form-item>
      <el-form-item label="独立的复习间隔">
        <el-switch v-model="folder.use_span" />
      </el-form-item>

      <el-form-item
        v-show="folder.use_span"
        label="复习间隔"
      >
        <el-input v-model="folder.span_str" />
      </el-form-item>
    </el-form>
    <div style="text-align: center">
      <el-button @click="onSave">
        完 成
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import item_util from "@/utils/item_util";
import json_util from "@/utils/json_util";
import rev_util from "@/utils/rev_util";
import filename_util from "@/utils/filename_util";

const path = require("path")
const fs = require("fs")
const assert = require('assert-plus');

export default {
  name: 'DialogFolder',
  props: {
    msg: String
  },
  data() {
    return {
      dialogVisible: false,
      folder: {},
      isEditMode: false,
    }
  },
  methods: {
    newFolder(location) {
      return new Promise((resolve, reject) => {
        this.resolve = resolve
        assert.ok(fs.existsSync(location))
        const root_conf = json_util.getRootConf()
        this.isEditMode = false

        this.folder = {
          name: "未命名文件夹",
          use_span: false,
          span_str: root_conf.span.join(","),
          def_rev_mode: "预设间隔",
          _location: location,//仅是用来暂存的，只在创建时会用到
        }
        this.dialogVisible = true
      })
    },
    editFolder(folder) {
      return new Promise((resolve, reject) => {
        this.resolve = resolve
        this.isEditMode = true
        this.folder = JSON.parse(JSON.stringify(folder))
        if (this.folder.use_span) {
          this.folder.span_str = this.folder.span.join(",")
        }


        this.cache_folder = folder
        this.dialogVisible = true
      })
    },


    onSave() {
      const name = this.folder.name.trim()
      if (!filename_util.isValid(name)) {
        this.$message.error('名称不合法');
        return;
      }

      if (this.isEditMode) {
        this.onUpdateFolder()
      } else {
        this.onCreateNewFolder()
      }
    },
    onCreateNewFolder() {
      const folder_path = path.join(this.folder._location, this.folder.name.trim())
      if (fs.existsSync(folder_path)) {
        this.$message.error("文件夹名称重复")
        return
      }
      fs.mkdirSync(folder_path)

      this.setOrRemoveFolderDescription(this.folder.use_span)

      this.dialogVisible = false
      this.resolve(true)
      this.resolve = null
    },

    setOrRemoveFolderDescription(use_span, folder_full_path) {
      const desc_path = path.join(folder_full_path, ".folder_description.json")

      if (!use_span) {
        if (fs.existsSync(desc_path)) {
          fs.rmSync(desc_path)
          console.log("delete folder_description:", desc_path)
        }
        return
      }

      const span = rev_util.str2span(this.folder.span_str);
      const obj = {
        span: span,
      }
      fs.writeFileSync(desc_path, JSON.stringify(obj, null, 2))
      console.log("save folder_description", obj)
    },
    onUpdateFolder() {
      const parent_folder = path.dirname(this.folder.full_path)
      require('assert').ok(!!parent_folder)

      //1.判断文件名是否发生更改
      const old_name = this.cache_folder.name
      const new_name = this.folder.name
      const name_change = old_name !== new_name
      if (name_change) {//重命名文件夹
        //判断文件名是否重复
        const new_path = path.join(parent_folder, new_name) + "/"
        if (fs.existsSync(new_path)) {
          this.$message.error("文件夹名称重复")
          return
        }

        //增加结尾符，以防止更新数据库时出错
        const old_path = path.join(parent_folder, old_name) + "/"
        console.log(`文件夹名称更改:${old_path}==>${new_path}`)
        fs.renameSync(old_path, new_path)

        //2.更新数据库记录
        const db = item_util.getDB()
        const keys = Object.keys(db).filter(p => p.startsWith(old_path))
        for (const old_key of keys) {
          const new_key = old_key.replace(old_path, new_path)
          const obj = db[old_key]
          delete db[old_key]
          db[new_key] = obj
          console.log(`更新数据库:${old_key}==>${new_key}`)
        }
      }
      //2.检查span的设置
      this.setOrRemoveFolderDescription(this.folder.use_span, this.folder.full_path)

      //2.返回
      this.resolve(true)//需要更新
      this.resolve = null
      this.dialogVisible = false
      this.cache_folder = null
    },


  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>
