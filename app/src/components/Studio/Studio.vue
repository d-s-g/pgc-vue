<template>
  <div>
    <h1 class="page-header">Which studio would you like to reserve?</h1>
    <div v-if="isLoading" class="loader">load</div>
    <div class="container">
      <div v-show="responseError === 'ERROR'">
        There was an error processing your request.
      </div>
      <div class="row"  v-for="i in rowCount" :key="i">
        <studio-card v-for="studio in itemCountInRow(i)" :key="studio.tid" :studio="studio" />
      </div>
    </div>
  </div>
</template>

<script>
import StudioCard from "./StudioCard.vue";

export default {
  name: "Studio",
  components: {
    StudioCard
  },
  computed: {
    studios() {
      return this.$store.state.studios;
    },
    rowCount() {
      return Math.ceil(this.studios.length / 2);
    },
    responseError() {
      return this.$store.state.requestStatus;
    },
    isLoading() {
      return this.$store.state.isLoading;
    }
  },
  methods: {
    itemCountInRow(index) {
      return this.studios.slice((index - 1) * 2, index * 2);
    }
  }
};
</script>

<style scoped>
.loader,
.loader:before,
.loader:after {
  border-radius: 50%;
  width: 2.5em;
  height: 2.5em;
  -webkit-animation-fill-mode: both;
  animation-fill-mode: both;
  -webkit-animation: load7 1.8s infinite ease-in-out;
  animation: load7 1.8s infinite ease-in-out;
}
.loader {
  color: #f2f2f2;
  font-size: 10px;
  margin: 80px auto;
  position: relative;
  text-indent: -9999em;
  -webkit-transform: translateZ(0);
  -ms-transform: translateZ(0);
  transform: translateZ(0);
  -webkit-animation-delay: -0.16s;
  animation-delay: -0.16s;
}
.loader:before,
.loader:after {
  content: '';
  position: absolute;
  top: 0;
}
.loader:before {
  left: -3.5em;
  -webkit-animation-delay: -0.32s;
  animation-delay: -0.32s;
}
.loader:after {
  left: 3.5em;
}
@-webkit-keyframes load7 {
  0%,
  80%,
  100% {
    box-shadow: 0 2.5em 0 -1.3em;
  }
  40% {
    box-shadow: 0 2.5em 0 0;
  }
}
@keyframes load7 {
  0%,
  80%,
  100% {
    box-shadow: 0 2.5em 0 -1.3em;
  }
  40% {
    box-shadow: 0 2.5em 0 0;
  }
}

</style>
