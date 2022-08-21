<template>
  <div id="app">
    <div v-show="!is_inited">
      载入中...
    </div>

    <div
      v-show="is_inited"
      id="nav"
      style="text-align: center"
    >
      <router-link to="/">
        数据
      </router-link>
      |
      <router-link to="/rev">
        复习
      </router-link>
      |
      <!--      <router-link to="/statistic">统计</router-link>-->
      <!--      |-->
      <router-link to="/setting">
        设置
      </router-link>
    </div>
    <router-view
      v-if="is_inited"
      style="flex-grow: 1;overflow-y: auto;"
    />
    <context_menu ref="context_menu"/>
    <DialogItem ref="DialogItem"/>
  </div>
</template>
<script>
import config_util from "@/utils/config_util";
import moment from "moment";
import context_menu from "./components/ContextMenu.vue"
import DialogItem from "./components/DialogItem.vue"

const {remote} = require('electron');
const {app} = remote;
const fs = require("fs")
const path = require("path")
import item_util from "./utils/item_util"
import rev_util from "@/utils/rev_util";
import time_util from "@/utils/time_util";

const ipcRenderer = require('electron').ipcRenderer;
const schedule = require('node-schedule');
const chokidar = require('chokidar');

function mkdir_if_necessary(no_sync_root) {
  if (!fs.existsSync(no_sync_root)) {
    fs.mkdirSync(no_sync_root, {recursive: true})
  }
}


const foder_desc_util = require("./utils/folder_desc_util")
export default {
  name: 'App',
  components: {context_menu, DialogItem},
  data() {
    return {
      is_inited: false
    }
  },
  mounted() {

    //1.创建文件夹
    mkdir_if_necessary(config_util.sync_root)
    mkdir_if_necessary(config_util.db_root)
    mkdir_if_necessary(config_util.no_sync_root)

    //2.创建默认的span
    foder_desc_util.create_root_desc(config_util.db_root)

    //3.读取内容
    item_util.initMemoryDB()
    this.is_inited = true

    const job = schedule.scheduleJob('0 9 * * *', function (planFireDate) {
      console.log("执行schedule")
      //1.检查今天是否有要复习的内容
      const need_rev = rev_util.getTodayNeedRev()
      const log_path = path.join(config_util.no_sync_root, "rev_schedule_log.txt")
      const log_text = `计划:${time_util.date2str(planFireDate)},实际:${time_util.date2str(new Date())},复习数目:${need_rev.length}\n`
      fs.appendFileSync(log_path, log_text)
      if (need_rev.length > 0) {
        new Notification("今日复习", {body: `项目数：${need_rev.length}`}).onclick = () => {
          //点击通知后的回调
          ipcRenderer.send("showWindow", "")
          this.$router.push("/rev")
        }
      }
    });
    this.shedule_job = job
  },
  beforeDestroy() {
    this.shedule_job.cancel()
  }
}
</script>


<style>
* {
  margin: 0;
  padding: 0;
}


body {
  height: 100%;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  /*border:2px red solid;*/
  height: 100vh;
  display: flex;
  flex-direction: column;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
