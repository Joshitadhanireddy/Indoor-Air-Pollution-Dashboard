document.addEventListener('DOMContentLoaded', () => {
    const apiKey = '20FJCTOQM80U0EUN';
    const channelId = '2683021';
    const url = `https://api.thingspeak.com/channels/${channelId}/feeds.json?api_key=${apiKey}&results=50`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const labels = data.feeds.map(feed => feed.created_at);
            const pm25Data = data.feeds.map(feed => parseFloat(feed.field3));
            const pm10Data = data.feeds.map(feed => parseFloat(feed.field4));
            const tempData = data.feeds.map(feed => parseFloat(feed.field1));
            const co2Data = data.feeds.map(feed => parseFloat(feed.field5));

            function calibrateData(data, m, c) {
                return data.map(value => (value * m) + c);
            }

            const calibratedPm25Data = calibrateData(pm25Data, 0.9913, 0.0046);
            const calibratedPm10Data = calibrateData(pm10Data, 0.7457, 1.1026);

            createChart('pm25-chart', 'PM2.5 (µg/m³)', labels, calibratedPm25Data);
            createChart('pm10-chart', 'PM10 (µg/m³)', labels, calibratedPm10Data);
            createChart('temperature-chart', 'Temperature (°C)', labels, tempData);
            createChart('co2-chart', 'CO2 (ppm)', labels, co2Data);
        })
        .catch(error => console.error('Error fetching data:', error));

        function createChart(canvasId, label, labels, data) {
            const ctx = document.getElementById(canvasId).getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: label,
                        data: data,
                        borderColor: '#4bc0c0',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)', // Adds a translucent background to the line
                        fill: true,
                        tension: 0.3 // Smoothens the line
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: label,
                            font: {
                                size: 16
                            }
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false
                        },
                        legend: {
                            display: false // Removes redundant legends for a cleaner look
                        }
                    },
                    scales: {
                        x: {
                            ticks: {
                                autoSkip: true,
                                maxTicksLimit: 5 // Limits the number of ticks on the x-axis
                            },
                            title: {
                                display: true,
                                text: 'Time',
                                font: {
                                    size: 14
                                }
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: label,
                                font: {
                                    size: 14
                                }
                            }
                        }
                    }
                }
            });
        }
        
});
