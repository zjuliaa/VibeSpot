document.addEventListener('DOMContentLoaded', function () {
  const map = L.map('map').setView([52.2297, 21.0122], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  let userLat = null;
  let userLon = null;

  const customIcon = L.icon({
  iconUrl: 'Vector.svg',  
  iconSize: [32, 32],             
  iconAnchor: [16, 32],           
  popupAnchor: [0, -32]           
});

const selectedIcon = L.icon({
  iconUrl: 'Vector-selected.svg',  
  iconSize: [60, 40],             
  iconAnchor: [30,40],           
  popupAnchor: [0, 0]           
});

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
    if (userLocationMarker) {
      userLocationMarker.setLatLng([lat, lon]);
    } else {
      userLocationMarker = L.marker([lat, lon], { icon: customIcon }).addTo(map);
    }
    map.setView([lat, lon], 13);
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

  if (infoPanel) {
    infoPanel.style.display = 'block';
  }

  if (user) {
    showUserPanel(user);
    if (loginBox) loginBox.style.display = 'none';
    if (filterPanel) filterPanel.style.display = 'none';
  } else {
    if (loginBox) loginBox.style.display = 'none';
    if (filterPanel) filterPanel.style.display = 'none';
    if (userInitials) userInitials.style.display = 'none';
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
      const filterPanel = document.getElementById('filter-panel');
      if (filterPanel) {
        filterPanel.style.display = 'none';
      }
      const carousel = document.getElementById('attraction-carousel');
      if (carousel) {
        carousel.style.display = 'none';
        carousel.innerHTML = '';
      }
       if (markersLayer) {
        map.removeLayer(markersLayer);
        markersLayer = null;
      }
      const weatherInfo = document.getElementById('weather-info');
      if (weatherInfo) {
        weatherInfo.style.display = 'none';
      }

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
  if (markersLayer) {
    map.removeLayer(markersLayer);
    markersLayer = null; // opcjonalnie wyczyść referencję, żeby mieć pewność, że są usunięte
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

  let markersLayer = null;

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
 
  carousel.innerHTML = ''; // Wyczyść poprzednie
 
  features.forEach(feature => {
    const props = feature.properties || {};
    const name = props.name || "Brak nazwy";
    const address = props.address || props.vicinity || "Brak adresu";
    const imageName = props.zdj || "default.jpg"; // jeśli brak zdjęcia, użyj domyślnego
    const imagePath = `zdj/${imageName}`; // ścieżka do zdjęcia
    const featureId = props.id || `feature-${index}`;

    const card = document.createElement('div');
    card.className = 'carousel-card';
    card.id = `carousel-card-${featureId}`;
    card.innerHTML = `
      <img src="${imagePath}" alt="${name}" class="carousel-image">
      <strong>${name}</strong><br>
      <span>${address}</span>
    `;
    carousel.appendChild(card);
  });
 
  carousel.style.display = 'flex';
}
 
 
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
  if (markersLayer) {
    map.removeLayer(markersLayer);
  }

  const markers = filteredAttractions.map(feature => {
    const [lon, lat] = feature.geometry.coordinates;
    const name = feature.properties.name;
    const desc = feature.properties.description;
    const featureId = feature.properties.id || `feature-${index}`;
    const marker = L.marker([lat, lon], { icon: customIcon }).bindPopup(`<strong>${name}</strong><br>${desc}`);
    marker.on('click', () => {
      const card = document.getElementById(`carousel-card-${featureId}`);
      const carousel = document.getElementById('attraction-carousel');
      if (activeMarker) {
        activeMarker.setIcon(customIcon);
      }

       marker.setIcon(selectedIcon);
      activeMarker = marker;

      if (card&& carousel) {
        document.querySelectorAll('.carousel-card').forEach(el => el.classList.remove('highlight')); // usuń stare podświetlenia
        card.classList.add('highlight'); // dodaj podświetlenie
        carousel.style.display = 'flex';
        // card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      // const carouselRect = carousel.getBoundingClientRect();
      // const cardRect = card.getBoundingClientRect();
      // const offset = cardRect.left - carouselRect.left - (carouselRect.width / 2) + (cardRect.width / 2);

      // carousel.scrollBy({
      //   left: offset,
      //   behavior: 'smooth'
      // });
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

  markersLayer = L.layerGroup(markers).addTo(map);

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
