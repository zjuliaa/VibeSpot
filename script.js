document.addEventListener('DOMContentLoaded', function () {
  const map = L.map('map').setView([52.2297, 21.0122], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  document.querySelector('.google-btn').addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
      .then(result => {
        const user = result.user;
        alert("Zalogowano jako: " + user.displayName);
        onUserLogin(user); // <- poprawne wywołanie
      })
      .catch(error => {
        if (error.code === 'auth/popup-closed-by-user') {
          alert("Zamknąłeś okno logowania przed jego zakończeniem.");
        } else {
          console.error("Błąd logowania:", error);
        }
      });
  });


  function onUserLogin(user) {
    // Ukryj login-box, pokaż info-panel
    document.querySelector('.login-box').style.display = 'none';
    document.getElementById('info-panel').style.display = 'block';
    document.getElementById('filter-panel').style.display = 'none';
  }

  // Obsługa kliknięcia "Zaczynamy!"
  document.getElementById('close-info-btn').addEventListener('click', () => {
    document.getElementById('info-panel').style.display = 'none';
    document.getElementById('filter-panel').style.display = 'block';
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
  
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      document.querySelector('.login-box').style.display = 'none';
      showUserPanel(user);
    } else {
      document.querySelector('.login-box').style.display = 'block';
      document.getElementById('user-initials').style.display = 'none';
      document.getElementById('user-menu').style.display = 'none';
      const filterPanel = document.getElementById('filter-panel');
      if (filterPanel) {
        filterPanel.style.display = 'none';
      }
    }
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
        // Dodaj kalendarz, jeśli jeszcze go nie ma
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
  
  let selectedCategory = null;

  const categoryLabels = ["Sportowa", "Kreatywna", "Kulturowa", "Kulinarna", "Imprezowa", "Towarzyska", "Blisko natury"];
  
  const categoryButtons = Array.from(document.querySelectorAll('.filter-btn')).filter(btn =>
    categoryLabels.includes(btn.textContent.trim())
  );
  
  categoryButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Usuń zaznaczenie ze wszystkich kategorii
      categoryButtons.forEach(b => b.classList.remove('selected-category'));
  
      // Zaznacz kliknięty przycisk
      btn.classList.add('selected');
  
      // Zapisz wybraną kategorię
      selectedCategory = btn.textContent.trim();
      console.log("Wybrana kategoria:", selectedCategory);
    });
  });

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


let selectedDate = null;

// Obsługa kliknięcia przycisków "dzisiaj", "jutro", "pojutrze", "inny termin"
document.querySelectorAll('.filter-btn').forEach(btn => {
  const text = btn.textContent.trim().toLowerCase();

  if (["dzisiaj", "jutro", "pojutrze", "inny termin"].includes(text)) {
    btn.addEventListener('click', () => {
      // Zresetuj zaznaczenia
      document.querySelectorAll('.filter-btn').forEach(b => {
        const t = b.textContent.trim().toLowerCase();
        if (["dzisiaj", "jutro", "pojutrze", "inny termin"].includes(t)) {
          b.classList.remove('selected');
        }
      });

      // Ustaw wybrany przycisk jako zaznaczony
      btn.classList.add('selected');

      if (text === "inny termin") {
        document.getElementById("calendar-container").style.display = "block";
      } else {
        document.getElementById("calendar-container").style.display = "none";
        selectedDate = text;
        console.log("Wybrano termin:", selectedDate);
      }
    });
  }
});

// Inicjalizacja flatpickr
flatpickr("#date-picker", {
  dateFormat: "Y-m-d",
  minDate: "today",
  locale: "pl",
  onChange: (selectedDates, dateStr) => {
    selectedDate = dateStr;
    console.log("Wybrano inny termin:", selectedDate);

    // Podświetl "inny termin"
    document.querySelectorAll('.filter-btn').forEach(b => {
      const t = b.textContent.trim().toLowerCase();
      if (["dzisiaj", "jutro", "pojutrze", "inny termin"].includes(t)) {
        b.classList.remove('selected');
      }
    });

    const otherBtn = Array.from(document.querySelectorAll('.filter-btn')).find(
      b => b.textContent.trim().toLowerCase() === "inny termin"
    );
    if (otherBtn) otherBtn.classList.add('selected');
  }
});


timeSlider.noUiSlider.on("update", function (values) {
  timeOutput.textContent = values.join(" – ");
  selectedTimeRange = values;
});



  document.getElementById('search-button').addEventListener('click', () => {
    if (selectedCategory) {
      console.log("Użytkownik wybrał kategorię:", selectedCategory);
      // możesz tu filtrować wydarzenia lub wywołać funkcję API itp.
    } else {
      alert("Wybierz kategorię przed wyszukiwaniem.");
    }
  });
  const distanceInput = document.getElementById('distance');
  const budgetInput = document.getElementById('budget');
  document.getElementById('search-button').addEventListener('click', () => {
    if (!selectedCategory) {
      alert("Wybierz kategorię przed wyszukiwaniem.");
      return;
    }
  
    const filters = {
      Kategoria: selectedCategory,
      Nastrój: selectedMood,
      Dystans: distanceInput.value + " km",
      Budżet: budgetInput.value + " zł",
      Termin: selectedDate || "nie wybrano",
      "Godziny": selectedTimeRange ? selectedTimeRange.join(" – ") : "nie wybrano",
      Dodatki: Array.from(selectedExtras).join(", ") || "brak"
    };
  
    console.log("Wybrane filtry:");
    console.table(filters);
    alert("Wybrane filtry:\n" + Object.entries(filters).map(([k, v]) => `${k}: ${v}`).join("\n"));
  });
  


});
