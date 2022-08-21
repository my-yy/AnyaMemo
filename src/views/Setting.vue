<template>
  <div class="the_wrapper">

    <div class="setting_line">
      <span>全局默认复习间隔：</span>
      <EditSpan
        :span="global_span"
        @change="onChangeSpan"
      />
    </div>
    <div class="setting_line" v-show="is_development">
      <el-link @click="doBackup">备份数据库</el-link>
    </div>

    <div class="bottom_bar">
      <span style="margin-right: 5px">版本:{{ version }}</span>
      <el-link @click="openHomePage">
        主页
      </el-link>
    </div>
  </div>
</template>
<script>
import pkg from "../../package.json"
import path from "path";
import config_util from "@/utils/config_util";
import json_util from "@/utils/json_util";
import zip_util from "@/utils/zip_util";
import EditSpan from "@/components/EditSpan";

const {shell} = require('electron')

const root_db_folder_conf = path.join(config_util.db_root, ".folder_description.json")

export default {
  name: 'Setting',
  components: {EditSpan},
  data() {
    return {
      version: pkg.version,
      global_span: [],
      is_development: process.env.NODE_ENV !== 'production'
    }
  },
  mounted() {
    //1.读取全局配置文件
    this.load()

  },
  methods: {
    load() {
      const root_conf = json_util.readJson(root_db_folder_conf)
      this.global_span = root_conf.span
    },
    onChangeSpan(span) {
      const root_conf = json_util.readJson(root_db_folder_conf)
      root_conf.span = span
      json_util.writeJson(root_db_folder_conf, root_conf)
      this.dialogVisible = false
      this.load()
    },
    async doBackup() {
      await zip_util.backupDB()
      shell.openExternal('file://' + config_util.sync_root)
    },
    openHomePage() {
      shell.openExternal("https://www.huacishu.com/2022/08/21/anya_memo/")
    }
  }
}
</script>
<style scoped>
.the_wrapper {
  text-align: center;
}

.bottom_bar {
  position: fixed;
  bottom: 10px;
  left: 0;
  right: 0;
  /*text-align: center;*/
  font-size: small;
  display: flex;
  justify-content: center;
  align-items: center;
}

.setting_line {
  margin-top: 1em;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
