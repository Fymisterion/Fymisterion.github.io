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

    const webSocket = new WebSocket('ws://192.168.1.50:81');

    webSocket.onopen = function () {
        console.log('WebSocket connection established');
    };

    webSocket.onmessage = function (event) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(event.data, "text/xml");

        const temp = parseFloat(xmlDoc.getElementsByTagName('temperature')[0].textContent);
        const hum = parseFloat(xmlDoc.getElementsByTagName('humidity')[0].textContent);
        const soilMoisture = [
            parseInt(xmlDoc.getElementsByTagName('soilMoisture1')[0].textContent),
            parseInt(xmlDoc.getElementsByTagName('soilMoisture2')[0].textContent),
            parseInt(xmlDoc.getElementsByTagName('soilMoisture3')[0].textContent),
            parseInt(xmlDoc.getElementsByTagName('soilMoisture4')[0].textContent)
        ];
        const pumpStatus = [
            parseInt(xmlDoc.getElementsByTagName('pumpStatus1')[0].textContent),
            parseInt(xmlDoc.getElementsByTagName('pumpStatus2')[0].textContent),
            parseInt(xmlDoc.getElementsByTagName('pumpStatus3')[0].textContent),
            parseInt(xmlDoc.getElementsByTagName('pumpStatus4')[0].textContent)
        ];

        updateValues({temperature: temp, humidity: hum, soilMoisture, pumpStatus});
        updateChart({temperature: temp, humidity: hum});
        updateLedStatus({pumpStatus});
    };

    webSocket.onclose = function () {
        console.log('WebSocket connection closed');
    };

    function updateValues(data) {
        tempElement.textContent = `${data.temperature.toFixed(1)} °C`;
        humElement.textContent = `${data.humidity.toFixed(1)} %`;

        for (let i = 0; i < 4; i++) {
            moistureElements[i].textContent = `${data.soilMoisture[i]} %`;
        }
    }

    function updateChart(data) {
        const currentTime = new Date().toLocaleTimeString();

        chart.data.labels.push(currentTime);
        chart.data.datasets[0].data.push(data.temperature);
        chart.data.datasets[1].data.push(data.humidity);

        if (chart.data.labels.length > 20) {
            chart.data.labels.shift();
            chart.data.datasets[0].data.shift();
            chart.data.datasets[1].data.shift();
        }

        chart.update();
    }

    function updateLedStatus(data) {
        for (let i = 0; i < 4; i++) {
            ledElements[i].className = data.pumpStatus[i] ? 'led green' : 'led gray';
        }
    }
});
