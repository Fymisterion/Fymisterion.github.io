// scripts.js
document.addEventListener("DOMContentLoaded", function() {
  setInterval(getData, 5000); // Alle 5 Sekunden aktualisieren

  function getData() {
    fetch("192.168.1.50") // IP des ESP32 hier eintragen
      .then(response => response.text())
      .then(data => {
        let parser = new DOMParser();
        let htmlDoc = parser.parseFromString(data, 'text/html');
        let tempValue = htmlDoc.getElementById('tempValue');
        let humValue = htmlDoc.getElementById('humValue');

        if (tempValue && humValue) {
          tempValue.innerText = htmlDoc.querySelector('p').innerText;
          humValue.innerText = htmlDoc.querySelectorAll('p')[1].innerText;
        }
      })
      .catch(error => console.error('Fehler beim Abrufen der Daten: ', error));
  }
});
