<template>
  <div class="home">
    <el-table
      :data="items"
      class="the_table"
    >
      <el-table-column
        prop="_show_name"
        sortable
        label="名称"
      />
      <el-table-column
        prop="_parent_short_path"
        sortable
        label="路径"
        width="100"
      />
      <el-table-column
        prop="star"
        label="星标"
        sortable
        width="100"
      />
      <el-table-column
        :formatter="formatter_created"
        label="创建日期"
        width="100"
      />
      <el-table-column
        :formatter="formatter_last_rev_date"
        label="上次复习"
        width="100"
      />
      <el-table-column
        :formatter="formatter_next_rev_date"
        label="下次复习"
        width="100"
      />
      <el-table-column
        label="操作"
        width="180"
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            @click="handleEditRow(scope.$index, scope.row)"
          >
            编辑
          </el-button>
          <el-button
            size="mini"
            @click="handleItemOpen(scope.$index, scope.row)"
          >
            打开
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import item_util from "../utils/item_util"

const {shell} = require('electron')
export default {
  name: 'Statistic',
  components: {},
  data() {
    return {
      items: []
    }
  },
  computed: {},
  mounted() {
    const items = item_util.getAllItemsFromDB()
    const tmp = []
    for (let i = 0; i < 100; i++) {
      tmp.push(items[0])
    }
    this.items = items
  },
  beforeDestroy() {
  },
  methods: {
    filterHandler(filter_value, obj, column) {
      const key = column['property'];
      console.log("filter_value", filter_value)
      return obj[key] === filter_value;
    },
    handleEditRow(row_index, item) {
      getAppInstance().$refs.DialogItem.editItem(item)
    },
    handleItemOpen(row_index, item) {
      shell.openExternal(item.link)
    },
    formatter_created(row_obj) {
      return row_obj.created_at.split(" ")[0]
    },
    formatter_is_on(row_obj) {
      return row_obj.is_on ? "√" : "x"
    },
    formatter_last_rev_date(row_obj) {
      const len = row_obj.rev_history.length
      if (len > 0) {
        return row_obj.rev_history[len - 1].done_at.split(" ")[0]
      }
      return ""
    },
    formatter_next_rev_date(row_obj) {
      if (!row_obj.is_on) {
        return "未启用"
      }

      const len = row_obj.rev_plan.length
      if (len > 0) {
        return row_obj.rev_plan[0].plan_at.split(" ")[0]
      }
      return ""
    }
  }
}
</script>
<style scoped>
.home {
  /*border: 1px black solid;*/

  display: flex;
  flex-direction: column;
  padding: 1em;
}

.the_table {
  width: 100%;
  /*border: 1px red solid;*/
  overflow: auto;
}

</style>
