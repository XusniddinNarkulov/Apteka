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

class Mashq {
  date = new Date();
  id = (Date.now() + '').slice(-8);

  constructor(distance, duration, coords) {
    this.distance = distance;
    this.duration = duration;
    this.coords = coords;
  }
  _setTavsif() {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    this.tavsif = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
}

class Yugurish extends Mashq {
  type = 'running';
  constructor(distance, duration, coords, cadence) {
    super(distance, duration, coords);
    this.cadence = cadence;
    this._setTavsif();
  }
}

class Velik extends Mashq {
  type = 'cycling';
  constructor(distance, duration, coords, elevation) {
    super(distance, duration, coords);
    this.elevation = elevation;
    this._setTavsif();
  }
}

// const runNeo = new Yugurish(2, 1, [23, 32], 100);
// const bicycleNeo = new Velik(10, 1, [33, 44], 1000);
// console.log(runNeo, bicycleNeo);

class App {
  #mashqlar = [];
  constructor() {
    this._getCurrentPosition();
    inputType.addEventListener('change', this._selectToggle);
    form.addEventListener('submit', this._createObj.bind(this));
    this._getLocalStorage();
  }

  //1 geolokatsiyani olish
  _getCurrentPosition() {
    navigator.geolocation.getCurrentPosition(
      this._showMap.bind(this),
      function () {
        alert(`lokatsiyani ololmadim`);
      }
    );
  }
  //2 geolokatsiyani mapga berib, mapni ochish
  _showMap(e) {
    lat = e.coords.latitude;
    long = e.coords.longitude;

    map = L.map('map').setView([41.3398161, 69.2888034], 18);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    this._showForm();

    this._getLocalStorage();
  }
  //3 formani ochish
  _showForm() {
    map.on('click', function (e) {
      // console.log(e);
      eventMap = e;
      form.classList.remove('hidden');
      inputDistance.focus();
    });
  }

  //SELECTION OPTION UZGARGANDA INPUTNI HAM UZGARTIRISH
  _selectToggle() {
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  }

  //4 forma submit bo'lganda markerni mapga chiqarish
  _showMarker(obj) {
    // e.preventDefault();

    L.marker(obj.coords, {
      opacity: 0.88,
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
          className: `${obj.type}-popup`,
        }).setContent(`${obj.tavsif}`)
      )
      .openPopup();
    this._hideForm();
  }

  //formani yopish
  _hideForm() {
    inputCadence.value =
      inputDistance.value =
      inputDuration.value =
      inputElevation.value =
        '';
    form.classList.add('hidden');
  }

  //Formadan ma'lumotlarni o'qib olib object yaratish(Yugurish va Velik klasslaridan foydalanib)
  _createObj(e) {
    e.preventDefault();
    let mashq = '';
    let numbermi = (...inputs) => {
      return inputs.every(val => Number.isFinite(val));
    };
    let musbatmi = (...inputs) => {
      return inputs.every(val => val > 0);
    };
    let distance = +inputDistance.value;
    let duration = +inputDuration.value;
    let type = inputType.value;
    if (type === 'running') {
      let cadence = +inputCadence.value;
      if (
        !numbermi(distance, duration, cadence) ||
        !musbatmi(distance, duration, cadence)
      ) {
        return alert("xato ma'lumotlar kiritildi");
      }
      mashq = new Yugurish(
        distance,
        duration,
        [eventMap.latlng.lat, eventMap.latlng.lng],
        cadence
      );
      // this._showMarker(mashq);
      // console.log(mashq);
    }
    if (type === 'cycling') {
      let elevation = +inputElevation.value;
      if (
        !numbermi(distance, duration, elevation) ||
        !musbatmi(distance, duration)
      ) {
        return alert("xato ma'lumotlar kiritildi");
      }
      mashq = new Velik(
        distance,
        duration,
        [eventMap.latlng.lat, eventMap.latlng.lng],
        elevation
      );
    }

    //mashq obyektini Mashqlar arrayiga push qilish metodi
    this.#mashqlar.push(mashq);
    console.log(this.#mashqlar);

    //mashq obj dagi ma'lumotlarni mapga marker sifatida chiqarish
    this._showMarker(mashq);

    //mashqlar ro'yxatini chiqarish
    this._renderList(mashq);

    //SetLocaldan foydalanish
    this._setLocalStorage();
  }

  //mashqlar ro'yxatini chiqarish

  _renderList(obj) {
    let html = `
    <li class="workout workout--${obj.type}" data-id="${obj.id}">
      <h2 class="workout__title">${obj.tavsif}</h2>
      <div class="workout__details">
        <span class="workout__icon">${
          obj.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
        }</span>
        <span class="workout__value">${obj.distance}</span>
        <span class="workout__unit">km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⏱</span>
        <span class="workout__value">${obj.duration}</span>
        <span class="workout__unit">min</span>
      </div>
    `;
    if (obj.type === 'running') {
      html += `
      <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${obj.distance / obj.duration}</span>
        <span class="workout__unit">min/km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">🦶🏼</span>
        <span class="workout__value">${obj.cadence}</span>
        <span class="workout__unit">spm</span>
      </div>
    </li>`;
    }
    if (obj.type === 'cycling') {
      html += `
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${
              obj.distance / (obj.duration / 60)
            }</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${obj.elevation}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>
      `;
    }

    form.insertAdjacentHTML('afterend', html);
  }

  //Ma'lumotlarni localStorage ga saqlash
  _setLocalStorage() {
    localStorage.setItem('mashqlar', JSON.stringify(this.#mashqlar));
  }
  //ma'lumotlarni localStoragedan olish
  _getLocalStorage() {
    let data = JSON.parse(localStorage.getItem('mashqlar'));
    if (!data) return;

    this.#mashqlar = data;
    this.#mashqlar.forEach(val => {
      this._renderList(val);
      this._showMarker(val);
    });
  }
  _removeLocalStorage() {
    localStorage.removeItem('mashqlar');
    location.reload();
  }
}

// navigator.geolocation.getCurrentPosition(function (e) {
//   lat = e.coords.latitude;
//   long = e.coords.longitude;

//   map = L.map('map').setView([41.3398161, 69.2888034], 18);

//   L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//     attribution:
//       '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
//   }).addTo(map);

//   map.on('click', function (e) {
//     // console.log(e);
//     eventMap = e;
//     form.classList.remove('hidden');
//     inputDistance.focus();
//   });
// });

// setTimeout(function () {
//   console.log(lat, long);
// }, 3000);

// console.log(L);

// inputType.addEventListener('change', function (e) {
//   inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
//   inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
// });

// form.addEventListener('submit', function (e) {
//   inputCadence.value =
//     inputDistance.value =
//     inputDuration.value =
//     inputElevation.value =
//       '';

//   e.preventDefault();

//   L.marker([eventMap.latlng.lat, eventMap.latlng.lng], {
//     opacity: 0.7,
//     draggable: true,
//   })
//     .addTo(map)
//     .bindPopup(
//       L.popup({
//         // autoPan: false,
//         // keepInView: true,
//         // closeButton: false,
//         maxWidth: 200,
//         minWidth: 100,
//         autoClose: false,
//         closeOnClick: false,
//         className: 'running-popup',
//       }).setContent('Hello World')
//     )
//     .openPopup();
// });

const magicMap = new App();
// console.log(magicMap);
