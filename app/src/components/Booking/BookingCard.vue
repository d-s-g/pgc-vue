<template>
  <div class="booking-studio">
    <div class="booking-studio__image col-sm-5" :style='{ backgroundImage: `url(${currentStudio.field_studio_image})` }'></div>
    <div class="booking-studio__info col-sm-7">
      <div class="booking-studio__selected booking-studio__selected--studio">
        <h3><span>1</span>Selected Studio</h3>
      </div>
      <div class="booking-studio__title">
        <h2>{{ currentStudio.name }}</h2>
      </div>
      <div class="booking-studio__details" v-html="currentStudio.description">
        {{ currentStudio.description }}
      </div>
      <div class="booking-studio__edit">
        <a href="/booking">Edit Studio</a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "bookingCard",
  props: {
    currentStudio: {
      type: Object,
      required: true
    }
  }
};
</script>