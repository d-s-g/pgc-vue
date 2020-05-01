<template>
  <div class="booking__times">
    <div class="col-sm-5 booking-studio__calendar">
      <div class="booking-studio__selected booking-studio__selected--day">
        <h3><span>2</span>SELECT A DAY</h3>
      </div>
      <datepicker
        @selected="getAvailability"
        :disabledDates="disabledDates"
        :inline="true"
        :value="unformattedDate"
      />
    </div>
    <div class="col-sm-7 booking-studio__times">
      <div class="studio-times__header">
        <div class="booking-studio__selected booking-studio__selected--time">
          <h3><span>3</span>SELECT A TIME</h3>
        </div>
        <div v-show="humanDate != ''" class="studio-times__date">
          <h2>{{ humanDate }}</h2>
        </div>
      </div>
      <div v-show="responseError === 'ERROR'" class="studio-times__error studio-times__error--server-error">
        <i class="fa fa-exclamation" aria-hidden="true"></i>
        There was an error processing your request.
      </div>
      <div v-show="error === 'Error' " class="studio-times__error studio-times__error--unavailiable">
        <i class="fa fa-exclamation" aria-hidden="true"></i>{{ availability }}
      </div>
      <div v-show="allReserved && Object.keys(availability).length > 1" class="tudio-times__error studio-times__error--reserved">
        <i class="fa fa-exclamation" aria-hidden="true"></i>All reservation times for this studio have been reserved for the selected date. Please choose another day or choose another studio.
      </div>
      <div v-if="isLoading" class="loader"></div>
      <ul v-show="error !== 'Error'" class="studio-times__list">
        <li class="studio-times__item"  v-for="(value, key) in validatedAvailability" :key="key">
          <a v-if="value.selectable"  class="studio-time--active" @click="selectTime(value)" :class="value.classes">
            <span v-if="value.selected" class="time-added">Added</span>{{ value.formatted_range }}
          </a>
          <a v-else class="studio-time" :class="value.classes">
            <span v-if="value.selected" class="time-added">Added</span>
            <span v-if="value.on_hold">ON HOLD</span>
            <span v-if="value.available_seats < 1 && !value.on_hold">RESERVED</span>
            {{ value.formatted_range }}
          </a>
        </li>
      </ul>
    </div>
    <div>
      <transition name="modal">
        <div class="modal-content studio-selection-modal" v-if="this.selected.length" style="bottom: 0; left: 0; position: absolute;">
          <div class="modal-header">
            <h4 class="modal-title" v-if="this.selected.length * 30 * 60>= this.minimum_bookable_seconds" @click="showBookingRequestPane">
              <span class="studio-selection-selected">{{ buttonMessage }}</span>
            </h4>
            <h4 class="modal-title" v-else>
              <span class="studio-selection-required">{{ buttonMessage }}</span>
            </h4>
           </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import Datepicker from "vuejs-datepicker";
import moment from "moment-mini";

export default {
  name: "BookingTimes",
  props: {
    currentStudioId: {
      type: String,
      required: true
    }
  },
  components: {
    Datepicker
  },
  data() {
    return {
      showModal: false,
      isBooked: false,
      slot: "",
      buttonMessage: "Next",
      disabledDates: {
        to: new Date()
      }
    };
  },
  computed: {
    availability() {
      return this.$store.state.availability;
    },
    minimum_bookable_seconds() {
      return this.$store.state.minimum_bookable_seconds;
    },
    unformattedDate() {
      return this.$store.state.unformattedDate;
    },
    selected() {
      return this.$store.state.selectedTimes;
    },
    humanDate() {
      return this.$store.state.humanDate;
    },
    error() {
      return this.$store.state.error;
    },
    responseError() {
      return this.$store.state.requestStatus;
    },
    allReserved() {
      return this.validatedAvailability.every(
        value => value.available_seats === 0
      );
    },
    isLoading() {
      return this.$store.state.isLoading;
    },
    validatedAvailability() {
      const selectedIndexes = Object.keys(this.availability).reduce(
        (acc, value, index) => {
          const timeslot = this.availability[value];
          const isSelected = this.selected.reduce(
            (isSelected, selectedValue) => {
              if (selectedValue.booking_start === timeslot.booking_start) {
                isSelected = true;
              }
              return isSelected;
            },
            false
          );
          if (isSelected) {
            acc.push(index);
          }
          return acc;
        },
        []
      );
      const firstSelected = Math.min(...selectedIndexes);
      const lastSelected = Math.max(...selectedIndexes);
      return Object.keys(this.availability).map((value, index) => {
        const timeslot = this.availability[value];
        let config = {};
        // if (this.seconds_duration === '') {
        //   this.seconds_duration = value.seconds_duration
        // }
        config.isFirstSelection = index === firstSelected;
        config.isLastSelection = index === lastSelected;
        config.on_hold = timeslot.on_hold;
        config.selected = this.selected.reduce((isSelected, selectedValue) => {
          if (selectedValue.booking_start === timeslot.booking_start) {
            isSelected = true;
          }
          return isSelected;
        }, false);
        config.selectable = (() => {
          if (timeslot.available_seats < 1) {
            return false;
          }
          if (this.selected.length === 0) {
            return true;
          }
          return (
            index === firstSelected - 1 ||
            index === lastSelected + 1 ||
            config.isFirstSelection ||
            config.isLastSelection
          );
        })();
        config.classes = {
          "studio-time--selectable": config.selectable === true,
          "studio-time--selected": config.selected === true,
          "studio-time--disabled": config.selectable === false,
          "studio-time--on-hold": config.on_hold === true,
          "studio-time--reserved": timeslot.available_seats < 1 && !config.on_hold
        };
        return Object.assign(config, timeslot);
      });
    }
  },
  methods: {
    getAvailability(selectedDate) {
      const datesAreEqual =
        moment(selectedDate).format("YYYY-MM-DD") ===
        moment(this.unformattedDate).format("YYYY-MM-DD");

      if (datesAreEqual) {
        return;
      }
      if (this.selected !== []) {
        this.selected = [];
      }
      if (this.$store.state.requested_start_time !== false) {
        this.$store.commit("SET_REQUESTED_START_TIME", false);
      }
      if (this.$store.state.requested_end_time !== false) {
        this.$store.commit("SET_REQUESTED_END_TIME", false);
      }
      let formattedDate = moment(selectedDate).format("YYYY-MM-DD");
      let getParams = {
        tid: `${this.currentStudioId}`,
        date: `${formattedDate}`
      };
      this.getHumanDate(selectedDate);
      this.$store.commit("SET_UNFORMATTED_DATE", selectedDate);
      this.$store.commit("SET_FORMATTED_DATE", formattedDate);
      this.$store.dispatch("getStudioAvailability", getParams);
    },
    getHumanDate(selectedDate) {
      let humanDate = moment(selectedDate).format("MMM DD, YYYY");
      this.$store.commit("SET_HUMAN_DATE", humanDate);
      return (this.humanDate = humanDate);
    },
    selectTime(time) {
      const index = this.selected.reduce((acc, value, index) => {
        if (value.booking_start === time.booking_start) {
          acc = index;
        }
        return acc;
      }, -1);
      if (index >= 0) {
        this.selected.splice(index, 1);
        this.$store.commit("SET_SELECTED_TIMES", this.selected);
        this.getMinMaxdates(this.selected);
      } else {
        this.selected.push(time);
        this.$store.commit("SET_SELECTED_TIMES", this.selected);
        this.getMinMaxdates(this.selected);
      }
    },
    getMinMaxdates(time) {
      let startMoments = time.map(d => moment(d.booking_start));
      let endMoments = time.map(d => moment(d.booking_end));
      let minTime = moment.min(startMoments).valueOf();
      let maxTime = moment.max(endMoments).valueOf();

      //check if time checked is less than min allowed
      //time is in 30min blocks => 1block = 30m.
      //need to show blocks selected times number selected <= minimum bookable time.

      // this.slot = Object.values(this.availability).find( (slot) => { return slot } )

      const singleRoomBookableTime = 30 * 60;
      if (
        this.selected.length * singleRoomBookableTime >=
        this.minimum_bookable_seconds
      ) {
        if (this.$store.state.requested_start_time !== minTime) {
          this.$store.commit("SET_REQUESTED_START_TIME", minTime);
        }
        if (this.$store.state.requested_end_time !== maxTime) {
          this.$store.commit("SET_REQUESTED_END_TIME", maxTime);
        }
        this.buttonMessage = "Next";
      } else {
        if (this.$store.state.requested_start_time !== false) {
          this.$store.commit("SET_REQUESTED_START_TIME", false);
        }
        if (this.$store.state.requested_end_time !== false) {
          this.$store.commit("SET_REQUESTED_END_TIME", false);
        }
        //this needs to reflect the minimum selectable time.
        if (this.minimum_bookable_seconds < singleRoomBookableTime * 2) {
          this.buttonMessage = `A minimum of (${
            this.minimum_bookable_seconds / 60
          }) minutes of reserved time is required for this studio.`;
        } else {
          let hours =
            Math.floor(this.minimum_bookable_seconds / 60 / 60) +
            "." +
            ((this.minimum_bookable_seconds / 60) % 60 / 60 * 10);
          this.buttonMessage = `A minimum of (${hours}) consecutive hours of reservations are required for this studio.`;
        }
      }
    },
    showBookingRequestPane() {
      this.showBooking(false);
      this.showBookingRequest(true);
    },
    showBooking(bool) {
      return this.$store.commit("SHOW_BOOKING", bool);
    },
    showBookingRequest(bool) {
      window.scrollTo(0,0);
      return this.$store.commit("SHOW_BOOKING_REQUEST", bool);
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