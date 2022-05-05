import "./styles/reset.css";
import "./styles/styles.css";

import sunny from "./images/sunny.jpeg";
import overcast from "./images/overcast.jpeg";
import partlyCloudy from "./images/partly-cloudy.jpeg";
import rainy from "./images/rainy.jpeg";

const weatherContainer = document.getElementById("weather-container");
weatherContainer.style.display = "none";

const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");

const error = document.getElementById("error");
error.style.display = "none";

const cityName = document.getElementById("city-name");
const weatherName = document.getElementById("weather-name");

const weatherIcon = document.getElementById("weather-icon");

const tempContainer = document.getElementById("temp");

const feelsLikeContainer = document.getElementById("feels-like");
const windSpeedContainer = document.getElementById("wind");
const humidityContainer = document.getElementById("humidity");

const convertButton = document.getElementById("convert-temp");

let celsius = true; 
let firstDetect = true;

searchBtn.addEventListener("click", (e) => {
    celsius = true;
    e.preventDefault();
    error.style.display = "none";
    getWeather();
});

async function getGeocode(location) {
    try {
        const geoCodeResponse = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${location}&appid=84dc4cf872f4ca955eaa6c04b09efd71`, {mode: "cors"});
        const geoCodeData = await geoCodeResponse.json();
        const geoCode = geoCodeData[0];
        return geoCode;
    } catch (err) {
        console.log(err);
        error.display.style = "block";
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
    } catch (err) {
        console.log(err);
        error.display.style = "block";
    }
}

function chooseBg(weather) {
    const content = document.getElementById("content");

    if (weather.includes("partly")) {
        content.style.backgroundImage = `url(${partlyCloudy})`;
    } else if (weather.includes("sun") || weather.includes("clear")) {
        content.style.backgroundImage = `url(${sunny})`;
    } else if (weather.includes("cloud")) {
        content.style.backgroundImage = `url(${overcast})`;
    } else {
        content.style.backgroundImage = `url(${rainy})`;
    }
}

function chooseWeatherIcon(weather) {
    const classNames = weatherIcon.className.split(" ");

    classNames.forEach(name => {
        if (name !== "fa-solid") {
            weatherIcon.classList.remove(name);
        }
    });

    if (weather.includes("partly")) {
        weatherIcon.classList.add("fa-cloud-sun");
    } else if (weather.includes("sun") || (weather.includes("clear"))) {
        weatherIcon.classList.add("fa-sun");
    } else if (weather.includes("cloud")) {
        weatherIcon.classList.add("fa-cloud");
    } else {
        weatherIcon.classList.add("fa-cloud-rain");
    }
}

function kelvinToCelsius(kelv) {
    const cels = -Math.round(-(kelv - 273.15));

    return cels;
}

function celsify(temp) {
    return `${temp}\u00B0C`;
}

function fahrfy(temp) {
    return `${temp}\u00B0F`;
}

function celsiusToFahr(cels) {
    const fahr = -Math.round(-((cels * 9.0/5.0) + 32.0));

    return fahr;
}

function fahrToCelsius(fahr) {
    const cels = -Math.round(-((fahr - 32.0) * 5.0/9.0));

    return cels;
}

function updateTemp(temp) {
    tempContainer.innerText = temp;
}

function updateFeelsLike(feelsLike) {
    feelsLikeContainer.innerText = feelsLike;
}

function detectTempConversion() {
    convertButton.addEventListener("click", () => {
        let oldFeelsLike = feelsLikeContainer.innerText;
        oldFeelsLike = oldFeelsLike.substring(0, oldFeelsLike.length - 2);
        let oldTemp = tempContainer.innerText;
        oldTemp = oldTemp.substring(0, oldTemp.length - 2);

        let newTemp;
        let newFeelsLike;
        let newTempStr;
        let newFeelsLikeStr

        if (celsius) {
            newTemp = celsiusToFahr(oldTemp);
            newFeelsLike = celsiusToFahr(oldFeelsLike);
            celsius = false;
            newTempStr = fahrfy(newTemp);
            newFeelsLikeStr = fahrfy(newFeelsLike);
        } else {
            newTemp = fahrToCelsius(oldTemp);
            newFeelsLike = fahrToCelsius(oldFeelsLike);
            celsius = true;
            newTempStr = celsify(newTemp);
            newFeelsLikeStr = celsify(newFeelsLike);
        }

        updateTemp(newTempStr);
        updateFeelsLike(newFeelsLikeStr);
    });
}

function displayWeather(data) {
    const cityNameStr = `${data.name}, ${data.sys.country}`;

    cityName.innerText = cityNameStr;

    const rawFeelsLike = data.main.feels_like;
    const celsiusFeelsLike = kelvinToCelsius(rawFeelsLike);
    const feelsLike = celsify(celsiusFeelsLike);

    const humidity = data.main.humidity;

    const rawTemp = data.main.temp;
    const celsiusTemp = kelvinToCelsius(rawTemp);
    const temp = celsify(celsiusTemp); 

    const windSpeed = data.wind.speed; 

    const weather = data.weather[0];
    const weatherStr = weather.description;

    chooseBg(weatherStr);
    chooseWeatherIcon(weatherStr);

    const weatherStrWords = weatherStr.split(" "); 
    weatherName.innerText = `${weatherStrWords[0].charAt(0).toUpperCase() + weatherStrWords[0].substring(1)} 
                            ${weatherStrWords[1].charAt(0).toUpperCase() + weatherStrWords[1].substring(1)}`;

    feelsLikeContainer.innerText = feelsLike;
    tempContainer.innerText = temp;
    humidityContainer.innerText = `${humidity}%`;
    windSpeedContainer.innerText = `${windSpeed}m/s`;

    if (firstDetect) {
        detectTempConversion();
        firstDetect = false; 
    }

    weatherContainer.style.display = "block";
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
            console.log(err);
            error.style.display = "block";
        });
        
    }).catch((err) => {
        console.log(err);
        error.style.display = "block";
    });
}