<template>
  <div
    v-if="span"
    class="wrapper"
  >
    <el-link
      v-if="!is_edit_mode"
      :value="span_str"
      @click="onEdit"
    >
      {{ span_str }}
    </el-link>
    <div
      v-else
      class="edit_wrapper"
    >
      <el-input
        v-model="span_str_for_modify"
        size="mini"
        class="the_input"
      />
      <el-button
        size="mini"
        @click="done"
      >
        确定
      </el-button>
    </div>
  </div>
</template>

<script>
import rev_util from "@/utils/rev_util";

export default {
  name: 'EditSpan',
  props: ["span"],
  data() {
    return {
      is_edit_mode: false,
      span_str_for_modify: null,

    }
  },
  computed: {
    span_str() {
      return rev_util.span2str(this.span)
    }
  },
  methods: {
    onEdit() {
      this.span_str_for_modify = this.span_str
      this.is_edit_mode = true
    },
    done() {
      const span = rev_util.str2span(this.span_str_for_modify)
      this.$emit("change", span)
      console.log("new span", span)
      this.is_edit_mode = false
    }
  }
}
</script>

<style scoped>
.wrapper {
  display: inline-block;
  /*border: 1px red solid;*/
}

.edit_wrapper {
  display: flex;
}
.the_input{
  min-width: 20em;
  margin-right: 10px;
}
</style>
