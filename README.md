# K5 Bearing

A **weather channel for Rotterdam**, viewable in the browser — from **Kastle Five Systems**.

K5 Bearing turns hard, public weather data into a clean, always-on channel: current
conditions, the day's forecast, severe-weather alerts, tides, the sun almanac, and the
space-weather compass advisory that gives the project its name. Built on free, keyless
feeds. No accounts, no ads — just the signal.

> **Status: early.** This repo is being reworked. K5 Bearing began life as an automated
> X (Twitter) posting bot; it's now becoming a browser-based weather channel. That pivot
> is in progress — the repo currently holds the direction, the brand, and a placeholder
> page. The former bot's code lives in the git history if any of it is worth reusing.

## The idea

A single page you can leave open — on a phone, a laptop, a screen on the wall — that
shows Rotterdam's weather as a living channel. The **exact format is still open**: it
could run as a **rolling, TV-style channel** (full-screen panels that auto-advance —
conditions → forecast → alerts → tides → almanac, looping), or as a **live dashboard**
(everything at a glance on one page). That decision comes next.

## What it will show (Rotterdam)

- **Now** — current temperature, sky, wind.
- **Forecast** — the day and the night ahead.
- **Severe weather** — official warnings when they're in force.
- **Tides** — the next high/low water at the coast.
- **Almanac** — sunrise/sunset compass bearings, solar noon, daylight length. The
  navigation angle behind the name: *keep your bearing*.
- **Space weather** — geomagnetic storms and the compass-accuracy advisory (magnetic
  north drifts during solar storms — the original "Bearing").

## Data

All sourced from free, public, keyless feeds — the plan is to keep it that way:

- **Open-Meteo** — current conditions and forecast
- **KNMI / MeteoAlarm** — official Dutch severe-weather warnings
- **Rijkswaterstaat** — tide predictions
- **NOAA SWPC** — space weather and the geomagnetic (compass) signal

## Repository

```
index.html          placeholder holding page (the browser entry point)
assets/             brand: pinwheel logo, header, Eurostile display font
README.md           this file
```

Nothing here is functional yet — `index.html` is a branded placeholder. The build comes
once the channel format is chosen.

## Brand

Black ground, arctic-white (`#F4F9FF`) marks, the eight-blade compass-rose pinwheel, and
Eurostile Extended for display type. Minimal and modern. **Keep your bearing.**
