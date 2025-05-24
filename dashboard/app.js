document.addEventListener('DOMContentLoaded', () => {
    const apiKey = '20FJCTOQM80U0EUN';
    const channelId = '2683021';
    const url = `https://api.thingspeak.com/channels/${channelId}/feeds.json?api_key=${apiKey}&results=1`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const latestData = data.feeds[0];
            let pm25 = parseFloat(latestData.field3) * 0.9913 + 0.0046;
            let pm10 = parseFloat(latestData.field4) * 0.7457 + 1.1026;
            let temperature = parseFloat(latestData.field1);
            const co2 = latestData.field5;

            // Format values to two decimal places
            pm25 = pm25.toFixed(2);
            pm10 = pm10.toFixed(2);
            temperature = temperature.toFixed(2);

            // Update DOM elements
            document.getElementById('pm25').textContent = pm25;
            document.getElementById('pm10').textContent = pm10;
            document.getElementById('temperature').textContent = temperature;
            document.getElementById('co2').textContent = co2;

            // Calculate AQI
            const aqi = calculateAQI(pm25, pm10);
            document.getElementById('aqi').textContent = aqi;
            document.getElementById('aqi-status').textContent = getAQIStatus(aqi);
        })
        .catch(error => console.error('Error fetching data:', error));

    function calculateAQI(pm25, pm10) {
        pm25 = parseFloat(pm25); // Ensure pm25 is treated as a number
        pm10 = parseFloat(pm10); // Ensure pm10 is treated as a number

        let aqi25 = 50 / 30;
        let tmp = pm25 % 30;
        aqi25 *= tmp;
        tmp = Math.floor(pm25 / 30);
        tmp *= 50;
        aqi25 += tmp;

        let aqi10 = pm10 % 50;
        tmp = Math.floor(pm10 / 50);
        tmp *= 50;
        aqi10 += tmp;

        return Math.max(aqi25, aqi10).toFixed(2);
    }

    function getAQIStatus(aqi) {
        if (aqi <= 50) return "Air Quality is Good!";
        if (aqi <= 100) return "Air Quality is Satisfactory!";
        if (aqi <= 200) return "Air Quality is Moderate!";
        if (aqi <= 300) return "Air Quality is Poor!";
        if (aqi <= 400) return "Air Quality is Very Poor!";
        return "Air Quality is Severe!";
    }
});
