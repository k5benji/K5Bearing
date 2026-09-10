<p align="center">
  <img src="assets/k5bearing-header.png" alt="K5 Bearing" width="720">
</p>

<p align="center">
  A <strong>weather channel for Rotterdam</strong>, viewable in the browser — from <strong>Kastle Five Systems</strong>.<br>
  <a href="LICENSE">Open source · MIT</a>
</p>

K5 Bearing turns hard, public weather data into a clean, always-on channel: current
conditions, the day's forecast, severe-weather alerts, tides, the sun almanac, and the
space-weather compass advisory that gives the project its name. Built on free, keyless
feeds. No accounts, no ads — just the signal.

> **Status: early build.** The format is a **live dashboard** — one page you can leave
> open on a phone, laptop, or a screen on the wall. Four tiles are live now (current
> conditions, forecast, almanac, space weather); alerts and tides are laid out and wired
> next (see [Data](#data)). K5 Bearing began as an automated X bot — that code is in the
> git history.

## Run it

It's a static site — no build step, no backend. Open `index.html`, or serve the folder:

```
python3 -m http.server 8000     # then open http://localhost:8000
```

## The dashboard (Rotterdam)

- **Now** — temperature, sky, wind (as a compass bearing), feels-like, humidity. *(live)*
- **Next days** — a short forecast, highs and lows. *(live)*
- **Almanac** — sunrise/sunset compass bearings, solar noon, daylight length and trend.
  The navigation angle behind the name: *keep your bearing.* *(live)*
- **Space weather** — the Kp index and the compass-accuracy advisory (magnetic north
  drifts during solar storms — the original "Bearing"). *(live)*
- **Warnings** — official Dutch severe-weather warnings. *(wiring next)*
- **Tides** — next high water at the coast (Hoek van Holland). *(wiring next)*

## Data

All from free, public, keyless feeds:

- **Open-Meteo** — conditions, forecast, sun times *(browser-direct)*
- **NOAA SWPC** — space weather / the geomagnetic compass signal *(browser-direct)*
- **KNMI / MeteoAlarm** — Dutch warnings *(no CORS → needs a small cached data feed)*
- **Rijkswaterstaat** — tide predictions *(no CORS → needs a small cached data feed)*

Open-Meteo and NOAA allow direct browser requests. MeteoAlarm and Rijkswaterstaat don't
send CORS headers, so the plan is a tiny scheduled job that caches their data into a
static JSON file the page reads — same free, keyless approach, no backend to run.

## Repository

```
index.html     the dashboard
styles.css     brand styling
app.js         data fetching + rendering (vanilla JS, no dependencies)
assets/        brand: pinwheel logo, header, Eurostile display font
```

## Brand

Black ground, arctic-white (`#F4F9FF`) marks, the eight-blade compass-rose pinwheel, and
Eurostile Extended for display type. Minimal and modern. **Keep your bearing.**

## License

Open source under the [MIT License](LICENSE) — free to use, modify, and share.
