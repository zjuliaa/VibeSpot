document.addEventListener('DOMContentLoaded', function () {
  const map = L.map('map').setView([52.2297, 21.0122], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);


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
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=pl`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        const weatherDiv = document.getElementById('weather-info');
        const temp = data.main.temp;
        const description = data.weather[0].description;
        const icon = data.weather[0].icon;
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
  function showUserLocation(lat, lon) {
    console.log("Pokazuję lokalizację użytkownika na mapie:", lat, lon);  
    if (userLocationMarker) {
      userLocationMarker.setLatLng([lat, lon]);
    } else {
      userLocationMarker = L.marker([lat, lon]).addTo(map);
    }
    map.setView([lat, lon], 13);
    fetchWeather(lat, lon);
  }

  function getUserLocation() {
    console.log("Wywołano getUserLocation()"); 
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        console.log('Lokalizacja użytkownika:', lat, lon);  
        showUserLocation(lat, lon);
      }, function(error) {
        console.error("Błąd pobierania lokalizacji: ", error);  
      });
    } else {
      console.error("Geolokalizacja nie jest obsługiwana przez tę przeglądarkę.");
    }
  }


  // if (searchBtn) {
  //   searchBtn.addEventListener('click', () => {
  //     console.log("Kliknięto przycisk Wyszukaj");
  //     getUserLocation(); 
  //   });
  // } else {
  //   console.error("Nie znaleziono przycisku 'search-button'");
  // }

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
    alert("Wybrane filtry:\n" + Object.entries(filters).map(([k, v]) => `${k}: ${v}`).join("\n"));

    document.getElementById('filter-panel').style.display = 'none';
    document.getElementById('filter-toggle-bar').style.display = 'block';

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) {
        const userLat = position.coords.latitude;
        const userLon = position.coords.longitude;

        showUserLocation(userLat, userLon); // już masz tę funkcję
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
    firebase.auth().signInWithPopup(provider)
      .then(result => {
        const user = result.user;
        alert("Zalogowano jako: " + user.displayName);
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
    document.getElementById('info-panel').style.display = 'block';
    document.getElementById('filter-panel').style.display = 'none';
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
  
  const infoPanel = document.getElementById('info-panel');
  const filterPanel = document.getElementById('filter-panel');
    firebase.auth().onAuthStateChanged(user => {
    if (user) {
      document.querySelector('.login-box').style.display = 'none';
      showUserPanel(user);
    } else {
      document.querySelector('.login-box').style.display = 'block';
      document.getElementById('user-initials').style.display = 'none';
      document.getElementById('user-menu').style.display = 'none';
      if (userLocationMarker){
        map.removeLayer(userLocationMarker);
        userLocationMarker=null;
      }
    }
    if (filterToggleBar) filterToggleBar.style.display = 'none';
    if (infoPanel) infoPanel.style.display = 'none';
  });


  const logoutButtonMenu = document.getElementById('logout-btn-menu');
if (logoutButtonMenu) {
  console.log("Przycisk wylogowania (menu) załadowany!");
  logoutButtonMenu.addEventListener('click', () => {
    console.log("Kliknięto przycisk wylogowania (menu)!");
    firebase.auth().signOut().then(() => {
      console.log("Użytkownik został wylogowany");
      document.querySelector('.user-panel').style.display = 'none';
      document.querySelector('.login-box').style.display = 'block';
      document.getElementById('user-initials').style.display = 'none';
      document.getElementById('user-menu').style.display = 'none';
      const filterPanel = document.getElementById('filter-panel');
      if (filterPanel) {
        filterPanel.style.display = 'none';
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
  
    console.log("Wybrane filtry:");
    console.table(filters);
    alert("Wybrane filtry:\n" + Object.entries(filters).map(([k, v]) => `${k}: ${v}`).join("\n"));
    
    document.getElementById('filter-panel').style.display = 'none';
    document.getElementById('filter-toggle-bar').style.display = 'block';
  
  });

  document.getElementById('filter-toggle-bar').addEventListener('click', () => {
  document.getElementById('filter-panel').style.display = 'block';
  document.getElementById('filter-toggle-bar').style.display = 'none';
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

  function budgetCategoryToRange(category) {
    if (category === "bezpłatny") return [0, 0];
    if (category === "niski") return [1, 50];
    if (category === "średni") return [51, 120];
    if (category === "wysoki") return [121, 200];
    return [0, Infinity];
  }

  let markersLayer = null;

  // Główna funkcja do filtrowania i pokazywania atrakcji
  function displayAttractionsInRange(userLat, userLon, maxDistanceKm) {
    if (!attractionsData) {
      console.error("Dane atrakcji nie są jeszcze załadowane.");
      return;
    }

    const userBudget = parseInt(budgetInput.value);

    const filteredAttractions = attractionsData.features.filter(feature => {
      const { budget, mood } = feature.properties;
      const [lon, lat] = feature.geometry.coordinates;
      const distance = getDistanceInKm(userLat, userLon, lat, lon);

      const [minBudget, maxBudget] = budgetCategoryToRange(budget);

      return (
        distance <= maxDistanceKm &&
        userBudget >= minBudget && userBudget <= maxBudget &&
        (!selectedMood || mood.includes(selectedMood))
      );
    });

    console.log(`Znaleziono ${filteredAttractions.length} atrakcji w promieniu ${maxDistanceKm} km.`);

    // Usuń poprzednie markery
    if (markersLayer) {
      map.removeLayer(markersLayer);
    }

    const markers = filteredAttractions.map(feature => {
      const [lon, lat] = feature.geometry.coordinates;
      const name = feature.properties.name;
      const desc = feature.properties.description;
      return L.marker([lat, lon]).bindPopup(`<strong>${name}</strong><br>${desc}`);
    });

    markersLayer = L.layerGroup(markers).addTo(map);
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

        showUserLocation(userLat, userLon); // pokaż marker użytkownika
        const distance = parseInt(distanceInput.value);
        displayAttractionsInRange(userLat, userLon, distance); // pokaż atrakcje
      }, error => {
        console.error("Błąd pobierania lokalizacji:", error);
      });
    });
  } else {
    console.error("Nie znaleziono przycisku 'search-button'");
  }



});
