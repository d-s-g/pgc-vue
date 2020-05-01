<template>
  <div class="col-sm-6">
      <div class="col-sm-6 studio-choice" @click="getBookingPane" :style='{ backgroundImage: `url(${studio.field_studio_image})` }'>
        <div class="studio-description" v-html="studio.description">{{ studio.description }}</div>
        <div class="studio-title" v-html="studio.name">{{ studio.name }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "studio-card",
  props: ["studio"],
  methods: {
    getBookingPane() {
      this.setCurrentStudio(this.studio);
      this.showStudios(false);
      this.showBooking(true);
    },
    showStudios(bool) {
      return this.$store.commit("SHOW_STUDIOS", bool);
    },
    showBooking(bool) {
      return this.$store.commit("SHOW_BOOKING", bool);
    },
    setCurrentStudio(studio) {
      this.$store.commit("SET_STUDIO_TID", studio.tid);
      this.$store.commit(
        "SET_MINIMUM_BOOKABLE_TIME",
        studio.field_minimum_bookable_seconds
      );
      return this.$store.commit("SET_CURRENT_STUDIO", studio);
    }
  }
};
</script>

<style>
</style>
