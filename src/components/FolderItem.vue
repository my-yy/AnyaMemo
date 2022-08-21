<template>
  <div
    v-if="folder"
    ref="folder_item"
    class="folder_item"
    @contextmenu.prevent="onRightClick"
  >
    <img
      src="../assets/icon_folder_48.png"
      class="folder_icon"
    >

    {{ folder.name }}
    <span
      v-if="folder.span"
      class="rev_span"
    >（间隔：{{ folder.span.join(",") }}）</span>
  </div>
</template>

<script>
import moment from "moment";
import time_util from "@/utils/time_util";
import json_util from "@/utils/json_util";

const fs = require('fs');
const assert = require('assert-plus');
export default {
  name: 'FolderItem',
  props: ["folder"],
  data() {
    return {
      dialogVisible: false,
    }
  },
  beforeDestroy() {
    const holder = this.$refs.folder_item
    holder.ondragover = null
    holder.ondragleave = null
    holder.ondragend = null
    holder.ondrop = null

  },
  mounted() {
    const holder = this.$refs.folder_item

    holder.ondragenter = (event) => {
      event.preventDefault() //允许drop
    }

    holder.ondragover = (event) => {
      event.preventDefault()
      holder.style.outline = "2px skyblue solid"
    };

    holder.ondrop = (event) => {
      console.log("folder ondrop")
      event.preventDefault()//阻止浏览器对默认drop事件的处理
      holder.style.outline = "none"
      this.$emit("dropfile", event.dataTransfer.files)
    };

    holder.ondragleave = (event) => {
      holder.style.outline = "none"
    };

  },
  methods: {
    async onNameClick() {

    },
    async onRightClick(event) {
      const options = [
        {
          icon: require("../assets/icon_setting.png"),
          name: "设置"
        },
        // {
        //   icon: require("../assets/icon_finder.png"),
        //   name: "用Finder打开"
        // },
        {
          icon: require("../assets/icon_trash.png"),
          name: "删除"
        },

      ]


      let ans = await showMenu(event, options, this.$refs.folder_item)
      if (ans === 0) {
        //编辑
        this.$emit("edit")

      } else if (ans === 1) {
        this.$emit("openFolder")
      } else if (ans === 2) {
        try {
          await this.$confirm('此操作将永久删除该文件夹, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
        } catch (e) {
          return
        }
        //1.文件删除
        console.log(this.folder)
        fs.rmdirSync(this.folder.full_path, {recursive: true, force: true})
        this.$emit("deleted")

      }
    }

  }
}
</script>

<style scoped>
.folder_item {
  border: 1px white solid;
  border-bottom: 1px lightgrey solid;
  cursor: default;
  margin: 2px;
  user-select: none; /* 使得无法选中文字 */
  display: flex;
  align-items: center;
}

.folder_icon {
  width: 30px;
  margin-right: 5px;
}

/*.folder_item:hover {*/
/*  background-color: lightgray;*/
/*}*/

.rev_span {
  color: gray;
}

</style>
