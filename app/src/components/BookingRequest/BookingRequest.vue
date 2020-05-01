<template>
  <div class="booking-request">
    <h1 class="page-header">Confirm &amp; Request Studio Space</h1>
    <div class="container">
      <div class="row">
        <div class="col-sm-12" v-show="currentStudio.field_step_3_help_text">
          <div class="studi-oconfirm-desc" v-html="currentStudio.field_step_3_help_text">
            {{ currentStudio.field_step_3_help_text }}
          </div>
        </div>
        <div class="col-sm-5 studio-details-wpr">
          <h2 class="studio-confirm-title">Reservation Details</h2>
          <div class="res-wpr">
            <div class="res-title">Selected Studio</div>
            <div class="res-desc">{{ currentStudio.name }}</div>
            <div class="res-title">Day</div>
            <div class="res-desc">{{ humanDate }}</div>
            <div class="res-title">Time(s)</div>
            <div class="res-desc">{{ currentMinTime }} - {{ currentMaxTime }}</div>
            <div class="res-link" @click="showBookingPane">Edit day &amp; Time</div>
          </div>
        </div>
        <div class="col-sm-7 studio-contact-wpr">
          <form id="studio-contact-form" @submit.prevent="submit">
            <h2 class="studio-confirm-title">Contact information</h2>
            <div class="form-item form-group" :class="{ 'form-group--error': $v.name.$error }">
              <input id="name" type="text" v-model.trim="$v.name.$model" class="form-control" aria-describedby="name">
              <label for="name" class="control-label form-required">Name<sup>&#42;</sup></label>
              <div class="has-error" v-if="!$v.name.required && $v.name.$dirty">Name is required</div>
            </div>
            <div class="form-item form-group" :class="{ 'form-group--error': $v.email.$error }">
              <input id="email" v-model.trim="$v.email.$model" type="text" class="form-control" aria-describedby="email">
              <label for="email" class="control-label form-required">Email<sup>&#42;</sup></label>
              <div class="has-error" v-if="!$v.email.required && $v.email.$dirty">Email is required</div>
              <div class="has-error" v-if="!$v.email.email && $v.email.$dirty">Must be a vaild email</div>
            </div>
            <div class="form-item form-group" :class="{ 'form-group--error': $v.phone.$error }">
              <input id="phone" type="text" v-model.trim="$v.phone.$model" class="form-control" aria-describedby="phone">
              <label for="phone" class="control-label">Phone</label>
              <div class="has-error" v-if="!$v.phone.validPhone && $v.phone.$dirty">Must be a vaild phone number</div>
            </div>
            <div class="form-item form-group">
              <textarea id="message" type="textarea" class="form-control" v-model.trim="message" aria-describedby="phone" placeholder="What special equipment, materials or supplies do you need?"></textarea>
              <label for="message" class="control-label">Message</label>
            </div>
            <div class="form-item form-group">
              <input id="recurring" v-model.trim="recurring" type="checkbox" aria-label="recurring">
              <label for="recurring">Request a recurring time slot.</label>
              <div class="form-desc">Recurring rentals are subject to changes in programming.</div>
            </div>
            <div v-if="status === 'PENDING'">Sending... </div>
          </form>
        </div>
      </div>
    </div>
       <a class="booking-request-submit" @click="submit">Submit</a>
      <transition name="modal modal-request-wpr" style="display: none;">
        <div class="modal-mask" style="display: none;">
          <div class="modal-wrapper">
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <h2 class="request-title">Your request has been sent.</h2>
                  <p class="request-subtitle">
                    We will contact you to confirm your request.
                    Please call 412-365-2145 with questions.
                  </p>
                </div>
                <div class="modal-body">
                  <p class="request-body"></p>
                  <button class="btn-primary btn" @click="showModal = false">Got it!</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
  </div>
</template>

<script>
import moment from "moment-mini";
import { required, email } from "vuelidate/lib/validators";
const PhoneNumber = require("@reallyuseful/phonenumber");

const validPhone = value => PhoneNumber.valid(value);

export default {
  name: "booking-request",
  data() {
    return {
      name: "",
      email: "",
      phone: "",
      message: "",
      recurring: false
    };
  },
  validations: {
    name: {
      required
    },
    email: {
      required,
      email
    },
    phone: {
      validPhone
    }
  },
  computed: {
    currentStudio() {
      return this.$store.state.currentStudio;
    },
    humanDate() {
      return moment(this.$store.state.unformattedDate).format(
        "dddd, MMMM DD, YYYY"
      );
    },
    currentMinTime() {
      return moment
        .unix(this.$store.state.requested_start_time)
        .format("h:mma");
    },
    currentMaxTime() {
      return moment.unix(this.$store.state.requested_end_time).format("h:mma");
    },
    status() {
      return this.$store.state.requestStatus;
    },
    showModal: {
      get() {
        return this.$store.state.showModal;
      },
      set(value) {
        return this.$store.commit("SET_SHOW_MODAL", value);
      }
    }
  },
  methods: {
    showBookingPane() {
      this.showBooking(true);
      this.showBookingRequest(false);
    },
    showBooking(bool) {
      return this.$store.commit("SHOW_BOOKING", bool);
    },
    showBookingRequest(bool) {
      return this.$store.commit("SHOW_BOOKING_REQUEST", bool);
    },
    submit() {
      this.$v.$touch();
      if (this.status === "PENDING") {
        return;
      }
      if (this.$v.$invalid) {
        return;
      } else {
        this.$store.commit("SET_NAME", this.name);
        this.$store.commit("SET_EMAIL", this.email);

        if (this.phone !== "") {
          this.$store.commit("SET_PHONE_NUMBER", this.phone);
        }
        if (this.message !== "") {
          this.$store.commit("SET_MESSAGE", this.message);
        }
        if (this.recurring !== false) {
          this.$store.commit("SET_RECURRING", this.recurring);
        }

        this.$store.dispatch("postBookingRequest");
      }
    }
  }
};
</script>