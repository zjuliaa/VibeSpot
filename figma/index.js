function initMapWithStyle(styleJson) {
  const map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 52.2297, lng: 21.0122 },
    zoom: 13,
    styles: styleJson,
    disableDefaultUI: true
  });
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