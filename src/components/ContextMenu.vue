<template>
  <div
    v-if="showing"
    class="wrapper"
    @click="cancel"
  >
    <ul
      ref="menu"
      class="tooltip"
      :style="menu_style"
    >
      <li
        v-for="(obj,idx) in options"
        :id="'menu_'+idx"
        class="menu_item"
        @click.stop="onChoose(idx)"
      >
        <img
          v-if="obj.icon"
          :src="obj.icon"
          style="height: 1em;margin-right: 2px"
        >
        {{ obj.name }}
      </li>
    </ul>
  </div>
</template>

<script>

export default {
  name: 'ContextMenu',
  data() {
    return {
      showing: false,
      menu_style: {
        left: "-1000px",
        top: "-1000px",
        display: "block",
      },
      options: [],
      resolve: null
    }
  },
  computed: {},
  methods: {
    onChoose(id) {
      this.clearborder()
      // console.log("onChoose", id)
      this.showing = false;
      this.resolve(id)
      this.resolve = null
    },

    show(...args) {
      return new Promise((resolve, reject) => {
        this.resolve = resolve
        this.showCore(...args)
      })
    },

    showCore(event, options, dom_target, highlight = true) {
      let x = event.clientX;
      let y = event.clientY;

      const dom = dom_target
      if (dom && highlight) {
        this.dom = dom
        this.dom_style_border = dom.style.border
        this.dom.style.border = '1px blue solid';
      }

      this.highlight = highlight
      this.options = options
      this.menu_style.left = x + "px";
      this.menu_style.top = y + "px";
      this.showing = true;
    },
    cancel() {
      this.clearborder()
      // console.log("cancel")
      this.showing = false;
      this.resolve(-1)//表示点了取消
      this.resolve = null
    },
    clearborder() {
      if (this.dom && this.highlight) {
        this.dom.style.border = this.dom_style_border
        this.dom = null
      }

    }
  }
}
</script>

<style scoped>


/** {*/
/*border: 1px red dotted;*/
/*}*/

.wrapper {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  /*height: 100%;*/
  /*background-color: grey;*/
  z-index: 2147483647;
}

.tooltip {
  /*border: 1px red solid;*/
  cursor: default;
  position: fixed;
  color: black;
  min-width: 5em;
  list-style-type: none;
  padding: 3px 3px 3px 3px;
  border-radius: 3px;
  box-shadow: 0 4px 8px grey;
  background-color: white;
}

.tooltip li {
  padding-right: 1em;
}

.tooltip li:hover {
  color: white;
  background-color: rgb(19, 116, 241);
}

.tooltip li:before {
  color: transparent;
  content: "●";
}

.tooltip li.checked:before {
  color: black;
}

.menu_item {
  display: flex;
  flex-direction: row;
  align-items: center;
}


</style>
