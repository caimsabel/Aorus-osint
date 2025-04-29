// cam_scraper.js
const axios = require('axios');
const axiosRetry = require('axios-retry');
const haversine = require('haversine-distance');
const fs = require('fs');

axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
};

async function httpGet(url) {
  const response = await axios.get(url, { headers });
  return response.data;
}

async function requestExecutor(urls) {
  const results = await Promise.allSettled(urls.map(httpGet));
  return results.map(r => (r.status === 'fulfilled' ? r.value : ''));
}

async function scrapeNearCity(countryCode, cidadeAlvo, cidadeLat, cidadeLon) {
  const markersList = [];
  const startPage = await httpGet(`http://insecam.org/en/bycountry/${countryCode}/?page=1`);
  let pages = 0;
  try {
    pages = parseInt(startPage.split('pagenavigator("?page=", ')[1].split(',')[0]);
  } catch {
    pages = 0;
  }

  const pageUrls = [];
  for (let i = 1; i <= pages; i++) {
    pageUrls.push(`http://insecam.org/en/bycountry/${countryCode}/?page=${i}`);
  }

  const camPages = await requestExecutor(pageUrls);
  let camIds = [];

  camPages.forEach((html) => {
    const matches = [...html.matchAll(/\/en\/view\/(\d+)\//g)];
    camIds.push(...matches.map((m) => m[1]));
  });

  const camUrls = camIds.map(id => `http://insecam.org/en/view/${id}`);
  const camDetailsPages = await requestExecutor(camUrls);

  camDetailsPages.forEach((html, idx) => {
    if (!html) return;

    const getLine = (key) => {
      try {
        return html.split(`${key}:`)[1].split('">\n')[1].split('\n')[0].trim();
      } catch {
        return '';
      }
    };

    try {
      const lat = parseFloat(getLine('Latitude'));
      const lon = parseFloat(getLine('Longitude'));
      const stream = html.split('image0')[1].split('src="')[1].split('"')[0];
      const dist = haversine({ lat: cidadeLat, lon: cidadeLon }, { lat, lon }) / 1000;

      if (dist <= 50) {
        markersList.push({
          stream,
          lat,
          lon,
          cidade: cidadeAlvo,
          distancia_km: dist.toFixed(1)
        });
      }
    } catch {}
  });

  console.log(JSON.stringify(markersList));
}

const [,, country, cidade, lat, lon] = process.argv;
scrapeNearCity(country, cidade, parseFloat(lat), parseFloat(lon));
