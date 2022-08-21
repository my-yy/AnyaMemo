<template>
  <el-dialog
    title="设置"
    :visible.sync="dialogVisible"
    width="80%"
  >
    <el-form
      ref="form"
      label-width="10em"
    >
      <el-form-item label="名称">
        <el-input v-model="name" />
      </el-form-item>
      <el-form-item label="独立的复习间隔">
        <el-switch v-model="use_span" />
      </el-form-item>

      <el-form-item
        v-show="use_span"
        label="复习间隔"
      >
        <el-input v-model="span_str" />
      </el-form-item>
    </el-form>
    <div style="text-align: center">
      <el-button @click="onUpdateFolder">
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
import folder_desc_util from "@/utils/folder_desc_util";

const path = require("path")
const fs = require("fs")
const assert = require('assert-plus');

export default {
  name: 'DialogFolder',
  data() {
    return {
      dialogVisible: false,
      name: null,
      use_span: false,
      span_str: null,
      location: null,
    }
  },
  methods: {
    editFolder(folder) {
      return new Promise((resolve, reject) => {
        this.resolve = resolve
        this.dialogVisible = true
        //信息..
        this.cache_folder = folder
        this.name = folder.name
        this.location = path.dirname(folder.full_path)
        this.use_span = !!folder.use_span
        if (this.use_span) {
          this.span_str = folder.span.join(",")
        } else {
          this.span_str = "1,3,7,11"
        }

      })
    },
    onUpdateFolder() {
      //1.名称合法性
      const name = this.name.trim()
      if (!filename_util.isValid(name)) {
        this.$message.error('名称不合法');
        return;
      }

      //2.判断文件名是否发生更改
      const old_name = this.cache_folder.name
      const new_name = name
      if (old_name !== new_name) {//文件夹名称发生变化
        //1.判断文件夹名是否重复
        const new_path = path.join(this.location, new_name)
        if (fs.existsSync(new_path)) {
          this.$message.error("文件夹名称重复")
          return
        }

        //2.进行磁盘文件修改
        const old_path = this.cache_folder.full_path
        fs.renameSync(old_path, new_path)
        console.log(`文件夹名称更改:${old_path}==>${new_path}`)

        //3.更新数据库记录,通过在路径后补充一个/号 以防止替换出错
        const db = item_util.getDB()
        let old_path_with_slash = old_path + "/"
        let new_path_with_slash = new_path + "/"
        const keys = Object.keys(db).filter(p => p.startsWith(old_path_with_slash))
        for (const old_key of keys) {
          const new_key = old_key.replace(old_path_with_slash, new_path_with_slash)
          const obj = db[old_key]
          delete db[old_key]
          db[new_key] = obj
          console.log(`更新数据库路径信息:${old_key}==>${new_key}`)
        }
      }
      const folder_path = path.join(this.location, name)


      //3.检查span的设置
      if (this.use_span) {
        const arr = rev_util.str2span(this.span_str)
        folder_desc_util.createFolderDescription(folder_path, arr)
      } else {
        folder_desc_util.removeFolderDesc(folder_path)
      }
      //2.返回
      this.resolve(true)//需要更新
      this.resolve = null
      this.dialogVisible = false
      this.cache_folder = null
    },


  }
}
</script>
<style scoped>

</style>
