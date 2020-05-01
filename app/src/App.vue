<template>
  <div>
    <studio v-if="showStudios"/>
    <booking v-if="showBooking" />
    <booking-request v-if="showBookingRequest"/>
  </div>
</template>

<script>
import Studio from "./components/Studio/Studio.vue";
import Booking from "./components/Booking/Booking.vue";
import BookingRequest from "./components/BookingRequest/BookingRequest.vue";

export default {
  name: "App",
  components: {
    Studio,
    Booking,
    BookingRequest
  },
  created() {
    this.$store.dispatch("loadCsrfToken");
    this.$store.dispatch("loadStudios");
  },
  // be able to get the data
  computed: {
    showStudios() {
      return this.$store.state.showStudios;
    },
    showBooking() {
      return this.$store.state.showBooking;
    },
    showBookingRequest() {
      return this.$store.state.showBookingRequest;
    }
  }
};
</script>
