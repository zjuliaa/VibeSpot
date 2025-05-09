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
        document.querySelector('.login-box').style.display = 'none';
        showUserPanel(user);
      })
      .catch(error => {
        if (error.code === 'auth/popup-closed-by-user') {
          alert("Zamknąłeś okno logowania przed jego zakończeniem.");
        } else {
          console.error("Błąd logowania:", error);
        }
      });
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

});
