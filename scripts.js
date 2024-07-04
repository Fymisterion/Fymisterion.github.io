// scripts.js
document.addEventListener("DOMContentLoaded", function() {
  setInterval(getData, 5000); // Alle 5 Sekunden aktualisieren

  function getData() {
    fetch("http://192.168.1.50/") // IP des ESP32 hier eintragen
      .then(response => response.json())
      .then(data => {
        document.getElementById('tempValue').innerText = data.temperature.toFixed(1) + " °C";
        document.getElementById('humValue').innerText = data.humidity.toFixed(1) + " %";
      })
      .catch(error => console.error('Fehler beim Abrufen der Daten: ', error));
  }
});
