<template>
  <el-dialog
    title="新建文件夹"
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
      <el-button @click="onCreateNewFolder">
        完 成
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import rev_util from "@/utils/rev_util";
import filename_util from "@/utils/filename_util";
import folder_desc_util from "@/utils/folder_desc_util";

const path = require("path")
const fs = require("fs")
const assert = require('assert-plus');

export default {
  name: 'DialogFolderNew',
  data() {
    return {
      dialogVisible: false,
      name: "文件夹1",
      use_span: false,
      span_str: "1,3,7,11",
      location: null,
    }
  },
  methods: {
    newFolder(location) {
      return new Promise((resolve, reject) => {
        this.resolve = resolve
        assert.ok(fs.existsSync(location))
        this.location = location
        this.dialogVisible = true
      })
    },
    onCreateNewFolder() {
      //1.是否能作为文件名
      const name = this.name.trim()
      if (!filename_util.isValid(name)) {
        this.$message.error('名称不合法');
        return;
      }
      //2.是否重复
      const folder_path = path.join(this.location, name)
      if (fs.existsSync(folder_path)) {
        this.$message.error("文件夹名称重复")
        return
      }
      //3.创建文件夹
      fs.mkdirSync(folder_path)

      //4.判断
      if (this.use_span) {
        const span_arr = rev_util.str2span(this.span_str)
        folder_desc_util.createFolderDescription(folder_path, span_arr)
      }

      this.dialogVisible = false
      this.resolve(true)
      this.resolve = null
    },
  }
}
</script>
<style scoped>
</style>
