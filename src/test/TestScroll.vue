<template>
  <div class="home">
    Router-View
    <div style="background-color: lightgray">
      TopBar
    </div>
    <div class="mid_part">
      <div v-for="i in 4">
        {{ i }}
      </div>
    </div>
    <div style="background-color: lightgray">
      BottomBar
    </div>
  </div>
</template>

<script>

export default {
  name: 'Home',
  components: {},
  data() {
    return {}
  },
  computed: {},
  mounted() {

  },
  methods: {}
}
</script>
<style scoped>
.home {
  /*border: 4px green dotted;*/
  overflow: auto;
  flex-grow: 1;

  display: flex;
  flex-direction: column;
}

.mid_part {
  flex-grow: 1;
  overflow-y: scroll;
}


</style>
