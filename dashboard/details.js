document.addEventListener('DOMContentLoaded', () => {
    const apiKey = '20FJCTOQM80U0EUN';
    const channelId = '2683021';
    const url = `https://api.thingspeak.com/channels/${channelId}/feeds.json?api_key=${apiKey}&results=50`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const pm25Data = data.feeds.map(feed => parseFloat(feed.field3));
            const pm10Data = data.feeds.map(feed => parseFloat(feed.field4));
            const tempData = data.feeds.map(feed => parseFloat(feed.field1));
            const co2Data = data.feeds.map(feed => parseFloat(feed.field5));

            function calibrateData(data, m, c) {
                return data.map(value => (value * m) + c);
            }

            const calibratedPm25Data = calibrateData(pm25Data, 0.9913, 0.0046);
            const calibratedPm10Data = calibrateData(pm10Data, 0.7457, 1.1026);

            const avgPm25 = calculateAverage(calibratedPm25Data);
            const avgPm10 = calculateAverage(calibratedPm10Data);
            const avgTemp = calculateAverage(tempData);
            const avgCo2 = calculateAverage(co2Data);

            document.getElementById('avg-pm25').textContent = avgPm25.toFixed(2);
            document.getElementById('avg-pm10').textContent = avgPm10.toFixed(2);
            document.getElementById('avg-temperature').textContent = avgTemp.toFixed(2);
            document.getElementById('avg-co2').textContent = avgCo2.toFixed(2);
        })
        .catch(error => console.error('Error fetching data:', error));

    function calculateAverage(data) {
        const sum = data.reduce((acc, value) => acc + value, 0);
        return sum / data.length;
    }
});
