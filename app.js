/* K5 Bearing — Rotterdam weather channel (dashboard).
   Client-side only, keyless. Live: Open-Meteo (conditions/forecast/almanac)
   and NOAA SWPC (space weather). Alerts + tides need a data cache (no CORS)
   and are wired next. */

const ROTTERDAM = { lat: 51.92, lon: 4.48, tz: "Europe/Amsterdam" };
const REFRESH_MS = 10 * 60 * 1000;

/* WMO weather code -> plain-language sky. */
const WX = {
  0: "clear skies", 1: "mainly clear", 2: "broken cloud", 3: "overcast",
  45: "fog", 48: "freezing fog",
  51: "light drizzle", 53: "drizzle", 55: "heavy drizzle",
  56: "freezing drizzle", 57: "freezing drizzle",
  61: "light rain", 63: "steady rain", 65: "heavy rain",
  66: "freezing rain", 67: "freezing rain",
  71: "light snow", 73: "snow", 75: "heavy snow", 77: "snow grains",
  80: "rain showers", 81: "rain showers", 82: "heavy showers",
  85: "snow showers", 86: "heavy snow showers",
  95: "thunderstorms", 96: "thunderstorms, hail", 99: "thunderstorms, hail",
};
const wx = (c) => WX[c] ?? "changeable skies";

const COMPASS = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
const bearing = (deg) => COMPASS[Math.round(((deg % 360) / 22.5)) % 16];
const pad3 = (n) => String(Math.round(n)).padStart(3, "0");

const $ = (sel) => document.querySelector(sel);
const setBody = (id, html, state) => {
  const b = document.querySelector(`#${id} .tile-body`);
  b.innerHTML = html;
  if (state) b.dataset.state = state; else b.removeAttribute("data-state");
};
const fail = (id, what) => setBody(id, `<div class="err">${what} unavailable right now.</div>`, "");

/* ---- clock ---- */
function tickClock() {
  const now = new Date();
  const s = now.toLocaleString("en-GB", {
    timeZone: ROTTERDAM.tz, weekday: "short", day: "2-digit", month: "short",
    hour: "2-digit", minute: "2-digit",
  });
  $("#clock").textContent = s + " CET";
}

/* ---- solar geometry (for the almanac) ---- */
const d2r = (d) => d * Math.PI / 180, r2d = (r) => r * 180 / Math.PI;
function solarDeclination(date) {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const n = Math.floor((Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - start) / 864e5);
  return -23.44 * Math.cos(d2r(360 / 365 * (n + 10)));
}
function sunriseAzimuth(lat, decl) {
  let x = Math.sin(d2r(decl)) / Math.cos(d2r(lat));
  x = Math.max(-1, Math.min(1, x));
  return r2d(Math.acos(x)); // from true north
}
const hm = (secs) => `${Math.floor(secs / 3600)}h ${String(Math.round((secs % 3600) / 60)).padStart(2, "0")}m`;
const clock = (iso) => iso.slice(11, 16);

/* ---- Open-Meteo: Now + Forecast + Almanac ---- */
async function loadWeather() {
  const u = new URL("https://api.open-meteo.com/v1/forecast");
  u.search = new URLSearchParams({
    latitude: ROTTERDAM.lat, longitude: ROTTERDAM.lon, timezone: ROTTERDAM.tz,
    current: "temperature_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,relative_humidity_2m",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,daylight_duration",
    forecast_days: "4",
  });
  let data;
  try {
    const r = await fetch(u);
    if (!r.ok) throw new Error(r.status);
    data = await r.json();
  } catch (e) {
    fail("now", "Conditions"); fail("forecast", "Forecast"); fail("almanac", "Almanac");
    return;
  }

  // Now
  try {
    const c = data.current;
    setBody("now", `
      <div class="now-main">
        <div class="now-temp">${Math.round(c.temperature_2m)}°</div>
        <div class="now-cond">${wx(c.weather_code)}</div>
      </div>
      <div class="now-stats">
        <div class="stat"><span class="k">Feels like</span><span class="v">${Math.round(c.apparent_temperature)}°</span></div>
        <div class="stat"><span class="k">Wind</span><span class="v">${bearing(c.wind_direction_10m)} ${pad3(c.wind_direction_10m)}° <small>${Math.round(c.wind_speed_10m)} km/h</small></span></div>
        <div class="stat"><span class="k">Humidity</span><span class="v">${Math.round(c.relative_humidity_2m)}%</span></div>
      </div>`, "");
  } catch (e) { fail("now", "Conditions"); }

  // Forecast (today + next days)
  try {
    const d = data.daily, rows = [];
    for (let i = 0; i < d.time.length; i++) {
      const dow = i === 0 ? "Today" :
        new Date(d.time[i] + "T12:00:00").toLocaleDateString("en-GB", { weekday: "short" });
      rows.push(`<div class="day">
        <span class="dow">${dow}</span>
        <span class="dc">${wx(d.weather_code[i])}</span>
        <span class="dt">${Math.round(d.temperature_2m_max[i])}° <span class="lo">${Math.round(d.temperature_2m_min[i])}°</span></span>
      </div>`);
    }
    setBody("forecast", `<div class="days">${rows.join("")}</div>`, "");
  } catch (e) { fail("forecast", "Forecast"); }

  // Almanac
  try {
    const d = data.daily;
    const sunrise = d.sunrise[0], sunset = d.sunset[0];
    const decl = solarDeclination(new Date(sunrise));
    const az = Math.round(sunriseAzimuth(ROTTERDAM.lat, decl));
    const setAz = (360 - az) % 360;
    const noonMs = (new Date(sunrise).getTime() + new Date(sunset).getTime()) / 2;
    const noon = new Date(noonMs).toLocaleTimeString("en-GB", { timeZone: ROTTERDAM.tz, hour: "2-digit", minute: "2-digit" });
    const dToday = d.daylight_duration[0], dNext = d.daylight_duration[1];
    const deltaMin = (dNext - dToday) / 60;
    const trend = deltaMin >= 0 ? "gaining" : "losing";
    const mag = Math.abs(deltaMin) < 1
      ? `${Math.round(Math.abs(deltaMin) * 60)} sec` : `${Math.round(Math.abs(deltaMin))} min`;
    setBody("almanac", `
      <div class="alm">
        <div class="alm-row"><span class="k">Sunrise</span><span class="v">${clock(sunrise)}<span class="brg">${pad3(az)}°</span></span></div>
        <div class="alm-row"><span class="k">Sunset</span><span class="v">${clock(sunset)}<span class="brg">${pad3(setAz)}°</span></span></div>
        <div class="alm-row"><span class="k">Solar noon</span><span class="v">${noon}<span class="brg">due S</span></span></div>
        <div class="alm-row"><span class="k">Daylight</span><span class="v">${hm(dToday)}<span class="brg">${trend} ${mag}/day</span></span></div>
      </div>`, "");
  } catch (e) { fail("almanac", "Almanac"); }
}

/* ---- NOAA SWPC: space weather / compass ---- */
const G_SCALE = { 5: "G1", 6: "G2", 7: "G3", 8: "G4", 9: "G5" };
async function loadSpace() {
  try {
    const r = await fetch("https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json");
    if (!r.ok) throw new Error(r.status);
    const rows = await r.json();
    const kp = parseFloat(rows[rows.length - 1].Kp);
    const storm = kp >= 5;
    const g = G_SCALE[Math.floor(kp)] || (storm ? "G1" : "");
    let note;
    if (kp < 4) note = "Geomagnetic field quiet. A magnetic compass reads true.";
    else if (kp < 5) note = "Field unsettled. Compass reliable, but watch for drift.";
    else if (kp < 7) note = `${g} storm — magnetic north is drifting. A compass can read a few degrees off true; check a bearing against GPS or a known landmark.`;
    else note = `${g} storm — magnetic north thrown off by several degrees. Trust GPS or a celestial bearing; treat the compass as a rough guide.`;
    setBody("space", `
      <div class="kp ${storm ? "storm" : ""}">
        <span class="kp-val">${kp.toFixed(0)}</span>
        <span class="kp-scale">Kp index${g ? " · " + g : ""}</span>
      </div>
      <div class="kp-note">${note}</div>`, "");
  } catch (e) { fail("space", "Space weather"); }
}

/* ---- boot ---- */
function refresh() { loadWeather(); loadSpace(); }
tickClock(); setInterval(tickClock, 30 * 1000);
refresh(); setInterval(refresh, REFRESH_MS);
