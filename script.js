'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

let lat;
let long;
let map;
let eventMap;

navigator.geolocation.getCurrentPosition(function (e) {
  lat = e.coords.latitude;
  long = e.coords.longitude;

  map = L.map('map').setView([41.3398161, 69.2888034], 18);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  map.on('click', function (e) {
    // console.log(e);
    eventMap = e;
    form.classList.remove('hidden');
    inputDistance.focus();
  });
});

setTimeout(function () {
  console.log(lat, long);
}, 1000);

console.log(L);

form.addEventListener('submit', function (e) {
  inputCadence.value =
    inputDistance.value =
    inputDuration.value =
    inputElevation.value =
      '';

  e.preventDefault();

  L.marker([eventMap.latlng.lat, eventMap.latlng.lng], {
    opacity: 0.7,
    draggable: true,
  })
    .addTo(map)
    .bindPopup(
      L.popup({
        // autoPan: false,
        // keepInView: true,
        // closeButton: false,
        maxWidth: 200,
        minWidth: 100,
        autoClose: false,
        closeOnClick: false,
        className: 'running-popup',
      }).setContent('Hello World')
    )
    .openPopup();
});

inputType.addEventListener('change', function (e) {
  inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
});
