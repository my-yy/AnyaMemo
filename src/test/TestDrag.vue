<template>
  <div class="home">
    <div style="height: 3em;background-color: lightgrey">
      Haha
    </div>

    <el-rate
      :value="star"
      @change="onStarChange"
    />
  </div>
</template>

<script>
export default {
  name: 'TestDrag',
  components: {},
  data() {
    return {
      "star": 1,
    }
  },
  computed: {},
  mounted() {

  },
  beforeDestroy() {
  },
  methods: {
    onStarChange(new_value) {
      const old_value = this.star
      console.log("old:", old_value, "new:", new_value)
      if (old_value === new_value && new_value === 1) {
        this.star = 0
      } else {
        this.star = new_value
      }
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

</style>
