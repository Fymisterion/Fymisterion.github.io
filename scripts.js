document.addEventListener('DOMContentLoaded', function () {
    const tempGaugeCtx = document.getElementById('tempGauge').getContext('2d');
    const humGaugeCtx = document.getElementById('humGauge').getContext('2d');
    const moistureGaugeCtx1 = document.getElementById('moistureGauge1').getContext('2d');
    const moistureGaugeCtx2 = document.getElementById('moistureGauge2').getContext('2d');
    const moistureGaugeCtx3 = document.getElementById('moistureGauge3').getContext('2d');
    const moistureGaugeCtx4 = document.getElementById('moistureGauge4').getContext('2d');

    const ledElements = [
        document.getElementById('led1'),
        document.getElementById('led2'),
        document.getElementById('led3'),
        document.getElementById('led4')
    ];

    const updateInterval = 5000; // 5 seconds

    const tempGauge = new Chart(tempGaugeCtx, {
        type: 'doughnut',
        data: {
            labels: ['Temperature'],
            datasets: [{
                data: [0, 100],
                backgroundColor: ['#FF6384', '#EEEEEE'],
                borderWidth: 1
            }]
        },
        options: {
            circumference: Math.PI,
            rotation: Math.PI,
            cutoutPercentage: 60,
            plugins: {
                datalabels: {
                    display: true,
                    align: 'center',
                    anchor: 'center',
                    formatter: (value, ctx) => ctx.chart.data.datasets[0].data[0] + '°C',
                }
            }
        }
    });

    const humGauge = new Chart(humGaugeCtx, {
        type: 'doughnut',
        data: {
            labels: ['Humidity'],
            datasets: [{
                data: [0, 100],
                backgroundColor: ['#36A2EB', '#EEEEEE'],
                borderWidth: 1
            }]
        },
        options: {
            circumference: Math.PI,
            rotation: Math.PI,
            cutoutPercentage: 60,
            plugins: {
                datalabels: {
                    display: true,
                    align: 'center',
                    anchor: 'center',
                    formatter: (value, ctx) => ctx.chart.data.datasets[0].data[0] + '%',
                }
            }
        }
    });

    const moistureGauges = [
        new Chart(moistureGaugeCtx1, createMoistureGaugeConfig()),
        new Chart(moistureGaugeCtx2, createMoistureGaugeConfig()),
        new Chart(moistureGaugeCtx3, createMoistureGaugeConfig()),
        new Chart(moistureGaugeCtx4, createMoistureGaugeConfig())
    ];

    function createMoistureGaugeConfig() {
        return {
            type: 'doughnut',
            data: {
                labels: ['Soil Moisture'],
                datasets: [{
                    data: [0, 100],
                    backgroundColor: ['#4CAF50', '#EEEEEE'],
                    borderWidth: 1
                }]
            },
            options: {
                circumference: Math.PI,
                rotation: Math.PI,
                cutoutPercentage: 60,
                plugins: {
                    datalabels: {
                        display: true,
                        align: 'center',
                        anchor: 'center',
                        formatter: (value, ctx) => ctx.chart.data.datasets[0].data[0] + '%',
                    }
                }
            }
        };
    }

    const chart = new Chart(document.getElementById('chart').getContext('2d'), {
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

    let socket = new WebSocket('ws://192.168.1.50:81/');

    socket.onopen = function(event) {
        console.log('WebSocket is connected.');
        socket.send('getStatus');
    };

    socket.onmessage = function(event) {
        const data = JSON.parse(event.data);
        updateGauges(data);
        updateChart(data);
        updateLedStatus(data);
    };

    socket.onerror = function(error) {
        console.log('WebSocket Error: ' + error);
    };

    socket.onclose = function(event) {
        console.log('WebSocket connection closed.');
    };

    function updateGauges(data) {
        tempGauge.data.datasets[0].data[0] = data.temperature;
        tempGauge.data.datasets[0].data[1] = 100 - data.temperature;
        tempGauge.update();

        humGauge.data.datasets[0].data[0] = data.humidity;
        humGauge.data.datasets[0].data[1] = 100 - data.humidity;
        humGauge.update();

        for (let i = 0; i < 4; i++) {
            moistureGauges[i].data.datasets[0].data[0] = data['soilMoisture' + (i + 1)];
            moistureGauges[i].data.datasets[0].data[1] = 100 - data['soilMoisture' + (i + 1)];
            moistureGauges[i].update();
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
            ledElements[i].className = data['pumpStatus' + (i + 1)] ? 'led green' : 'led gray';
        }
    }
});
