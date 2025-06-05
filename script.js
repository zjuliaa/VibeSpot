let map;
let customIcon;
let selectedIcon;
let activeInfoWindow = null;

function updateSliderDistance(slider_d, tooltip_d) {
  const value = slider_d.value;
  tooltip_d.textContent = `${value} km`;

  const percent = (value - slider_d.min) / (slider_d.max - slider_d.min);
  const offset = percent * (slider_d.offsetWidth - 20) + 10;
  tooltip_d.style.left = `${offset}px`;

  slider_d.style.background = `linear-gradient(to right, #C9461E ${percent * 100}%, #dfd2ae ${percent * 100}%)`;
}

function updateSliderBudget(slider_b, tooltip_b) {
  const value = slider_b.value;
  tooltip_b.textContent = `${value} zł`;

  const percent = (value - slider_b.min) / (slider_b.max - slider_b.min);
  const offset = percent * (slider_b.offsetWidth - 20) + 10;
  tooltip_b.style.left = `${offset}px`;

  slider_b.style.background = `linear-gradient(to right, #C9461E ${percent * 100}%, #dfd2ae ${percent * 100}%)`;
}

const slider_d = document.getElementById("distance");
const tooltip_d = document.getElementById("distance-tooltip_d");
slider_d.addEventListener("input", () => updateSliderDistance(slider_d, tooltip_d));
window.addEventListener("load", () => updateSliderDistance(slider_d, tooltip_d));

const slider_b = document.getElementById("budget");
const tooltip_b = document.getElementById("budget-tooltip_b");
slider_b.addEventListener("input", () => updateSliderBudget(slider_b, tooltip_b));
window.addEventListener("load", () => updateSliderBudget(slider_b, tooltip_b));


document.addEventListener('DOMContentLoaded', function () {
  function initMapWithStyle(styleJson) {
    map = new google.maps.Map(document.getElementById("map"), {
      center: { lat: 52.2297, lng: 21.0122 },
      zoom: 13,
      styles: styleJson,
      disableDefaultUI: true
    });
    const customIcon = {
      url: 'Vector.svg',  // ścieżka do ikony
      scaledSize: new google.maps.Size(32, 32),   // rozmiar ikony
      anchor: new google.maps.Point(16, 32),      // punkt zaczepienia ikony (tam gdzie "stoi" na mapie)
      // popupAnchor nie jest obsługiwany bezpośrednio, Google Maps ma własne infoWindow
    };


    const selectedIcon = {
      url: 'Vector-selected.svg',
      scaledSize: new google.maps.Size(60, 40),
      anchor: new google.maps.Point(30, 40),
    };

    // Możesz teraz tu dodać inne rzeczy do mapy, np. markery, eventy itd.
  }

  function initMap() {
    fetch('googlemaps.json')
      .then(res => res.json())
      .then(style => initMapWithStyle(style))
      .catch(err => {
        console.error('Failed to load map style:', err);
      });
  }

  window.initMap = initMap;
  


  // const map = L.map('map').setView([52.2297, 21.0122], 13);
  // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  //   attribution: '&copy; OpenStreetMap contributors'
  // }).addTo(map);

  let userLat = null;
  let userLon = null;

  let activeMarker = null;

  const searchBtn = document.getElementById('search-button');
  const filterToggleBar = document.getElementById('filter-toggle-bar');

  // Ukryj pasek filtrów na starcie (jeśli jeszcze nie)
  filterToggleBar.style.display = 'none';

  // Pokaż pasek po kliknięciu "Wyszukaj"
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      filterToggleBar.style.display = 'block';
    });
  }

  // Ukryj pasek po kliknięciu w niego samego
  filterToggleBar.addEventListener('click', () => {
    filterToggleBar.style.display = 'none';
  });

  let userLocationMarker = null;


  const commentsBtn = document.getElementById('comments-button');
  const premiumToast = document.getElementById('premium-toast');

  commentsBtn.addEventListener('click', () => {
    // Pokaż toast
    premiumToast.classList.add('visible');

    // Po chwili rozpocznij znikanie
    setTimeout(() => {
      premiumToast.classList.remove('visible');
    }, 1600); // 1.6s widoczne, 1s animacji daje ~2.6s całkowitego czasu
  });


function fetchWeather(lat, lon) {
  const apiKey = '1f2079bdb83441c8a04d76290d15bd8a';
  const url = `https://pro.openweathermap.org/data/2.5/forecast/hourly?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=pl`;

  fetch(url)
    .then(response => {
      if (!response.ok) throw new Error("Nie udało się pobrać danych pogodowych");
      return response.json();
    })
    .then(data => {
      const weatherDiv = document.getElementById('weather-info');
      const forecast = data.list[0]; 

      const temp = forecast.main.temp;
      const description = forecast.weather[0].description;
      const icon = forecast.weather[0].icon;

      weatherDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}">
          <div>
            <strong>${temp.toFixed(1)}°C</strong><br>
            ${description.charAt(0).toUpperCase() + description.slice(1)}
          </div>
        </div>
      `;
      weatherDiv.style.display = 'block';
    })
    .catch(err => {
      console.error("Błąd pobierania pogody:", err);
    });
}

function checkRainInTimeRange(lat, lon, startHour, endHour, callback) {
  if (typeof callback !== "function") {
    console.error("❌ Błąd: callback nie jest funkcją");
    return;
  }

  const apiKey = '1f2079bdb83441c8a04d76290d15bd8a';
  const url = `https://pro.openweathermap.org/data/2.5/forecast/hourly?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (!data.list || !Array.isArray(data.list)) {
        console.error("Brak listy prognoz pogody:", data);
        callback("słonecznie"); // domyślnie
        return;
      }

      const now = new Date();
      const todayDateStr = now.toISOString().split('T')[0];

      let willRain = false;
      let willSnow = false;

      data.list.forEach(entry => {
        const entryDate = new Date(entry.dt * 1000);
        const entryHour = entryDate.getHours();
        const entryDateStr = entryDate.toISOString().split('T')[0];

        if (entryDateStr === todayDateStr && entryHour >= startHour && entryHour < endHour) {
          const weatherMain = entry.weather.map(w => w.main.toLowerCase());
          if (weatherMain.includes('rain')) willRain = true;
          if (weatherMain.includes('snow')) willSnow = true;
        }
      });

      if (willRain) {
        callback("deszczowo");
        console.log("Prognoza: będzie padać.");
      }else if (willSnow){
        console.log("Prognoza: będzie śnieżyć.");
      callback("śnieżnie");
      } else {
        console.log("Prognoza: będzie słonecznie.");
        callback("słonecznie");}
    })
    .catch(err => {
      console.error("Błąd pobierania pogody:", err);
      callback("słonecznie"); // fallback
    });
}


function showUserLocation(lat, lon) {
  console.log("Pokazuję lokalizację użytkownika na mapie:", lat, lon);

  const position = { lat: lat, lng: lon };

  if (userLocationMarker) {
    userLocationMarker.setPosition(position);
  } else {
    userLocationMarker = new google.maps.Marker({
      position: position,
      map: map,
      icon: customIcon // tutaj musi być odpowiedni format ikony dla Google Maps
    });
  }

  map.setCenter(position);
  map.setZoom(13);

  fetchWeather(lat, lon);
}


  function getUserLocation() {
    console.log("Wywołano getUserLocation()"); 
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        const userlat = position.coords.latitude;
        const userlon = position.coords.longitude;
        console.log('Lokalizacja użytkownika:', userlat, userlon);  
        showUserLocation(userlat, userlon);
      }, function(error) {
        console.error("Błąd pobierania lokalizacji: ", error);  
      });
    } else {
      console.error("Geolokalizacja nie jest obsługiwana przez tę przeglądarkę.");
    }
  }
if (searchBtn) {
  searchBtn.addEventListener('click', () => {
    console.log("Kliknięto przycisk Wyszukaj");

    const filters = {
      Nastrój: selectedMood,
      Dystans: distanceInput.value + " km",
      Budżet: budgetInput.value + " zł",
      "Godziny": selectedTimeRange ? selectedTimeRange.join(" – ") : "nie wybrano",
      Dodatki: Array.from(selectedExtras).join(", ") || "brak"
    };

    console.table(filters);
    // alert("Wybrane filtry:\n" + Object.entries(filters).map(([k, v]) => `${k}: ${v}`).join("\n"));

    document.getElementById('filter-panel').style.display = 'none';
    document.getElementById('filter-toggle-bar').style.display = 'block';

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) {
        const userLat = position.coords.latitude;
        const userLon = position.coords.longitude;

        // showUserLocation(userLat, userLon); // już masz tę funkcję
        const maxDist = parseFloat(distanceInput.value); // np. 50 km
        displayAttractionsInRange(userLat, userLon, maxDist); // ta funkcja jest w nowym kodzie
      }, function (error) {
        console.error("Błąd geolokalizacji:", error);
      });
    } else {
      alert("Twoja przeglądarka nie obsługuje geolokalizacji.");
    }
  });
  } else {
  console.error("Nie znaleziono przycisku 'search-button'");
  }

   document.querySelector('.google-btn').addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    // firebase.auth().signInWithRedirect(provider)
    firebase.auth().signInWithPopup(provider)
      .then(result => {
        const user = result.user;
        // alert("Zalogowano jako: " + user.displayName);
        onUserLogin(user); 
      })
      .catch(error => {
        if (error.code === 'auth/popup-closed-by-user') {
          alert("Zamknąłeś okno logowania przed jego zakończeniem.");
        } else {
          console.error("Błąd logowania:", error);
        }
      });
  });


  let attractionsData = null;

  fetch('lista_atrakt.geojson')
    .then(response => response.json())
    .then(data => {
      attractionsData = data;
      console.log("GeoJSON załadowany:", data);
    })
    .catch(err => console.error("Błąd wczytywania GeoJSON:", err));

  function onUserLogin(user) {
    document.querySelector('.login-box').style.display = 'none';
    document.getElementById('info-panel').style.display = 'none';
    document.getElementById('filter-panel').style.display = 'block';
  }
document.getElementById('close-info-btn').addEventListener('click', () => {
  document.getElementById('info-panel').style.display = 'none';

  const user = firebase.auth().currentUser;
  if (user) {
    document.getElementById('filter-panel').style.display = 'block';
    showUserPanel(user);
  } else {
    document.querySelector('.login-box').style.display = 'block';
  }
});

firebase.auth().onAuthStateChanged(user => {
  const loginBox = document.querySelector('.login-box');
  const filterPanel = document.getElementById('filter-panel');
  const userInitials = document.getElementById('user-initials');
  const userMenu = document.getElementById('user-menu');
  const infoPanel = document.getElementById('info-panel');
  const fullNameElement = document.getElementById('user-fullname');

  if (infoPanel) {
    infoPanel.style.display = 'block';
  }

  if (user) {
    // showUserPanel(user);
    if (fullNameElement && user.displayName) {
      fullNameElement.textContent = user.displayName;
    }
    if (loginBox) loginBox.style.display = 'none';
    if (filterPanel) filterPanel.style.display = 'none';
    if (userInitials) userInitials.style.display = 'none';
  } else {
    if (loginBox) loginBox.style.display = 'none';
    if (filterPanel) filterPanel.style.display = 'none';
    // if (userInitials) userInitials.style.display = 'none';
    if (userMenu) userMenu.style.display = 'none';
  }

});


 function showUserPanel(user) {
    const initialsDiv = document.getElementById('user-initials');
  
    if (user.displayName) {
      const nameParts = user.displayName.trim().split(" ");
      const initials = nameParts[0][0] + (nameParts[1]?.[0] || "");
      initialsDiv.textContent = initials.toUpperCase();
    }
  
    initialsDiv.style.display = 'flex';
    const filterPanel = document.getElementById('filter-panel');
    if (filterPanel) {
      console.log("Pokazuję panel filtrów"); 
      filterPanel.style.display = 'block';
    }
  }
  
  const logoutButtonMenu = document.getElementById('logout-btn-menu');
if (logoutButtonMenu) {
  console.log("Przycisk wylogowania (menu) załadowany!");
  logoutButtonMenu.addEventListener('click', () => {
    console.log("Kliknięto przycisk wylogowania (menu)!");
    firebase.auth().signOut().then(() => {
      console.log("Użytkownik został wylogowany");
      document.querySelector('.user-panel').style.display = 'none';
      document.querySelector('.login-box').style.display = 'none';
      document.getElementById('user-initials').style.display = 'none';
      document.getElementById('user-menu').style.display = 'none';
      document.getElementById('filter-toggle-bar').style.display = 'none';
      const filterPanel = document.getElementById('filter-panel');
      if (filterPanel) {
        filterPanel.style.display = 'none';
      }
      const carousel = document.getElementById('attraction-carousel');
      if (carousel) {
        carousel.style.display = 'none';
        carousel.innerHTML = '';
      }
      if (markersLayer && Array.isArray(markersLayer)) {
        markersLayer.forEach(marker => marker.setMap(null));
        markersLayer = null;
      }
      const weatherInfo = document.getElementById('weather-info');
      if (weatherInfo) {
        weatherInfo.style.display = 'none';
      }
      document.querySelectorAll('.mood_btn.active').forEach(btn => {
        btn.classList.remove('active');
      });

    }).catch(error => {
      console.error("Błąd wylogowywania:", error);
    });
  });
} else {
  console.log("Przycisk wylogowania (menu) nie istnieje!");
}


  document.getElementById('user-initials').addEventListener('click', () => {
    const menu = document.getElementById('user-menu');
    menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
  });

  document.addEventListener('click', (e) => {
    const initials = document.getElementById('user-initials');
    const menu = document.getElementById('user-menu');
    if (!initials.contains(e.target) && !menu.contains(e.target)) {
      menu.style.display = 'none';
    }
  });

   const calendarContainer = document.getElementById('calendar-container');
  
  const otherDateBtn = Array.from(document.querySelectorAll('.filter-btn'))
    .find(btn => btn.textContent.trim().toLowerCase() === 'inny termin');
  
  if (otherDateBtn) {
    otherDateBtn.addEventListener('click', () => {
      if (calendarContainer.style.display === 'none') {
        if (!document.getElementById('date-picker')) {
          const input = document.createElement('input');
          input.type = 'text';
          input.id = 'date-picker';
          input.style.padding = '10px';
          input.style.fontSize = '16px';
          calendarContainer.appendChild(input);
          flatpickr("#date-picker", {
            dateFormat: "Y-m-d",
            minDate: "today",
            locale: "pl"
          });
        }
        calendarContainer.style.display = 'block';
      } else {
        calendarContainer.style.display = 'none';
      }
    });
  }
  const timeSlider = document.getElementById("time-slider");
  const timeOutput = document.getElementById("time-range-output");
let selectedTimeRange = null;


  if (timeSlider) {
    noUiSlider.create(timeSlider, {
      start: [8, 18],
      connect: true,
      step: 1,
      range: {
        min: 0,
        max: 24,
      },
      format: {
        to: value => `${Math.round(value).toString().padStart(2, '0')}:00`,
        from: value => parseInt(value),
      }
    });
  let selectedTimeRange = null;
  
  timeSlider.noUiSlider.on("update", function (values) {
      timeOutput.textContent = values.join(" – ");
      selectedTimeRange = values;
    });
  } else {
    console.error("Nie znaleziono #time-slider");
  }

let selectedMood = null;
let selectedExtras = new Set();

document.querySelectorAll('.mood_btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mood_btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedMood = btn.textContent.trim();
    console.log("Wybrany nastrój:", selectedMood);
  });
});

// document.querySelectorAll('.other-btn').forEach(button => {
//   button.addEventListener('click', () => {
//     button.classList.toggle('active'); 
//     updateAttractions(); 
//   });
// });

document.querySelectorAll('#filter-panel > div:last-of-type .filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const label = btn.textContent.trim();
    if (selectedExtras.has(label)) {
      selectedExtras.delete(label);
      btn.classList.remove('selected');
    } else {
      selectedExtras.add(label);
      btn.classList.add('selected');
    }
    console.log("Wybrane dodatki:", Array.from(selectedExtras));
  });
});


timeSlider.noUiSlider.on("update", function (values) {
  timeOutput.textContent = values.join(" – ");
  selectedTimeRange = values;
});


  const distanceInput = document.getElementById('distance');
  const budgetInput = document.getElementById('budget');
  document.getElementById('search-button').addEventListener('click', () => {
    const filters = {
      Nastrój: selectedMood,
      Dystans: distanceInput.value + " km",
      Budżet: budgetInput.value + " zł",
      "Godziny": selectedTimeRange ? selectedTimeRange.join(" – ") : "nie wybrano",
      Dodatki: Array.from(selectedExtras).join(", ") || "brak"
    };

    if (selectedTimeRange) {
        const startHour = parseInt(selectedTimeRange[0]);
        const endHour = parseInt(selectedTimeRange[1]);
        console.log("Wybrane godziny:", startHour, endHour);

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function (position) {
            userLat = position.coords.latitude;
            userLon = position.coords.longitude;
            // checkRainInTimeRange(userLat, userLon, startHour, endHour);
          }, function (error) {
            console.error("Błąd geolokalizacji:", error);
          });
        } else {
          alert("Twoja przeglądarka nie obsługuje geolokalizacji.");
        }     
    }

    console.log("Wybrane filtry:");
    console.table(filters);
    // alert("Wybrane filtry:\n" + Object.entries(filters).map(([k, v]) => `${k}: ${v}`).join("\n"));
    
    document.getElementById('filter-panel').style.display = 'none';
    document.getElementById('filter-toggle-bar').style.display = 'block';
  
  });

  document.getElementById('filter-toggle-bar').addEventListener('click', () => {
  document.getElementById('filter-panel').style.display = 'block';
  document.getElementById('filter-toggle-bar').style.display = 'none';

  const carousel = document.getElementById('attraction-carousel');
  if (carousel) {
    carousel.style.display = 'none';
  }
  if (markersLayer && Array.isArray(markersLayer)) {
    markersLayer.forEach(marker => marker.setMap(null));
    markersLayer = null;
  }
});

  

  function getDistanceInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // promień Ziemi w km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // let markersLayer = null;
  let markersLayer = [];

  function getSelectedOthers() {
  return Array.from(document.querySelectorAll('.other-btn.active'))
    .map(btn => btn.dataset.value);
}

//dodane0
function doTimeRangesOverlap(userStartHour, userEndHour, openStr, closeStr) {
  if (openStr === "brak" || closeStr === "brak") {
    return true;
  }

  const parseHour = str => parseInt(str.split(":")[0]);
  const openHour = parseHour(openStr);
  const closeHour = parseHour(closeStr);

  return !(userEndHour <= openHour || userStartHour >= closeHour);
}

function displayAttractionsInCarousel(features) {
  const carousel = document.getElementById('attraction-carousel');
  if (!carousel) return;

  if (!features || features.length === 0) {
    carousel.style.display = 'none';
    return;
  }

  carousel.innerHTML = '';

  features.forEach((feature, index) => {
    const props = feature.properties || {};
    const name = props.name || "Brak nazwy";
    const address = props.address || props.vicinity || "Brak adresu";
    const open = props.open?.toLowerCase() === "brak" ? null : props.open;
    const closed = props.closed?.toLowerCase() === "brak" ? null : props.closed;

    const godziny = (open && closed) ? `${open} – ${closed}` : "brak godzin";

    let imageName = "default.jpg";
    if (Array.isArray(props.zdj) && props.zdj.length > 0) {
      imageName = props.zdj[0]; // możesz też dać losowe: props.zdj[Math.floor(Math.random() * props.zdj.length)]
    }

    const imagePath = `zdj/${imageName}`;
    const featureId = props.id || `feature-${index}`;

    const card = document.createElement('div');
    card.className = 'carousel-card';
    card.id = `carousel-card-${featureId}`;
    card.innerHTML = `
      <img src="${imagePath}" alt="${name}" class="carousel-image">
      <strong>${name}</strong><br>
      <span>${address}</span><br>
    `;

    card.addEventListener('click', () => {
      showAttractionInfoPanel(feature);
    });

    carousel.appendChild(card);
  });

  carousel.style.display = 'flex';
}



// function displayAttractionsInCarousel(features) {
//   const carousel = document.getElementById('attraction-carousel');
//   if (!carousel) return;
 
//   if (!features || features.length === 0) {
//     carousel.style.display = 'none';
//     return;
//   }
 
//   carousel.innerHTML = ''; // Wyczyść poprzednie
 
//   features.forEach(feature => {
//     const props = feature.properties || {};
//     const name = props.name || "Brak nazwy";
//     const address = props.address || props.vicinity || "Brak adresu";
//     const imageName = props.zdj || "default.jpg"; // jeśli brak zdjęcia, użyj domyślnego
//     const imagePath = `zdj/${imageName}`; // ścieżka do zdjęcia
//     const featureId = props.id || `feature-${index}`;

//     const card = document.createElement('div');
//     card.className = 'carousel-card';
//     card.id = `carousel-card-${featureId}`;
//     card.innerHTML = `
//       <img src="${imagePath}" alt="${name}" class="carousel-image">
//       <strong>${name}</strong><br>
//       <span>${address}</span>
//     `;
//     carousel.appendChild(card);
//   });
 
//   carousel.style.display = 'flex';
// }
 
 
window.addEventListener('DOMContentLoaded', () => {
  const carousel = document.getElementById('attraction-carousel');
  if (carousel) {
    carousel.style.display = 'none';
  }
});


window.addEventListener('DOMContentLoaded', () => {
  const carousel = document.getElementById('attraction-carousel');
  if (carousel) {
    carousel.style.display = 'none'; // ukryj po odświeżeniu
  }
});

function showAttractionInfoPanel(feature) {
  const panel = document.getElementById('attraction-info-panel');
  const title = document.getElementById('info-title');
  const gallery = document.getElementById('info-image-gallery');
  gallery.innerHTML = ''; // wyczyść poprzednie zdjęcia
  const desc = document.getElementById('info-description');
  const address = document.getElementById('info-address');
  const hours = document.getElementById('info-hours');
  const ratingDiv = document.getElementById('info-rating'); // ⬅️ dodane

  const props = feature.properties || {};

  title.textContent = props.name || "Brak nazwy";
  const images = Array.isArray(props.zdj) ? props.zdj : [props.zdj || 'default.jpg'];

  images.forEach(filename => {
  const img = document.createElement('img');
  img.src = `zdj/${filename}`;
  img.alt = props.name || "Zdjęcie atrakcji";
  gallery.appendChild(img);
  });

  desc.textContent = props.description || "Brak opisu.";
  address.textContent = "Adres: " + (props.address || props.vicinity || "brak danych");

  const open = props.open?.toLowerCase() === "brak" ? null : props.open;
  const closed = props.closed?.toLowerCase() === "brak" ? null : props.closed;

  if (open && closed) {
    hours.textContent = `Godziny otwarcia: ${open} – ${closed}`;
  } else {
    hours.textContent = `Godziny otwarcia: brak danych`;
  }

  const rating = parseFloat(props.rating || 0);
  const fullStars = Math.floor(rating);
  const maxStars = 5;

  ratingDiv.innerHTML = ''; // Wyczyść stare gwiazdki

  // Dodaj gwiazdki
  for (let i = 0; i < maxStars; i++) {
    const star = document.createElement('span');
    star.classList.add('star');
    if (i < fullStars) {
      star.classList.add('filled');
    }
    star.innerHTML = '★';
    ratingDiv.appendChild(star);
  }

  // Dodaj wartość liczbową
  const ratingValue = document.createElement('span');
  ratingValue.classList.add('rating-value');
  ratingValue.textContent = rating.toFixed(1); // np. 4.3
  ratingDiv.appendChild(ratingValue);
  panel.style.display = 'block';

  // Ukryj karuzelę
  const carousel = document.getElementById('attraction-carousel');
  if (carousel) {
    carousel.style.display = 'none';
  }

}


// document.getElementById('close-info-panel').addEventListener('click', () => {
//   document.getElementById('attraction-info-panel').style.display = 'none';
// });

document.getElementById('close-info-panel').addEventListener('click', () => {
  const panel = document.getElementById('attraction-info-panel');
  const carousel = document.getElementById('attraction-carousel');

  panel.style.display = 'none';

  // Pokaż karuzelę z powrotem
  if (carousel && carousel.children.length > 0) {
    carousel.style.display = 'flex';
  }
});


document.addEventListener('click', (event) => {
  const clickedElement = event.target;

  // Obsługa kliknięcia w przycisk panelu użytkownika
  if (clickedElement && clickedElement.id === 'user-panel-btn') {
    console.log('🟢 Kliknięto przycisk Panel użytkownika');
    const panel = document.getElementById('user-details-panel');
    if (panel) {
      panel.style.display = 'flex';
    } else {
      console.warn('⚠️ Nie znaleziono #user-details-panel');
    }
  }

  // Obsługa zamknięcia panelu
  if (clickedElement && clickedElement.id === 'close-user-details-btn') {
    console.log('🔴 Zamknięto panel użytkownika');
    const panel = document.getElementById('user-details-panel');
    if (panel) {
      panel.style.display = 'none';
    }
  }
});





function displayAttractionsInRange(userLat, userLon, maxDistanceKm, weatherCondition) {
  if (!attractionsData) {
    console.error("Dane atrakcji nie są jeszcze załadowane.");
    return;
  }

  const userBudget = parseInt(budgetInput.value);
  const selectedOthers = getSelectedOthers();

  const budgetOrder = [
    { name: "bezpłatny", min: 0, max: 0 },
    { name: "niski", min: 1, max: 50 },
    { name: "średni", min: 51, max: 120 },
    { name: "wysoki", min: 121, max: Infinity }
  ];

  const allowedBudgetLevels = budgetOrder
    .filter(level => userBudget >= level.min)
    .map(level => level.name);

  const [startHourStr, endHourStr] = timeSlider.noUiSlider.get();
  const userStartHour = parseInt(startHourStr.split(":")[0]);
  const userEndHour = parseInt(endHourStr.split(":")[0]);

  const filteredAttractions = attractionsData.features.filter(feature => {
    const { budget, mood, other = [] } = feature.properties;
    const [lon, lat] = feature.geometry.coordinates;
    const distance = getDistanceInKm(userLat, userLon, lat, lon);
    const moodMatch = !selectedMood || (Array.isArray(mood) && mood.includes(selectedMood));
    const budgetMatch = allowedBudgetLevels.includes(budget);
    const otherMatch = selectedOthers.length === 0 || selectedOthers.every(tag => other.includes(tag));
    const { open = "brak", closed = "brak" } = feature.properties;
    const timeMatch = doTimeRangesOverlap(userStartHour, userEndHour, open, closed);
    const { weather = [] } = feature.properties;
    const weatherMatch = !weatherCondition || weather.includes(weatherCondition);


    return (
      distance <= maxDistanceKm &&
      budgetMatch &&
      moodMatch &&
      otherMatch &&
      timeMatch&&
      weatherMatch
    );
  });

  console.log(`Znaleziono ${filteredAttractions.length} atrakcji w promieniu ${maxDistanceKm} km.`);

  // Markery na mapie
  if (markersLayer && Array.isArray(markersLayer)) {
    markersLayer.forEach(marker => marker.setMap(null)); 
  }

  const markers = filteredAttractions.map(feature => {
    const [lon, lat] = feature.geometry.coordinates;
    const name = feature.properties.name;
    const desc = feature.properties.description;
    const featureId = feature.properties.id || `feature-${index}`;
    // const marker = L.marker([lat, lon], { icon: customIcon }).bindPopup(`<strong>${name}</strong><br>${desc}`);
    const marker = new google.maps.Marker({
      position: { lat, lng: lon },
      title: name,
      icon: customIcon 
    });
    
    const infoWindow = new google.maps.InfoWindow({
      content: `<strong>${name}</strong><br>${desc}`
    });

    marker.addListener('click', () => {
      if (activeInfoWindow) {
        activeInfoWindow.close(); // zamyka poprzednie
      }

      infoWindow.open(map, marker); // otwiera nowe
      activeInfoWindow = infoWindow; // zapamiętuje to jako aktualnie otwarte

      // reszta twojego kodu: highlight, scroll, zmiana ikon
      const card = document.getElementById(`carousel-card-${featureId}`);
      const carousel = document.getElementById('attraction-carousel');
      if (activeMarker) {
        activeMarker.setIcon(customIcon);
      }

      marker.setIcon(selectedIcon);
      activeMarker = marker;

      if (card && carousel) {
        document.querySelectorAll('.carousel-card').forEach(el => el.classList.remove('highlight'));
        card.classList.add('highlight');
        carousel.style.display = 'flex';

        const cardOffsetLeft = card.offsetLeft;
        const cardWidth = card.offsetWidth;
        const carouselWidth = carousel.offsetWidth;

        const scrollTo = cardOffsetLeft - (carouselWidth / 2) + (cardWidth / 2);

        carousel.scrollTo({
          left: scrollTo,
          behavior: 'smooth'
        });
      }
    });
    
  return marker;
  });

  markersLayer = markers;
  markersLayer.forEach(marker => marker.setMap(map));

  // 🔁 Pokaż karuzelę
  displayAttractionsInCarousel(filteredAttractions);
}

// Obsługa kliknięcia w przycisk WYSZUKAJ
if (searchBtn) {
  searchBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
      console.error("Geolokalizacja nie jest obsługiwana.");
      return;
    }

    navigator.geolocation.getCurrentPosition(position => {
      const userLat = position.coords.latitude;
      const userLon = position.coords.longitude;

      showUserLocation(userLat, userLon);
      const distance = parseInt(distanceInput.value);
      const [startHourStr, endHourStr] = timeSlider.noUiSlider.get();
      const userStartHour = parseInt(startHourStr.split(":")[0]);
      const userEndHour = parseInt(endHourStr.split(":")[0]);
      checkRainInTimeRange(userLat, userLon, userStartHour, userEndHour, (weatherCondition) => {
        displayAttractionsInRange(userLat, userLon, distance, weatherCondition);
      });
    }, error => {
      console.error("Błąd pobierania lokalizacji:", error);
    });
  });
} else {
  console.error("Nie znaleziono przycisku 'search-button'");
}

});
