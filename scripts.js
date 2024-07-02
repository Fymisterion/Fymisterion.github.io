document.addEventListener('DOMContentLoaded', function () {
    const tempElement = document.getElementById('temp');
    const humElement = document.getElementById('hum');
    const ledElements = [
        document.getElementById('led1'),
        document.getElementById('led2'),
        document.getElementById('led3'),
        document.getElementById('led4')
    ];
    const intervalElement = document.getElementById('interval');
    const ctx = document.getElementById('chart').getContext('2d');

    let chart;

    function fetchData() {
        fetch('http://deine-esp32-ip-adresse/') // Hier die IP-Adresse deines ESP32 oder den DDNS-Domainnamen eintragen
            .then(response => response.json())
            .then(data => {
                tempElement.textContent = data.temperature;
                humElement.textContent = data.humidity;
                updateLEDs(data.pumpStatus);
                updateChart(data.history);
            })
            .catch(error => console.error('Error fetching data:', error));
    }

    function updateLEDs(pumpStatus) {
        pumpStatus.forEach((status, index) => {
            if (status === 1) {
                ledElements[index].classList.remove('gray');
                ledElements[index].classList.add('green');
            } else {
                ledElements[index].classList.remove('green');
                ledElements[index].classList.add('gray');
            }
        });
    }

    function updateChart(historyData) {
        const interval = intervalElement.value;
        const filteredData = filterHistoryData(historyData, interval);

        if (chart) {
            chart.destroy();
        }

        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: filteredData.labels,
                datasets: [{
                    label: 'Temperatur',
                    data: filteredData.temperature,
                    borderColor: 'blue',
                    fill: false
                }, {
                    label: 'Luftfeuchtigkeit',
                    data: filteredData.humidity,
                    borderColor: 'green',
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'hour'
                        }
                    },
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    function filterHistoryData(historyData, interval) {
        const now = new Date();
        let filteredData = {
            labels: [],
            temperature: [],
            humidity: []
        };

        historyData.forEach(entry => {
            const entryDate = new Date(entry.timestamp);
            if (isWithinInterval(entryDate, now, interval)) {
                filteredData.labels.push(entryDate);
                filteredData.temperature.push(entry.temperature);
                filteredData.humidity.push(entry.humidity);
            }
        });

        return filteredData;
    }

    function isWithinInterval(date, now, interval) {
        const diff = now - date;
        switch (interval) {
            case '1H':
                return diff <= 3600000;
            case '4H':
                return diff <= 14400000;
            case '1D':
                return diff <= 86400000;
            case '1W':
                return diff <= 604800000;
            default:
                return false;
        }
    }

    intervalElement.addEventListener('change', fetchData);

    setInterval(fetchData, 5000);
    fetchData();
});
