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
    const tempCtx = document.getElementById('tempGauge').getContext('2d');
    const humCtx = document.getElementById('humGauge').getContext('2d');

    let chart;
    let tempGauge;
    let humGauge;

    function createGauge(ctx, label, color, maxValue) {
        return new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [label],
                datasets: [{
                    data: [0, maxValue],
                    backgroundColor: [color, '#e0e0e0'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                rotation: 1 * Math.PI,
                circumference: 1 * Math.PI,
                cutoutPercentage: 80,
                plugins: {
                    datalabels: {
                        display: true,
                        formatter: function (value, context) {
                            return context.chart.data.datasets[0].data[0] + '%';
                        },
                        color: '#000',
                        backgroundColor: '#fff',
                        borderRadius: 3,
                        font: {
                            weight: 'bold',
                            size: 16
                        }
                    }
                }
            },
            plugins: [ChartDataLabels]
        });
    }

    function fetchData() {
        fetch('http://deine-esp32-ip-adresse/') // Hier die IP-Adresse deines ESP32 oder den DDNS-Domainnamen eintragen
            .then(response => response.json())
            .then(data => {
                updateGauge(tempGauge, data.temperature);
                updateGauge(humGauge, data.humidity);
                updateLEDs(data.pumpStatus);
                updateChart(data.history);
            })
            .catch(error => console.error('Error fetching data:', error));
    }

    function updateGauge(gauge, value) {
        gauge.data.datasets[0].data[0] = value;
        gauge.data.datasets[0].data[1] = gauge.data.datasets[0].data[1] - value;
        gauge.update();
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

    tempGauge = createGauge(tempCtx, 'Temperatur', 'red', 50);
    humGauge = createGauge(humCtx, 'Luftfeuchtigkeit', 'blue', 100);

    setInterval(fetchData, 5000);
    fetchData();
});
