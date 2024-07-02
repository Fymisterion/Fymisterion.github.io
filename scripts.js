document.addEventListener('DOMContentLoaded', function () {
    const intervalElement = document.getElementById('interval');
    const ctx = document.getElementById('chart').getContext('2d');
    const tempGauge = document.getElementById('tempGauge').getContext('2d');
    const humGauge = document.getElementById('humGauge').getContext('2d');
    const moistureGauge1 = document.getElementById('moistureGauge1').getContext('2d');
    const moistureGauge2 = document.getElementById('moistureGauge2').getContext('2d');
    const moistureGauge3 = document.getElementById('moistureGauge3').getContext('2d');
    const moistureGauge4 = document.getElementById('moistureGauge4').getContext('2d');

    const tempChart = new Chart(tempGauge, {
        type: 'doughnut',
        data: {
            labels: ['Temperatur'],
            datasets: [{
                data: [0, 100],
                backgroundColor: ['#FF6384', '#E0E0E0'],
                borderWidth: 1
            }]
        },
        options: {
            circumference: Math.PI,
            rotation: Math.PI,
            cutout: '70%',
            plugins: {
                datalabels: {
                    display: true,
                    align: 'center',
                    anchor: 'center',
                    formatter: (value, ctx) => {
                        if (ctx.dataIndex === 0) {
                            return value + '°C';
                        } else {
                            return '';
                        }
                    }
                }
            }
        }
    });

    const humChart = new Chart(humGauge, {
        type: 'doughnut',
        data: {
            labels: ['Luftfeuchtigkeit'],
            datasets: [{
                data: [0, 100],
                backgroundColor: ['#36A2EB', '#E0E0E0'],
                borderWidth: 1
            }]
        },
        options: {
            circumference: Math.PI,
            rotation: Math.PI,
            cutout: '70%',
            plugins: {
                datalabels: {
                    display: true,
                    align: 'center',
                    anchor: 'center',
                    formatter: (value, ctx) => {
                        if (ctx.dataIndex === 0) {
                            return value + '%';
                        } else {
                            return '';
                        }
                    }
                }
            }
        }
    });

    const moistureCharts = [moistureGauge1, moistureGauge2, moistureGauge3, moistureGauge4].map((ctx, index) => new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: [`Feuchtigkeit ${index + 1}`],
            datasets: [{
                data: [0, 100],
                backgroundColor: ['#4BC0C0', '#E0E0E0'],
                borderWidth: 1
            }]
        },
        options: {
            circumference: Math.PI,
            rotation: Math.PI,
            cutout: '70%',
            plugins: {
                datalabels: {
                    display: true,
                    align: 'center',
                    anchor: 'center',
                    formatter: (value, ctx) => {
                        if (ctx.dataIndex === 0) {
                            return value + '%';
                        } else {
                            return '';
                        }
                    }
                }
            }
        }
    }));

    const fetchData = () => {
        fetch('http://192.168.1.50/')  // IP-Adresse des ESP32-Webservers
            .then(response => response.json())
            .then(data => {
                const { temperature, humidity, soilMoisture, pumpStatus } = data;

                // Update temp and humidity gauges
                tempChart.data.datasets[0].data[0] = temperature;
                tempChart.data.datasets[0].data[1] = 100 - temperature;
                tempChart.update();

                humChart.data.datasets[0].data[0] = humidity;
                humChart.data.datasets[0].data[1] = 100 - humidity;
                humChart.update();

                // Update soil moisture gauges
                soilMoisture.forEach((value, index) => {
                    moistureCharts[index].data.datasets[0].data[0] = value;
                    moistureCharts[index].data.datasets[0].data[1] = 100 - value;
                    moistureCharts[index].update();
                });

                // Update pump status LEDs
                pumpStatus.forEach((status, index) => {
                    const led = document.getElementById(`led${index + 1}`);
                    if (status) {
                        led.classList.remove('gray');
                        led.classList.add('green');
                    } else {
                        led.classList.remove('green');
                        led.classList.add('gray');
                    }
                });
            })
            .catch(error => console.error('Error fetching data:', error));
    };

    setInterval(fetchData, 5000);
    fetchData();

    intervalElement.addEventListener('change', () => {
        const interval = intervalElement.value;
        // Implement your logic to fetch and update chart data based on the selected interval
    });
});
