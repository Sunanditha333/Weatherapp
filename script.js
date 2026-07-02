const API_KEY = "0e2512f47e5a4d968ce163028260107";

const cityInput = document.getElementById("cityInput");
const submitBtn = document.getElementById("submitBtn");
const locationBtn = document.getElementById("locationBtn");
const resultDiv = document.getElementById("weatherResult");
const errorDiv = document.getElementById("errorMsg");
const statusDiv = document.getElementById("statusMsg");

submitBtn.addEventListener("click", () => handleSearch());
locationBtn.addEventListener("click", fetchWeatherByLocation);
cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") handleSearch();
});

function clearDisplayState() {
  errorDiv.textContent = "";
  statusDiv.textContent = "";
  resultDiv.classList.add("hidden");
}

function handleSearch() {
  const query = cityInput.value.trim();
  if (!query) {
    clearDisplayState();
    errorDiv.textContent = "Please enter a city name.";
    return;
  }
  fetchWeatherByCity(query);
}

async function fetchWeatherByCity(city) {
  clearDisplayState();
  statusDiv.innerHTML = `<p><i class="fa-solid fa-spinner fa-spin"></i> Locating data...</p>`;

  const url = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${encodeURIComponent(city)}&aqi=no`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("City not found. Please verify spelling.");
    
    const data = await response.json();
    const apiName = data.location.name.toLowerCase();
    const inputName = city.toLowerCase();
    
    if (apiName !== inputName && !apiName.includes(inputName)) {
      clearDisplayState();
      errorDiv.textContent = `City not found. Did you mean "${data.location.name}"?`;
      return;
    }

    renderWeatherDashboard(data);
  } catch (error) {
    statusDiv.textContent = "";
    errorDiv.textContent = error.message;
  }
}

function fetchWeatherByLocation() {
  clearDisplayState();
  if (!navigator.geolocation) {
    errorDiv.textContent = "Geolocation is unsupported by your browser.";
    return;
  }

  statusDiv.innerHTML = `<p><i class="fa-solid fa-compass fa-spin"></i> Acquiring coordinates...</p>`;

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude: lat, longitude: lon } = position.coords;
      const url = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${lat},${lon}&aqi=no`;

      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Unable to fetch weather for current position.");
        const data = await response.json();
        renderWeatherDashboard(data);
      } catch (error) {
        statusDiv.textContent = "";
        errorDiv.textContent = error.message;
      }
    },
    () => {
      statusDiv.textContent = "";
      errorDiv.textContent = "Location permission denied. Type search manually.";
    }
  );
}

function renderWeatherDashboard(data) {
  statusDiv.textContent = "";
  errorDiv.textContent = "";
  
  const cityName = data.location.name;
  const countryName = data.location.country;
  const tempCelsius = Math.round(data.current.temp_c);
  const conditionText = data.current.condition.text;
  const humidityValue = data.current.humidity;
  const windSpeedMS = Math.round((data.current.wind_kph * 1000) / 3600); 
  const iconUrl = `https:${data.current.condition.icon}`;

  resultDiv.innerHTML = `
    <div class="location-header">
      <h2><i class="fa-solid fa-location-dot"></i> ${cityName}, ${countryName}</h2>
    </div>
    
    <div class="display-main">
      <img src="${iconUrl}" alt="Condition Icon"/>
      <div class="temp-box">
        <h3>${tempCelsius}°C</h3>
        <p class="weather-desc">${conditionText}</p>
      </div>
    </div>

    <div class="metrics-grid">
      <div class="metric-card">
        <i class="fa-solid fa-droplet metric-icon"></i>
        <div class="metric-info">
          <span class="value">${humidityValue}%</span>
          <span class="label">Humidity</span>
        </div>
      </div>
      <div class="metric-card">
        <i class="fa-solid fa-wind metric-icon"></i>
        <div class="metric-info">
          <span class="value">${windSpeedMS} m/s</span>
          <span class="label">Wind Speed</span>
        </div>
      </div>
    </div>
  `;
  
  resultDiv.classList.remove("hidden");
}