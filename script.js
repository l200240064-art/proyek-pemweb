// Mengambil referensi elemen DOM
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const weatherCard = document.getElementById('weather-card');
const loadingElement = document.getElementById('loading');
const errorElement = document.getElementById('error-msg');

// Fungsi utama untuk mengontrol alur data
async function getWeatherData() {
    const cityName = cityInput.value.trim();
    if (!cityName) return;

    // Reset Tampilan (State Management)
    loadingElement.style.display = 'block';
    weatherCard.style.display = 'none';
    errorElement.style.display = 'none';

    try {
        // LALUAN 1: Ambil data Geocoding (Mencari Lat & Lon berdasarkan nama kota)
        const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=id&format=json`;
        const geocodeResponse = await fetch(geocodeUrl);
        const geocodeData = await geocodeResponse.json();

        // Validasi jika kota tidak ditemukan di database API
        if (!geocodeData.results || geocodeData.results.length === 0) {
            throw new Error('Kota tidak ditemukan');
        }

        // Ekstraksi data JSON Geocoding
        const { latitude, longitude, name, country_code } = geocodeData.results[0];

        // LALUAN 2: Ambil data cuaca berdasarkan koordinat yang didapatkan
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code`;
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();

        // Ekstraksi data JSON Cuaca
        const currentData = weatherData.current;

        // Manipulasi DOM Dinamis untuk menampilkan data ke pengguna
        document.getElementById('city-name').innerText = name;
        document.getElementById('country-code').innerText = country_code.toUpperCase();
        document.getElementById('temperature').innerText = Math.round(currentData.temperature_2m);
        document.getElementById('humidity').innerText = currentData.relative_humidity_2m + ' %';
        document.getElementById('weather-code').innerText = interpretWeatherCode(currentData.weather_code);

        // Ubah State Tampilan ke Sukses
        loadingElement.style.display = 'none';
        weatherCard.style.display = 'block';

    } catch (error) {
        console.error('Error log:', error);
        loadingElement.style.display = 'none';
        errorElement.style.display = 'block';
    }
}

// Fungsi pembantu untuk menerjemahkan WMO Weather Code dari JSON Open-Meteo
function interpretWeatherCode(code) {
    if (code === 0) return "Cerah";
    if (code >= 1 && code <= 3) return "Berawan Sebagian";
    if (code >= 45 && code <= 48) return "Berkabut";
    if (code >= 51 && code <= 67) return "Gerimis/Hujan Ringan";
    if (code >= 71 && code <= 77) return "Hujan Salju";
    if (code >= 80 && code <= 82) return "Hujan Deras";
    if (code >= 95 && code <= 99) return "Badan Berpetir";
    return "Tidak Diketahui";
}

// Event Listeners untuk Interaksi Pengguna
searchBtn.addEventListener('click', getWeatherData);
cityInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') getWeatherData();
});