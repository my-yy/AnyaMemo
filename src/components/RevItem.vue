<template>
  <div
    v-if="item"
    ref="full_item"
    class="item"
    @contextmenu.prevent="onRightClick"
  >
    <div>
      <input
        v-model="item.done"
        type="checkbox"
        style="margin-right: 10px"
        @change="onDoneStateChanged"
      >
    </div>
    <div
      class="mid_part"
      @click="onNameClick"
    >
      <div class="title">
        <span
          class="name"
          :class="{done:item.done}"
        >{{ item.name }}</span>
      </div>
      <!--      <div class="desc">{{ formatYMD(item.date) }}；始于:{{ item.db_item.begin_at.split(" ")[0] }}</div>-->
    </div>
  </div>
</template>

<script>
import moment from "moment";
import time_util from "@/utils/time_util";
import item_util from "@/utils/item_util";
import json_util from "@/utils/json_util";
import ui_item from "@/utils/ui_item";

const {shell} = require('electron')

const assert = require('assert-plus');
export default {
  name: 'Item',
  props: ["item"],
  data() {
    return {
      dialogVisible: false,
    }
  },
  methods: {
    formatYMD(date) {
      return time_util.getDateDesc(time_util.str2date(date))
    },
    async onNameClick() {
      //1.打开
      item_util.open_link(this.item.db_item)

      // 2.自动标记为已阅
      if (this.item.done) {
        return
      }
      this.item.done = true
      this.onDoneStateChanged()
    },
    async onDoneStateChanged() {
      const done = this.item.done
      const db_item = this.item.db_item
      if (done) {
        //1.生成记录
        const history_log = {
          plan_at: this.item.date,
          done_at: time_util.date2str(new Date()),
        }
        //2.插入历史
        db_item.rev_history.push(history_log)

        //3.删除rev_plan
        let idx = db_item.rev_plan.indexOf(this.item.plan_obj)
        assert.ok(idx >= 0)
        db_item.rev_plan.splice(idx, 1)
      } else {
        //历史中移除
        const latest_history = db_item.rev_history[db_item.rev_history.length - 1]
        db_item.rev_history.pop()
        //加入到待复习中去
        db_item.rev_plan.unshift(this.item.plan_obj)
      }
      item_util.writeItemToDisk(db_item, this.item.full_path)
    },
    onRightClick(event) {
      ui_item.onRightClick(event, this.$refs.full_item, this.item.db_item, this)
    }
  }
}
</script>

<style scoped>
.item {
  margin: 10px;
  /*cursor: default;*/
  font-size: large;
  display: flex;
  flex-direction: row;
}


.mid_part {
  flex-grow: 1;
  /*border: 1px red solid;*/
}

.mid_part:hover {
  background-color: lightgray;
}


.title:hover {
  /*text-decoration: underline;*/
}

.desc {
  color: gray;
  /*font-size: small;*/
}


.name {
  cursor: pointer;
}

.name.done {
  color: gray;
  text-decoration: line-through;
}

</style>
