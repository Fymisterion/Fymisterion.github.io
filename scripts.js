document.addEventListener('DOMContentLoaded', function () {
    const intervalElement = document.getElementById('interval');
    const tempElement = document.getElementById('tempValue');
    const humElement = document.getElementById('humValue');
    const moistureElements = [
        document.getElementById('moistureValue1'),
        document.getElementById('moistureValue2'),
        document.getElementById('moistureValue3'),
        document.getElementById('moistureValue4')
    ];

    const ledElements = [
        document.getElementById('led1'),
        document.getElementById('led2'),
        document.getElementById('led3'),
        document.getElementById('led4')
    ];

    const ctx = document.getElementById('chart').getContext('2d');

    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Temperature',
                    data: [],
                    borderColor: '#FF6384',
                    backgroundColor: '#FF6384',
                    fill: false,
                    yAxisID: 'y-axis-1',
                },
                {
                    label: 'Humidity',
                    data: [],
                    borderColor: '#36A2EB',
                    backgroundColor: '#36A2EB',
                    fill: false,
                    yAxisID: 'y-axis-2',
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                yAxes: [
                    {
                        id: 'y-axis-1',
                        type: 'linear',
                        position: 'left',
                    },
                    {
                        id: 'y-axis-2',
                        type: 'linear',
                        position: 'right',
                        gridLines: {
                            drawOnChartArea: false,
                        },
                    }
                ]
            }
        }
    });

    const webSocket = new WebSocket('wss://192.168.1.184:81');

    webSocket.onopen = function () {
        console.log('WebSocket connection established');
    };

    webSocket.onmessage = function (event) {
        const data = JSON.parse(event.data);

        tempElement.textContent = data.temperature.toFixed(1) + ' °C';
        humElement.textContent = data.humidity.toFixed(1) + ' %';

        data.soilMoisture.forEach((value, index) => {
            moistureElements[index].textContent = value + ' %';
        });

        data.pumpStatus.forEach((status, index) => {
            ledElements[index].className = status ? 'led green' : 'led gray';
        });

        const currentTime = new Date();
        chart.data.labels.push(currentTime.toLocaleTimeString());
        chart.data.datasets[0].data.push(data.temperature);
        chart.data.datasets[1].data.push(data.humidity);

        if (chart.data.labels.length > 20) {
            chart.data.labels.shift();
            chart.data.datasets[0].data.shift();
            chart.data.datasets[1].data.shift();
        }

        chart.update();
    };

    intervalElement.addEventListener('change', function () {
        // Handle interval change if necessary
    });
});
const webSocket = new WebSocket('wss://192.168.1.50:81');

webSocket.onopen = function () {
    console.log('WebSocket connection established');
};

webSocket.onerror = function (error) {
    console.error('WebSocket error:', error);
};

webSocket.onclose = function () {
    console.log('WebSocket connection closed');
};

webSocket.onmessage = function (event) {
    console.log('WebSocket message received:', event.data);
    // Weitere Verarbeitung der empfangenen Daten hier
};
