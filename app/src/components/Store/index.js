import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

Vue.use(Vuex);

const state = {
  showStudios: true,
  showBooking: false,
  showBookingRequest: false,
  showBookingRequestModal: false,
  studios: [],
  minimum_bookable_seconds: '',
  currentStudio: [],
  studioLoad: true,
  availability: [],
  selectedTimes: [],
  unformattedDate: '',
  requested_date: '',
  humanDate: '',
  room_tid: false,
  requested_start_time: false,
  requested_end_time: false,
  phone_number: false,
  email: false,
  message: false,
  requestStatus: '',
  error: '',
  showModal: false,
  isLoading: false
};
const getters = {};
const mutations = {
  SET_STUDIOS: (state, studios) => {
    state.studios = studios;
  },
  SET_STUDIO_TID: (state, roomTid) => {
    state.room_tid = roomTid;
  },
  SET_STUDIO_LOAD: (state, bool) => {
    state.studioLoad = bool;
  },
  SET_AVAILABILITY: (state, availability) => {
    state.availability = availability;
  },
  SET_CURRENT_STUDIO: (state, studio) => {
    state.currentStudio = studio;
  },
  SET_MINIMUM_BOOKABLE_TIME: (state, studioMinTime) => {
    state.minimum_bookable_seconds = studioMinTime;
  },
  SET_UNFORMATTED_DATE: (state, unformattedDate) => {
    state.unformattedDate = unformattedDate;
  },
  SET_FORMATTED_DATE: (state, requesteDate) => {
    state.requested_date = requesteDate;
  },
  SET_HUMAN_DATE: (state, humanDate) => {
    state.humanDate = humanDate;
  },
  SET_SELECTED_TIMES: (state, selectedTimes) => {
    state.selectedTimes = selectedTimes;
  },
  SET_REQUESTED_START_TIME: (state, requestedStartTime) => {
    state.requested_start_time = requestedStartTime;
  },
  SET_REQUESTED_END_TIME: (state, requestedEndTime) => {
    state.requested_end_time = requestedEndTime;
  },
  SET_NAME: (state, name) => {
    state.name = name;
  },
  SET_PHONE_NUMBER: (state, phoneNumber) => {
    state.phone_number = phoneNumber;
  },
  SET_EMAIL: (state, email) => {
    state.email = email;
  },
  SET_MESSAGE: (state, message) => {
    state.message = message;
  },
  SHOW_STUDIOS: (state, bool) => {
    state.showStudios = bool;
  },
  SHOW_BOOKING: (state, bool) => {
    state.showBooking = bool;
  },
  SHOW_BOOKING_REQUEST: (state, bool) => {
    state.showBookingRequest = bool;
  },
  SET_REQUEST_STATUS: (state, status) => {
    state.requestStatus = status;
  },
  SET_ERROR: (state, error) => {
    state.error = error;
  },
  SET_SHOW_MODAL: (state, bool) => {
    state.showModal = bool;
  },
  SET_IS_LOADING: (state, bool) => {
    state.isLoading = bool;
  }
};
const actions = {
  loadCsrfToken: () => {
    axios
    .get('/rest/session/token')
    .then(res => {
      axios.defaults.headers.common = {
        'X-CSRF-TOKEN' : res.data
      };
    })
    .catch(res => {
      console.error(res.response);
    });
  },
  loadStudios: ({
    commit
  }) => {
    commit('SET_IS_LOADING', true);
    axios
      .get('/api/booking/v1/rooms')
      .then(res => {
        commit('SET_STUDIOS', res.data.rooms);
        commit('SET_IS_LOADING', false);
      })
      .catch(res => {
        commit('SET_REQUEST_STATUS', 'ERROR');
        commit('SET_IS_LOADING', true);
        console.error(res.response);
      });
  },
  getStudioAvailability: ({
    commit
  }, getParams) => {
    commit('SET_IS_LOADING', true);
    axios
      .get(`/api/booking/v1/availability?room_tid=${getParams.tid}&date=${getParams.date}`)
      .then(res => {
        if (res.data.status !== "Error") {
          commit('SET_ERROR', '');
          commit('SET_AVAILABILITY', res.data.availability);
          commit('SET_IS_LOADING', false);
        } else {
          commit('SET_ERROR', res.data.status);
          commit('SET_AVAILABILITY', res.data.message);
          commit('SET_IS_LOADING', false);
        }
      })
      .catch(res => {
        commit('SET_REQUEST_STATUS', 'ERROR');
        console.error(res.response);
      });
  },
  postBookingRequest: ({
    commit
  }, payload) => {

    payload = {
      name: state.name,
      requested_date: state.unformattedDate,
      room_tid: state.room_tid,
      requested_start_time: state.requested_start_time,
      requested_end_time: state.requested_end_time,
      phone_number: state.phone_number,
      email: state.email,
      message: state.message,
      recurring: state.recurring
    };

    commit('SET_REQUEST_STATUS', 'PENDING');
    axios
      .post('/api/booking/v1/request', payload)
      .then(res => {
        if (res.data.status === "OK") {
          commit('SET_REQUEST_STATUS', res.data.status);
          window.location = "/studio-rental-reservation";
        }
      })
      .catch(res => {
        commit('SET_REQUEST_STATUS', 'ERROR');
        console.error(res);
      });
  }
};

export default new Vuex.Store({
  state,
  getters,
  mutations,
  actions
});