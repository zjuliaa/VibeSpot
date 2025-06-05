window.contentMap = {
  favorites: `
    <style>
      .subscription-title {
        font-size: 1.8em;
        font-weight: 700;
        color: #000000;
        margin-bottom: 0.5em;
      }
      .subscription-text {
        color: #563b29;
        font-size: 1em;
        margin: 0.4em 0;
      }
      .subscription-note {
        font-size: 0.85em;
        color: #7a563f;
        margin-top: 2em;
        text-align: left;
      }
    </style>

    <h3 class="subscription-title">Twoje polubione miejsca</h3>
    <p class="subscription-text">Tutaj znajdziesz listę miejsc, które oznaczyłeś jako ulubione.</p>
    <p class="subscription-note"><em>*Funkcja dostępna tylko dla użytkowników premium</em></p>
  `,
  recent:`
  <style>
    .subscription-title {
      font-size: 1.8em;
      font-weight: 700;
      color: #000000;
      margin-bottom: 0.3em;
    }
    .subscription-subtitle {
      font-size: 1.2em;
      font-weight: 600;
      color: #4a4a4a;
      margin-bottom: 0.8em;
    }
    .subscription-text {
      color: #563b29;
      font-size: 1em;
      margin: 0.2em 0;
    }
    #start-subscription-btn {
      padding: 10px 20px;
      background-color: #563b29;
      color: #fff;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: bold;
      margin-top: 1em;
      transition: background-color 0.3s ease;
    }
    #start-subscription-btn:hover {
      background-color: #7a563f;
    }
  </style>
  <h3 class="subscription-title">Ostatnio odwiedzane</h3>
  <p class="subscription-text">Tu zobaczysz miejsca, które ostatnio odwiedziłeś.</p>
`,
  subscription: `
  <style>
    .subscription-title {
      font-size: 1.8em;
      font-weight: 700;
      color: #000000;
      margin-bottom: 0.3em;
    }
    .subscription-subtitle {
      font-size: 1.2em;
      font-weight: 600;
      color: #4a4a4a;
      margin-bottom: 0.8em;
    }
    .subscription-text {
      color: #563b29;
      font-size: 1em;
      margin: 0.2em 0;
    }
    #start-subscription-btn {
      padding: 10px 20px;
      background-color: #563b29;
      color: #fff;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: bold;
      margin-top: 1em;
      transition: background-color 0.3s ease;
    }
    #start-subscription-btn:hover {
      background-color: #7a563f;
    }
  </style>
  <h3 class="subscription-title">Zarządzaj subskrypcją</h3>
  <h4 class="subscription-subtitle">Brak aktywnej subskrypcji</h4>
  <p class="subscription-text">W ramach subskrypcji zyskujesz:</p>
  <p class="subscription-text"> - Brak reklam</p>
  <p class="subscription-text"> - Możliwość przeglądania i dodawania komentarzy</p>
  <p class="subscription-text"> - Możliwość dodawania miejsc do ulubionych</p>
  <h4 class="subscription-subtitle">Koszt subskrypcji:12,99 zł / miesiąc</h4>
  <h4 class="subscription-subtitle">Anulowanie w dowolnym momencie</h4>
  <button id="start-subscription-btn">Wypróbuj przez jeden miesiąc za 12,99 zł</button>
`,

  reset: `
  <style>
    .reset-title {
      font-size: 1.8em;
      font-weight: 700;
      color: #000000;
      margin-bottom: 0.5em;
    }
    .reset-text {
      font-size: 1em;
      color: #563b29;
      margin-bottom: 1em;
    }
    .reset-form label {
      display: block;
      margin-top: 0.8em;
      margin-bottom: 0.3em;
      font-weight: 600;
      color: #4a4a4a;
    }
    .reset-form input {
      width: 100%;
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 1em;
    }
    #reset-password-btn {
      margin-top: 1.5em;
      padding: 10px 20px;
      background-color: #563b29;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: bold;
      transition: background-color 0.3s ease;
    }
    #reset-password-btn:hover {
      background-color: #7a563f;
    }
    .reset-message {
      margin-top: 1em;
      font-size: 0.9em;
      color: green;
      display: none;
    }
  </style>

  <h3 class="reset-title">Resetuj hasło</h3>
  <p class="reset-text">Wprowadź nowe hasło i potwierdź je poniżej, aby zmienić swoje hasło.</p>

  <form class="reset-form" id="reset-password-form">
    <label for="new-password">Nowe hasło:</label>
    <input type="password" id="new-password" name="new-password" required minlength="6" placeholder="Minimum 6 znaków">

    <label for="confirm-password">Potwierdź nowe hasło:</label>
    <input type="password" id="confirm-password" name="confirm-password" required placeholder="Wpisz ponownie hasło">

    <button type="submit" id="reset-password-btn">Zresetuj hasło</button>
  </form>

  <p class="reset-message" id="reset-message">Hasło zostało pomyślnie zmienione!</p>

  <script>
    const form = document.getElementById('reset-password-form');
    const message = document.getElementById('reset-message');

    form.addEventListener('submit', e => {
      e.preventDefault();
      const newPass = form['new-password'].value;
      const confirmPass = form['confirm-password'].value;

      if (newPass !== confirmPass) {
        alert('Hasła nie są takie same. Spróbuj ponownie.');
        return;
      }

      // Tu możesz dodać rzeczywistą logikę zmiany hasła (np. zapytanie do serwera)
      
      message.style.display = 'block';
      form.reset();
    });
  </script>
`,
notifications: `
  <style>
    .notifications-title {
      font-size: 1.8em;
      font-weight: 700;
      color: #000000;
      margin-bottom: 0.5em;
    }
    .notifications-text {
      font-size: 1em;
      color: #563b29;
      margin-bottom: 1em;
    }
    .notification-option {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1em;
      font-size: 1em;
      color: #563b29;
    }
    
    /* Styl przełącznika (switch) */
    .switch {
      position: relative;
      display: inline-block;
      width: 50px;
      height: 28px;
    }
    .switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    .slider {
      position: absolute;
      cursor: pointer;
      top: 0; left: 0; right: 0; bottom: 0;
      background-color: #ccc;
      transition: .4s;
      border-radius: 28px;
    }
    .slider:before {
      position: absolute;
      content: "";
      height: 22px;
      width: 22px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
    }
    input:checked + .slider {
      background-color: #563b29;
    }
    input:checked + .slider:before {
      transform: translateX(22px);
    }

    #save-notifications-btn {
      padding: 10px 20px;
      background-color: #563b29;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: bold;
      transition: background-color 0.3s ease;
    }
    #save-notifications-btn:hover {
      background-color: #7a563f;
    }
    .notification-message {
      margin-top: 1em;
      font-size: 0.9em;
      color: green;
      display: none;
    }
  </style>

  <h3 class="notifications-title">Powiadomienia</h3>
  <p class="notifications-text">Wybierz, które powiadomienia chcesz otrzymywać.</p>

  <form id="notifications-form">
    <div class="notification-option">
      <label for="notif-comments">Powiadomienia o nowych komentarzach</label>
      <label class="switch">
        <input type="checkbox" id="notif-comments" name="notif-comments" checked>
        <span class="slider"></span>
      </label>
    </div>
    <div class="notification-option">
      <label for="notif-updates">Powiadomienia o aktualizacjach aplikacji</label>
      <label class="switch">
        <input type="checkbox" id="notif-updates" name="notif-updates" checked>
        <span class="slider"></span>
      </label>
    </div>
    <div class="notification-option">
      <label for="notif-offers">Powiadomienia o promocjach i ofertach specjalnych</label>
      <label class="switch">
        <input type="checkbox" id="notif-offers" name="notif-offers">
        <span class="slider"></span>
      </label>
    </div>
  </form>

`
,
settings: `
  <style>
    .settings-title {
      font-size: 1.8em;
      font-weight: 700;
      color: #000000;
      margin-bottom: 0.5em;
    }
    .settings-text {
      font-size: 1em;
      color: #563b29;
      margin-bottom: 1em;
    }
    form.settings-form {
      display: flex;
      flex-direction: column;
      max-width: 400px;
    }
    label {
      margin-bottom: 0.3em;
      font-weight: 600;
      color: #563b29;
    }
    input, select {
      padding: 8px 10px;
      margin-bottom: 1em;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 1em;
      color: #333;
    }
    input:focus, select:focus {
      outline: none;
      border-color: #563b29;
      box-shadow: 0 0 5px rgba(86,59,41,0.5);
    }
    .button-wrapper {
      margin: 2em 0;
    }
    #start-subscription-btn {
      padding: 12px 25px;
      background: linear-gradient(135deg, #6b4c2a, #8a623d);
      color: #fff;
      border: none;
      border-radius: 30px;
      cursor: pointer;
      font-weight: 700;
      font-size: 1.1em;
      box-shadow: 0 4px 10px rgba(86, 59, 41, 0.5);
      transition: background 0.3s ease, box-shadow 0.3s ease, transform 0.2s ease;
      user-select: none;
      display: inline-block;
    }
    #start-subscription-btn:hover {
      background: linear-gradient(135deg, #8a623d, #6b4c2a);
      box-shadow: 0 6px 14px rgba(86, 59, 41, 0.7);
      transform: translateY(-2px);
    }
    #start-subscription-btn:active {
      transform: translateY(1px);
      box-shadow: 0 3px 8px rgba(86, 59, 41, 0.4);
    }

    .privacy-settings {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 1em;
      margin-top: 2em;
      max-width: 420px;
      background-color: #fdf9f5;
    }

    .privacy-settings h4 {
      font-size: 1.2em;
      margin-bottom: 0.8em;
      color: #563b29;
    }

    .privacy-settings label {
      display: flex;
      align-items: center;
      margin-bottom: 0.5em;
      font-weight: normal;
      color: #333;
    }

    .privacy-settings input[type="radio"] {
      margin-right: 0.6em;
    }
  </style>

  <h3 class="settings-title">Ustawienia konta</h3>
  <p class="settings-text">Zmień swoje dane konta poniżej.</p>

  <form id="settings-form" class="settings-form">
    <label for="user-name">Imię i nazwisko</label>
    <input type="text" id="user-name" name="user-name" value="" required>
  </form>

  <div class="button-wrapper">
    <button id="start-subscription-btn">Zmień zdjęcie profilowe</button>
  </div>

  <div class="privacy-settings">
    <h4>Ustawienia prywatności</h4>

    <label>
      <input type="radio" name="privacy" value="public" checked>
      Profil publiczny — widoczny dla wszystkich
    </label>

    <label>
      <input type="radio" name="privacy" value="friends">
      Widoczny tylko dla znajomych
    </label>

    <label>
      <input type="radio" name="privacy" value="private">
      Profil prywatny — widoczny tylko dla mnie
    </label>
  </div>
`
,
  help: `
  <style>
    .help-title {
      font-size: 1.8em;
      font-weight: 700;
      color: #000000;
      margin-bottom: 0.5em;
    }
    .help-subtitle {
      font-size: 1.1em;
      color: #563b29;
      margin-bottom: 1.5em;
    }
    .faq-section {
      margin-bottom: 2em;
      max-width: 600px;
    }
    .faq-question {
      font-weight: 600;
      margin: 0.8em 0 0.3em;
      color: #4a3222;
    }
    .faq-answer {
      font-size: 0.95em;
      color: #444;
      line-height: 1.5em;
      margin-bottom: 1em;
    }
    .contact-support {
      padding: 14px 30px;
      background-color: #563b29;
      color: white;
      border: none;
      border-radius: 30px;
      cursor: pointer;
      font-weight: bold;
      font-size: 1.05em;
      transition: background-color 0.3s ease, box-shadow 0.3s ease;
    }
    .contact-support:hover {
      background-color: #7a563f;
      box-shadow: 0 4px 10px rgba(86, 59, 41, 0.4);
    }
    .contact-info {
      margin-top: 2em;
      font-size: 0.95em;
      color: #333;
    }
  </style>

  <h3 class="help-title">Centrum Pomocy</h3>
  <p class="help-subtitle">Masz pytanie? Znajdziesz tutaj najczęściej zadawane pytania lub skontaktuj się z nami bezpośrednio.</p>

  <div class="faq-section">
    <div>
      <p class="faq-question">Jak mogę zresetować hasło?</p>
      <p class="faq-answer">Przejdź do zakładki „Resetuj hasło” w ustawieniach konta. Wpisz nowe hasło, a następnie je potwierdź.</p>
    </div>
    <div>
      <p class="faq-question">Jak działa wersja premium?</p>
      <p class="faq-answer">Premium umożliwia dostęp do dodatkowych funkcji jak ulubione miejsca, zaawansowane ustawienia i personalizowane powiadomienia.</p>
    </div>
    <div>
      <p class="faq-question">Nie otrzymałem maila potwierdzającego – co zrobić?</p>
      <p class="faq-answer">Sprawdź folder spam lub spróbuj ponownie wysłać potwierdzenie z ustawień konta. W razie problemów skontaktuj się z nami.</p>
    </div>
  </div>

  <button class="contact-support">Skontaktuj się z nami</button>

  <div class="contact-info">
    <p>Preferujesz kontakt bezpośredni? Napisz na: <strong>vibespotapp@gmail.com</strong></p>
    <p>Czas odpowiedzi: zwykle w ciągu 24 godzin (dni robocze)</p>
  </div>
`};


