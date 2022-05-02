import "./styles/reset.css";
import "./styles/styles.css";

const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");

const cityName = document.getElementById("city-name");
const weatherName = document.getElementById("weather-name");

searchBtn.addEventListener("click", (e) => {
    e.preventDefault();
    getWeather();
});

async function getGeocode(location) {
    try {
        const geoCodeResponse = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${location}&appid=84dc4cf872f4ca955eaa6c04b09efd71`, {mode: "cors"});
        const geoCodeData = await geoCodeResponse.json();
        const geoCode = geoCodeData[0];
        return geoCode;
    } catch (reject) {
        console.log(`The location ${location} does not exist!`); 
    }
}

function getGeoCoords(geoCode) {
    const lat = geoCode.lat;
    const lon = geoCode.lon;

    return [lat, lon];
}

async function getWeatherData(coords) {
    const lat = coords[0];
    const lon = coords[1];

    try {
        const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=84dc4cf872f4ca955eaa6c04b09efd71`, {mode: "cors"});
        const weatherData = await weatherResponse.json();
        return weatherData;
    } catch (reject) {
        console.log("Something went wrong :(");
    }
}

function displayWeather(data) {
    console.log(data)
    cityName.textContent = data.name;

    const weather = data.weather[0]; 
    weatherName.innerText = weather.main;
}

function getWeather() {
    const location = searchInput.value;
    const geoCodePromise = getGeocode(location);

    geoCodePromise.then((geoCode) => {
        const geoCoords = getGeoCoords(geoCode);
        const weatherDataPromise = getWeatherData(geoCoords);
        weatherDataPromise.then((weatherData) => {
            displayWeather(weatherData);
        }).catch((err) => {
            console.log(`An error occured: ${err}`);
        });
        
    }).catch((err) => {
        console.log(`An error occured: ${err}`);
    });
}