<template>
  <div class="booking">
    <h1 class="page-header">When would you like to reserve the studio?</h1>
    <booking-card :current-studio="currentStudio"/>
    <booking-times :current-studio-id="currentStudio.tid"/>
  </div>
</template>

<script>
import bookingCard from "./BookingCard.vue";
import bookingTimes from "./BookingTimes.vue";

export default {
  name: "Booking",
  components: {
    bookingCard,
    bookingTimes
  },
  computed: {
    currentStudio() {
      return this.$store.state.currentStudio;
    }
  }
};
</script>