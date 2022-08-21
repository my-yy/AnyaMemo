<template>
  <div
    v-if="item"
    ref="full_item"
    class="item"
    @contextmenu.prevent="onRightClick"
  >
    <div class="title">
      <span
        class="name"
        @click="onNameClick"
      >{{ item._show_name }}</span>
    </div>
    <div class="desc">
      <span>{{ nextRevDate(item) }}</span>
      <!--      <span style="flex-grow: 1"></span>-->
      <!--      <el-rate :value="item.star" @change="onStarChange"></el-rate>-->
    </div>
  </div>
</template>

<script>
import moment from "moment";
import time_util from "@/utils/time_util";
import json_util from "@/utils/json_util";
import item_util from "@/utils/item_util";
import ui_item from "@/utils/ui_item";

const {shell} = require('electron')
const assert = require('assert-plus');
const fs = require('fs');
export default {
  name: 'FileItem',
  props: ["item"],
  data() {
    return {}
  },
  methods: {
    onStarChange(new_value) {
      const old_value = this.item.star
      let set_value = null
      console.log("old:", old_value, "new:", new_value)
      if (old_value === new_value && new_value === 1) {
        set_value = 0
      } else {
        set_value = new_value
      }

      this.item.star = set_value
      item_util.writeItemToDisk(this.item, this.item._full_path)

    },
    nextRevDate(item) {
      if (!item.is_on) {
        return "未启用复习"
      }

      if (item.rev_plan.length === 0) {
        return "无复习计划"
      }
      const date = item.rev_plan[0].plan_at
      return "下次复习：" + time_util.getDateDesc(date)
    },
    async onNameClick() {

    },
    onRightClick(event) {
      ui_item.onRightClick(event, this.$refs.full_item, this.item, this)
    }

  }
}
</script>

<style scoped>
.item {
  cursor: default;
  margin-top: 5px;
  border: 1px white solid;
  border-bottom: 1px lightgrey solid;
  user-select: none; /* 使得无法选中文字 */

}

.desc {
  color: gray;
  font-size: small;
  display: flex;
}


/*.item:hover {*/
/*  background-color: lightgray;*/
/*}*/


</style>
