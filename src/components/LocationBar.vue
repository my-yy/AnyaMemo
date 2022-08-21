<template>
  <div
    v-if="location"
    class="location_bar"
  >
    <i
      class="el-icon-s-home home_btn"
      @click="jumpToFolder(0)"
      @contextmenu.prevent="onRightClick($event,0)"
    />
    <span
      v-for="(f,index) in show_paths"
      @click="jumpToFolder(index)"
      @contextmenu.prevent="onRightClick($event,index)"
    >
      {{ f }}/
    </span>
  </div>
</template>

<script>
import rev_util from "@/utils/rev_util";
import config_util from "@/utils/config_util";

const db_root = config_util.db_root
const {shell} = require('electron')
const path = require('path')
export default {
  name: 'LocationBar',
  props: ["location"],
  data() {
    return {}
  },
  computed: {
    show_paths() {
      let part = this.location.substring(db_root.length, this.location.length)
      //空字符串，或者 /
      if (!part.startsWith("/")) {
        part = "/" + part
      }
      //以/开头
      let arr = []
      const key = ""
      if (part === "/") {
        arr = [key]
      } else {
        arr = part.split("/")
        arr[0] = key
      }
      return arr
    },

  },
  methods: {
    jumpToFolder(index) {
      const new_location = this.getPathByIndex(index)
      this.$emit("change", new_location)
    },
    getPathByIndex(index) {
      const subarr = JSON.parse(JSON.stringify(this.show_paths.slice(0, index + 1)))
      subarr[0] = ""
      const folder_path = subarr.join("/")
      const aim = path.join(db_root, folder_path)
      return aim
    },
    async onRightClick(event, index) {
      const options = [
        {
          icon: require("../assets/icon_finder.png"),
          name: "在Finder中打开",
          id: "open_folder"
        },
      ]

      const dom = event.target
      // console.error("event", event)
      console.log("dom", dom)
      const ans = await showMenu(event, options, dom, false)
      if (ans < 0) {
        return
      }
      const the_id = options[ans].id
      if (the_id === "open_folder") {
        const new_location = this.getPathByIndex(index)
        shell.openExternal("file://" + new_location)
      }


    }
  }
}
</script>

<style scoped>
.home_btn {
  cursor: pointer;
}

.home_btn:hover {
  color: green;
}


.location_bar > span {
  cursor: pointer;
}

.location_bar > span:hover {
  color: green;
}
</style>
