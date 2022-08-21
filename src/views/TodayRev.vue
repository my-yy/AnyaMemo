<template>
  <div class="rev_wrapper">
    <div style="text-align: right">
      <el-tooltip
        class="item"
        effect="dark"
        content="历史记录"
        placement="top"
        transition=""
      >
        <el-button
          size="mini"
          icon="el-icon-document-checked"
          circle
          @click="showHistory"
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
    </div>


    <div
      v-if="items.length===0"
      class="no_content"
    >
      无复习项目
    </div>

    <div v-for="pack in day2items_arr">
      <div class="day_desc">
        {{ pack.day_desc }}
      </div>
      <RevItem
        v-for="i in pack.items"
        :item="i"
        @deleted="onItemDelete(i)"
      />
    </div>

    <el-dialog
      title="历史记录"
      :visible.sync="dialogVisible"
      width="90%"
    >
      <div
        v-if="revHistoryResult.length===0"
        style="text-align: center"
      >
        无内容
      </div>

      <div
        v-for="group_obj in revHistoryResult"
        class="rev_group"
      >
        <div class="rev_date_title">
          {{ group_obj.diff_str }}
        </div>
        <el-link
          v-for="obj in group_obj.items"
          class="history_rev_item"
          @click="openItem(obj)"
        >
          {{ obj._show_name }}
        </el-link>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import json_util from "@/utils/json_util";
import item_util from "@/utils/item_util";
import time_util from "@/utils/time_util";
import moment from "moment";
import config_util from "@/utils/config_util";
import RevItem from "@/components/RevItem";
import rev_util from "@/utils/rev_util";


const fs = require("fs")
const path = require("path")


export default {
  name: 'Rev',
  components: {RevItem},
  data() {
    return {
      items: [],
      day2items_arr: null,
      dialogVisible: false,
      revHistoryResult: []
    }
  },
  mounted() {
    this.refreshRev()
  },
  methods: {
    showHistory() {
      this.revHistoryResult = rev_util.getHistory(3)
      this.dialogVisible = true

    },
    refreshDB() {
      item_util.initMemoryDB()
      this.refreshRev()
    },
    refreshRev() {
      const need_rev = rev_util.getTodayNeedRev()
      console.log("需要复习：", need_rev.length)
      //2.根据时间进行排序
      const sorted_need_rev = need_rev.sort((a, b) => a.diff - b.diff);
      this.items = sorted_need_rev

      //3.根据时间进行分组
      const day2items = {}
      for (const obj of sorted_need_rev) {
        const key = obj.diff
        const arr = day2items[key] || []
        arr.push(obj)
        day2items[key] = arr
      }

      let keys = new Set(sorted_need_rev.map(obj => obj.diff))
      keys = Array.from(keys)
      keys.sort()

      function getDateDesc(d) {
        if (d === 0) {
          return "今日"
        }
        return -d + "天前"
      }

      const day2items_arr = []
      keys.forEach(key => {
        day2items_arr.push({
          "day": key,
          "day_desc": getDateDesc(key),
          "items": day2items[key]
        })
      })
      day2items_arr.sort((a, b) => a.day - b.day)

      this.day2items_arr = day2items_arr
      console.log("day2items_arr", day2items_arr)
    },
    openItem(obj) {
      item_util.open_link(obj)
    },
    onItemDelete(item) {
      console.log("onItemDelete", item)
      for (const pack of this.day2items_arr) {
        const items = pack.items
        for (let i = items.length - 1; i >= 0; i--) {//倒顺遍历
          const cur = items[i]
          if (cur === item) {//去除
            items.splice(i, 1)
          }
        }
      }
    }

  }
}
</script>
<style scoped>
.rev_wrapper {
  padding: 1em;
}

.rev_item {
  color: red;
  border: 1px lightgray solid;
}

.no_content {
  text-align: center;
  font-size: xxx-large;
  color: lightgray
}

.day_desc {
  text-align: center;
  font-weight: bold;
  border-bottom: 1px lightgray solid;
}

.rev_group {
  margin-bottom: 2em;
}

.rev_date_title {
  text-align: center;
  font-weight: bold;
}

.history_rev_item {
  margin-bottom: 10px;
}

</style>
