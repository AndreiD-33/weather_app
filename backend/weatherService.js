/**
 * weatherService.js
 * Foloseste API-ul GRATUIT
 */

const axios = require("axios");

const OWM_BASE = "https://api.openweathermap.org";
const CURRENT_URL = `${OWM_BASE}/data/2.5/weather`;
const FORECAST_URL = `${OWM_BASE}/data/2.5/forecast`;
const AIR_URL = `${OWM_BASE}/data/2.5/air_pollution`;
const GEO_URL = `${OWM_BASE}/geo/1.0/direct`;

// ── Conversii temperatura ────────────────────────────────────────────────

function kelvinToCelsius(kelvin) {
  return Math.round((kelvin - 273.15) * 10) / 10;
}

function celsiusToFahrenheit(celsius) {
  return Math.round((celsius * 9) / 5 + 32);
}

// ── Directia vantului ────────────────────────────────────────────────────

function degreesToWindDirection(degrees) {
  if (degrees === undefined || degrees === null) return "necunoscuta";
  const directions = [
    "nord","nord-nord-est","nord-est","est-nord-est",
    "est","est-sud-est","sud-est","sud-sud-est",
    "sud","sud-sud-vest","sud-vest","vest-sud-vest",
    "vest","vest-nord-vest","nord-vest","nord-nord-vest",
  ];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

function windDirectionDetails(degrees) {
  const text = degreesToWindDirection(degrees);
  const emojiMap = {
    "nord":{ emoji:"⬆️", abbr:"N" }, "nord-nord-est":{ emoji:"↗️", abbr:"NNE" },
    "nord-est":{ emoji:"↗️", abbr:"NE" }, "est-nord-est":{ emoji:"➡️", abbr:"ENE" },
    "est":{ emoji:"➡️", abbr:"E" }, "est-sud-est":{ emoji:"➡️", abbr:"ESE" },
    "sud-est":{ emoji:"↘️", abbr:"SE" }, "sud-sud-est":{ emoji:"↘️", abbr:"SSE" },
    "sud":{ emoji:"⬇️", abbr:"S" }, "sud-sud-vest":{ emoji:"↙️", abbr:"SSV" },
    "sud-vest":{ emoji:"↙️", abbr:"SV" }, "vest-sud-vest":{ emoji:"⬅️", abbr:"VSV" },
    "vest":{ emoji:"⬅️", abbr:"V" }, "vest-nord-vest":{ emoji:"⬅️", abbr:"VNV" },
    "nord-vest":{ emoji:"↖️", abbr:"NV" }, "nord-nord-vest":{ emoji:"↖️", abbr:"NNV" },
    "necunoscuta":{ emoji:"🌀", abbr:"?" },
  };
  return { text, emoji: emojiMap[text]?.emoji||"🌀", abbr: emojiMap[text]?.abbr||"?", degrees };
}

// ── Interpretarea zilei ──────────────────────────────────────────────────

function interpretDay(current) {
  const { tempCelsius, humidity, windSpeed, weatherId, description } = current;
  let dayType="normala", needsCoat=false, needsUmbrella=false;
  let emoji="🌤️", message="", suggestion="";

  const isThunderstorm = weatherId>=200 && weatherId<300;
  const isDrizzle = weatherId>=300 && weatherId<400;
  const isRain = weatherId>=500 && weatherId<600;
  const isSnow = weatherId>=600 && weatherId<700;
  const isMist = weatherId>=700 && weatherId<800;
  const isClear = weatherId===800;
  const isCloudy = weatherId>800;

  needsUmbrella = isThunderstorm || isRain || isDrizzle;
  needsCoat = tempCelsius<15 || (windSpeed>10 && tempCelsius<20);

  if (isThunderstorm) {
    dayType="furtuna"; emoji="⛈️";
    message="Furtuna puternica! Ramai in casa daca poti.";
    suggestion="Evita iesirile inutile. Ia umbrela si haina impermeabila.";
  } else if (isSnow) {
    dayType="ninge"; emoji="❄️"; needsCoat=true;
    message="Ninge afara! Imbraca-te calduros.";
    suggestion="Poarta imbracaminte groasa si incaltaminte impermeabila.";
  } else if (isRain) {
    dayType="ploioasa"; emoji="🌧️";
    message="Zi ploioasa. Nu uita umbrela!";
    suggestion="Ia umbrela si o haina rezistenta la apa.";
  } else if (isDrizzle) {
    dayType="burnita"; emoji="🌦️";
    message="Burnita usoara. O umbrela mica ar fi utila.";
    suggestion="O umbrela mica ar fi de folos.";
  } else if (isMist) {
    dayType="ceata"; emoji="🌫️";
    message="Ceata afara. Fii atent la vizibilitate!";
    suggestion="Conduce cu viteza redusa daca mergi cu masina.";
  } else if (isClear && tempCelsius>=20 && tempCelsius<=28) {
    dayType="frumoasa"; emoji="☀️";
    message="Ce zi frumoasa! Cer senin si temperatura placuta.";
    suggestion="Zi perfecta pentru o plimbare. Nu uita crema de soare!";
  } else if (isClear && tempCelsius>28) {
    dayType="foarte_calda"; emoji="🔆";
    message="Cald si insorit! Atentie la canicula.";
    suggestion="Bea multa apa, evita expunerea la soare intre 11-17.";
  } else if (isClear && tempCelsius<10) {
    dayType="rece_senina"; emoji="🌨️"; needsCoat=true;
    message="Cer senin dar temperaturi scazute.";
    suggestion="Imbraca-te bine! E frig afara.";
  } else if (isCloudy && tempCelsius>=15) {
    dayType="innorata"; emoji="☁️";
    message="Zi innorata, dar suportabila.";
    suggestion="O zi gri dar ok pentru activitati in aer liber.";
  } else if (tempCelsius<0) {
    dayType="inghet"; emoji="🥶"; needsCoat=true;
    message="Temperaturi sub zero! Pericol de inghet.";
    suggestion="Imbraca-te foarte gros. Atentie la gheata pe sosele.";
  } else {
    dayType="variabila"; emoji="🌤️";
    message=`Vreme variabila: ${description}.`;
    suggestion="Verifica prognoza inainte sa iesi.";
  }

  if (humidity>80 && tempCelsius>25) message+=" Umiditate mare — se simte si mai cald.";
  return { dayType, needsCoat, needsUmbrella, emoji, message, suggestion };
}

// ── Proceseaza prognoza 5 zile ───────────────────────────────────────────

function groupForecastByDay(list, timezoneOffset) {
  const days = {};
  list.forEach((item) => {
    const localDate = new Date((item.dt + timezoneOffset) * 1000);
    const dateKey = localDate.toISOString().split("T")[0];
    if (!days[dateKey]) {
      days[dateKey] = { dt:item.dt, items:[], temps:[], weatherIds:[], humidity:[], windSpeeds:[], windDegs:[], pops:[] };
    }
    days[dateKey].items.push(item);
    days[dateKey].temps.push(kelvinToCelsius(item.main.temp));
    days[dateKey].weatherIds.push(item.weather[0].id);
    days[dateKey].humidity.push(item.main.humidity);
    days[dateKey].windSpeeds.push(item.wind.speed);
    days[dateKey].windDegs.push(item.wind.deg||0);
    days[dateKey].pops.push(item.pop||0);
  });

  return Object.values(days).slice(0,5).map((day) => {
    const maxTemp = Math.max(...day.temps);
    const minTemp = Math.min(...day.temps);
    const avgHumidity = Math.round(day.humidity.reduce((a,b)=>a+b,0)/day.humidity.length);
    const maxPop = Math.round(Math.max(...day.pops)*100);
    const avgWindSpeed = Math.round((day.windSpeeds.reduce((a,b)=>a+b,0)/day.windSpeeds.length)*3.6);
    const avgWindDeg = Math.round(day.windDegs.reduce((a,b)=>a+b,0)/day.windDegs.length);
    const middleItem = day.items[Math.floor(day.items.length/2)];
    const icon = middleItem.weather[0].icon.replace("n","d");
    const modeId = day.weatherIds.sort((a,b)=>
      day.weatherIds.filter(v=>v===a).length - day.weatherIds.filter(v=>v===b).length
    ).pop();

    return {
      dt: new Date(day.dt*1000).toISOString(),
      tempMaxCelsius: maxTemp, tempMinCelsius: minTemp,
      tempMaxFahrenheit: celsiusToFahrenheit(maxTemp),
      tempMinFahrenheit: celsiusToFahrenheit(minTemp),
      humidity: avgHumidity, pop: maxPop,
      windSpeed: avgWindSpeed,
      windDirection: windDirectionDetails(avgWindDeg),
      weatherId: modeId,
      description: middleItem.weather[0].description,
      icon, iconUrl: `https://openweathermap.org/img/wn/${icon}@2x.png`,
      moonPhase: 0.5,
      sunrise: null, sunset: null, summary: "",
    };
  });
}

function processHourly(list) {
  return list.slice(0,8).map((item) => {
    const tC = kelvinToCelsius(item.main.temp);
    return {
      dt: new Date(item.dt*1000).toISOString(),
      tempCelsius: tC, tempFahrenheit: celsiusToFahrenheit(tC),
      humidity: item.main.humidity,
      pop: Math.round((item.pop||0)*100),
      weatherId: item.weather[0].id,
      description: item.weather[0].description,
      icon: item.weather[0].icon,
      iconUrl: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`,
      windSpeed: Math.round((item.wind.speed||0)*3.6),
      windDirection: windDirectionDetails(item.wind.deg),
      rain1h: item.rain ? (item.rain["3h"]||0)/3 : 0,
      snow1h: item.snow ? (item.snow["3h"]||0)/3 : 0,
      uvIndex: 0,
    };
  });
}

// ── Functii principale ───────────────────────────────────────────────────

async function geocodeCity(cityName, apiKey) {
  const url = `${GEO_URL}?q=${encodeURIComponent(cityName)}&limit=5&appid=${apiKey}`;
  const response = await axios.get(url);
  if (!response.data || response.data.length===0) {
    throw new Error(`Orasul "${cityName}" nu a fost gasit.`);
  }
  const loc = response.data[0];
  return {
    lat: loc.lat, lon: loc.lon,
    name: loc.local_names?.ro || loc.name,
    country: loc.country, state: loc.state||"",
    allResults: response.data.map(r=>({
      lat:r.lat, lon:r.lon, name:r.local_names?.ro||r.name, country:r.country, state:r.state||""
    })),
  };
}

async function fetchWeatherByCoords(lat, lon, apiKey, cityName, countryCode) {
  const [currentResp, forecastResp] = await Promise.all([
    axios.get(`${CURRENT_URL}?lat=${lat}&lon=${lon}&appid=${apiKey}&lang=ro`),
    axios.get(`${FORECAST_URL}?lat=${lat}&lon=${lon}&appid=${apiKey}&lang=ro&cnt=40`),
  ]);

  const raw = currentResp.data;
  const forecastData = forecastResp.data;
  const tempC = kelvinToCelsius(raw.main.temp);
  const feelsLikeC = kelvinToCelsius(raw.main.feels_like);

  const current = {
    tempCelsius: tempC,
    tempFahrenheit: celsiusToFahrenheit(tempC),
    feelsLikeCelsius: feelsLikeC,
    feelsLikeFahrenheit: celsiusToFahrenheit(feelsLikeC),
    humidity: raw.main.humidity,
    pressure: raw.main.pressure,
    uvIndex: 0,
    visibility: raw.visibility ? Math.round(raw.visibility/1000) : null,
    cloudiness: raw.clouds?.all||0,
    dewPoint: null,
    windSpeed: Math.round((raw.wind?.speed||0)*3.6),
    windSpeedMs: raw.wind?.speed||0,
    windGust: raw.wind?.gust ? Math.round(raw.wind.gust*3.6) : null,
    windDirection: windDirectionDetails(raw.wind?.deg),
    rain1h: raw.rain ? raw.rain["1h"]||0 : 0,
    snow1h: raw.snow ? raw.snow["1h"]||0 : 0,
    weatherId: raw.weather[0].id,
    weatherMain: raw.weather[0].main,
    description: raw.weather[0].description,
    icon: raw.weather[0].icon,
    iconUrl: `https://openweathermap.org/img/wn/${raw.weather[0].icon}@2x.png`,
    sunrise: new Date(raw.sys.sunrise*1000).toISOString(),
    sunset: new Date(raw.sys.sunset*1000).toISOString(),
    timezone: forecastData.city.timezone,
    timezoneOffset: forecastData.city.timezone,
    dt: new Date(raw.dt*1000).toISOString(),
  };

  const dayInterpretation = interpretDay(current);
  const hourly = processHourly(forecastData.list);
  const daily = groupForecastByDay(forecastData.list, forecastData.city.timezone);
  const offsetHours = Math.floor(Math.abs(forecastData.city.timezone)/3600);
  const tzSign = forecastData.city.timezone>=0 ? "-" : "+";
  const timezoneStr = `Etc/GMT${tzSign}${offsetHours}`;

  return {
    city: cityName || raw.name,
    country: countryCode || raw.sys.country,
    lat: raw.coord.lat, lon: raw.coord.lon,
    timezone: timezoneStr,
    current, dayInterpretation, hourly, daily,
    alerts: [],
    fetchedAt: new Date().toISOString(),
  };
}

async function fetchAirQuality(lat, lon, apiKey) {
  try {
    const url = `${AIR_URL}?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    const response = await axios.get(url);
    const aqi = response.data.list[0];
    const aqiLabels = {
      1:{ label:"Excelent", color:"#00e400", emoji:"😊" },
      2:{ label:"Bun", color:"#92d050", emoji:"🙂" },
      3:{ label:"Moderat", color:"#ffff00", emoji:"😐" },
      4:{ label:"Slab", color:"#ff7e00", emoji:"😷" },
      5:{ label:"Foarte slab", color:"#ff0000", emoji:"🤢" },
    };
    return {
      aqi: aqi.main.aqi,
      aqiInfo: aqiLabels[aqi.main.aqi]||aqiLabels[3],
      components: aqi.components,
    };
  } catch { return null; }
}

module.exports = {
  geocodeCity, fetchWeatherByCoords, fetchAirQuality,
  kelvinToCelsius, celsiusToFahrenheit,
  degreesToWindDirection, windDirectionDetails, interpretDay,
};