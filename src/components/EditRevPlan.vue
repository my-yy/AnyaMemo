<template>
  <div
    v-if="item"
    class="rev_plan_wrapper"
  >
    <el-link
      v-if="!is_edit_mode"
      @click="onEditPlan"
    >
      {{ rev_plan_str }}
    </el-link>
    <div
      v-else
      class="edit_input"
    >
      <el-input
        v-model="date_str"
        class="the_input"
        size="mini"
      />
      <el-button
        size="mini"
        @click="done()"
      >
        完成
      </el-button>
    </div>
  </div>
</template>

<script>
import time_util from "@/utils/time_util";
import rev_util from "@/utils/rev_util";
import item_util from "@/utils/item_util"

export default {
  name: 'EditRevPlan',
  props: ["item"],
  data() {
    return {
      is_edit_mode: false,
      date_str: null,
    }
  },
  computed: {
    rev_plan_str() {
      const arr = this.item.rev_plan.map(obj => obj.plan_at.split(" ")[0])
      if (arr.length === 0) {
        return "无计划"
      }

      const txt = arr.join(" ")
      return txt
    }
  },
  watch: {
    item: {
      immediate: true,
      handler(new_v, old_v) {
        console.log("item change")
        this.is_edit_mode = false
      }
    },
  },
  methods: {
    onEditPlan() {
      const plans = this.item.rev_plan
      //1.计算距今的日期
      let last_date = new Date() //从今日开始统计
      const number_arr = []
      for (const obj of plans) {
        console.log("date_str", obj.plan_at)
        const plan_date = time_util.str2date(obj.plan_at)
        const number = time_util.getDayDiff_tz(plan_date, last_date)
        number_arr.push(number)
        last_date = plan_date
      }
      this.date_str = number_arr.join(",")
      this.is_edit_mode = true
    },
    done() {
      const span = rev_util.str2span(this.date_str);
      const rev_plans = item_util.create_plan_array(span)
      this.item.rev_plan = rev_plans
      this.is_edit_mode = false
    }

  }
}
</script>

<style scoped>

.rev_plan_wrapper {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}

.rev_plan_wrapper > div {
  margin: 3px;
}

.edit_input {
  width: 100%;
  display: flex;
  /*border: 1px red solid;*/
}

.edit_input .the_input {
  flex-grow: 1;
  margin-right: 10px;
}
</style>
