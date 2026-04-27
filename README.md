# 🌤️ WeatherApp — Proiect 11: Preluam Starea Vremii

> Aplicatie web moderna pentru afisarea starii vremii, construita cu React + Express + OpenWeatherMap API (gratuit `/data/2.5/`).

---

## 📋 Cuprins

- [Descriere](#descriere)
- [Arhitectura](#arhitectura)
- [Structura Proiect](#structura-proiect)
- [Instalare si Pornire Locala](#instalare-si-pornire-locala)
- [Deployment Render + Vercel](#deployment-render--vercel)
- [Functionalitati](#functionalitati)
- [Documentatie API](#documentatie-api)
- [Testare](#testare)
- [Tehnologii](#tehnologii)
- [Autori](#autori)

---

## Descriere

Aplicatia permite cautarea vremii pentru orice oras din lume, afisand:
- **Temperatura** in grade Celsius si Fahrenheit
- **Ce fel de zi este** (frumoasa, ploioasa, furtuna etc.)
- **Recomandarile** (haina, umbrela)
- **Directia vantului** in cuvinte (nord, sud-vest, nord-nord-est etc.)
- **Prognoza orara** pe urmatoarele 24 ore
- **Prognoza zilnica** pe 5 zile
- **Rasarit si Apus** cu durata zilei
- **Calitatea aerului** (PM2.5, PM10, O3, NO2)
- **Istoricul cautarilor** si **orase favorite**

---

## Arhitectura

### Dezvoltare locala
```
Browser
  ↓
React Vite (port 5173)
  ↓ proxy /api → localhost:5000
Express server.js (port 5000)
  ↓ weatherService.js — procesare SEPARATA de afisare
  ↓ → OpenWeatherMap API /data/2.5/
  ↓ → json-server (port 3000) ↔ db.json
```

### Productie — Render + Vercel
```
Browser
  ↓
Vercel (frontend React)
  ↓ cereri /api/*
Render (Express port 5000)
  ↓ weatherService.js
  ↓ → OpenWeatherMap API /data/2.5/
  ↓ → json-server (intern pe Render) ↔ db.json
```

**Principiu cheie**: procesarea fluxului meteo este **complet separata** de afisare.
`weatherService.js` transforma datele brute OWM, iar componentele React afiseaza
datele deja procesate.

---

## Structura Proiect

```
weather-app/
├── backend/
│   ├── server.js              ← Express API principal (port 5000)
│   ├── weatherService.js      ← procesare meteo (SEPARAT de afisare)
│   ├── db.json                ← baza de date json-server
│   ├── public/                ← folder necesar pentru json-server
│   │   └── .gitkeep
│   ├── package.json           ← scripts: start, dev (cu concurrently)
│   ├── .env                   ← variabile de mediu (NU se publica pe Git)
│   └── .env.example           ← template pentru .env
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── weatherApi.js  ← toate apelurile fetch catre backend
│   │   ├── components/
│   │   │   ├── SearchBar.jsx
│   │   │   ├── CurrentWeather.jsx
│   │   │   ├── HourlyForecast.jsx
│   │   │   ├── DailyForecast.jsx
│   │   │   ├── LoadingSkeleton.jsx
│   │   │   └── Navbar.jsx
│   │   ├── hooks/
│   │   │   └── useWeather.js  ← hook custom pentru datele meteo
│   │   ├── pages/
│   │   │   ├── WeatherPage.jsx
│   │   │   ├── HistoryPage.jsx
│   │   │   └── FavoritesPage.jsx
│   │   ├── utils/
│   │   │   └── weatherUtils.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css          ← Tailwind v4 + tema custom
│   ├── index.html
│   ├── vite.config.js
│   ├── vercel.json            ← config rewrite rute pentru Vercel
│   ├── .env.local             ← VITE_API_URL local (NU se publica pe Git)
│   └── package.json
├── tests/
│   └── weatherService.test.js ← teste unitare Jest
├── jest.config.js
├── .gitignore
└── README.md
```

---

## Instalare si Pornire Locala

### Prerequisite
- Node.js >= 18 — verifica cu `node --version`
- Cheie API OpenWeatherMap gratuita de la https://openweathermap.org/api

### Pasul 1: Cloneaza si instaleaza backend
```bash
git clone <url-repo>
cd weather-app/backend
npm install
```

### Pasul 2: Configureaza variabilele de mediu
```bash
cp .env.example .env
```

Editeaza `backend/.env`:
```
OPENWEATHER_API_KEY=cheia_ta_reala_de_la_openweathermap.org
PORT=5000
JSON_SERVER_URL=http://localhost:3000
```

### Pasul 3: Instaleaza frontend
```bash
cd ../frontend
npm install
```

Creeaza `frontend/.env.local`:
```
VITE_API_URL=http://localhost:5000
```

### Pasul 4: Pornire — 2 terminale

**Terminal 1 — Backend + json-server (pornite simultan cu concurrently):**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend React:**
```bash
cd frontend
npm run dev
```

### URL-uri locale
| Serviciu     | URL                      |
|--------------|--------------------------|
| Frontend     | http://localhost:5173    |
| Backend API  | http://localhost:5000    |
| json-server  | http://localhost:3000    |

---

## Deployment Render + Vercel

### Pasul 1: Pregatire cod pentru productie

Asigura-te ca `backend/package.json` contine:
```json
{
  "scripts": {
    "start": "concurrently \"json-server --watch db.json --port 3000\" \"node server.js\"",
    "dev":   "concurrently \"json-server --watch db.json --port 3000\" \"nodemon server.js\""
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

Asigura-te ca `frontend/vercel.json` exista:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Asigura-te ca `backend/public/` exista (necesar pentru json-server):
```bash
mkdir backend/public
touch backend/public/.gitkeep
```

Verifica `.gitignore` — `db.json` **NU trebuie sa apara** in .gitignore.

Commit si push:
```bash
git add .
git commit -m "chore: pregatire pentru deployment Render + Vercel"
git push origin main
```

---

### Pasul 2: Deployment backend pe Render

1. Mergi la https://render.com si inregistreaza-te cu contul GitHub
2. Click **New +** → **Web Service**
3. Click **Connect a repository** → selecteaza repository-ul proiectului
4. Completeaza configuratia:

| Camp             | Valoare                        |
|------------------|-------------------------------|
| Name             | `weather-app-backend`          |
| Language         | Node                           |
| Branch           | main                           |
| Region           | Frankfurt (EU Central)         |
| Root Directory   | `backend`                      |
| Build Command    | `npm install`                  |
| Start Command    | `npm start`                    |
| Instance Type    | Free                           |

5. In sectiunea **Environment Variables** adauga:

| Key                    | Value                  |
|------------------------|------------------------|
| `OPENWEATHER_API_KEY`  | cheia ta reala OWM     |
| `NODE_ENV`             | `production`           |

6. Click **Deploy Web Service** si asteapta 2-5 minute
7. URL-ul final: `https://weather-app-backend.onrender.com`

**Testeaza backend-ul:**
```bash
curl https://weather-app-backend.onrender.com/api/weather?city=Iasi
```

> ⚠️ **Sleep plan gratuit**: dupa 15 minute de inactivitate Render pune
> serviciul in sleep. Prima cerere dupa inactivitate poate dura 30-60 secunde.

> ⚠️ **Limitare db.json**: pe planul gratuit Render sistemul de fisiere este
> efemer — `db.json` se reseteaza la fiecare redeploy. Datele raman disponibile
> cat timp serviciul ruleaza, acceptabil pentru un proiect de laborator.

---

### Pasul 3: Deployment frontend pe Vercel

1. Mergi la https://vercel.com si inregistreaza-te cu contul GitHub
2. Click **Add New...** → **Project**
3. Selecteaza repository-ul din lista si click **Import**
4. Completeaza configuratia:

| Camp              | Valoare                              |
|-------------------|--------------------------------------|
| Project Name      | `weather-app`                        |
| Framework Preset  | Vite (detectat automat)              |
| Root Directory    | `frontend` ← click Edit si schimba! |
| Build Command     | `npm run build`                      |
| Output Directory  | `dist`                               |

5. In sectiunea **Environment Variables** adauga:

| Key             | Value                                            |
|-----------------|--------------------------------------------------|
| `VITE_API_URL`  | `https://weather-app-backend.onrender.com`       |

6. Click **Deploy** si asteapta 1-2 minute
7. URL-ul final: `https://weather-app.vercel.app`

---

### Pasul 4: Probleme frecvente

**CORS error in browser** — adauga URL-ul Vercel in `backend/server.js`:
```js
app.use(cors({
  origin: [
    "https://weather-app.vercel.app",  // URL-ul tau exact de pe Vercel
    "http://localhost:5173"
  ]
}));
```

**404 la refresh pe /history sau /favorites** — verifica ca `frontend/vercel.json` exista
si contine regula de rewrite.

**Eroare ENOENT la build pe Vercel** — in Vercel Dashboard → Settings → General
→ Root Directory → schimba in `frontend` → Save → Redeploy.

---

### Pasul 5: Actualizari viitoare

Orice push pe `main` declanseaza automat redeploy pe Render si Vercel:
```bash
git add .
git commit -m "fix: descriere modificare"
git push origin main
# Render si Vercel fac deploy automat in 2-3 minute
```

---

### URL-uri finale productie

| Serviciu             | URL                                                          |
|----------------------|--------------------------------------------------------------|
| Frontend (Vercel)    | `https://weather-app.vercel.app`                            |
| Backend API (Render) | `https://weather-app-backend.onrender.com`                  |
| Test API             | `https://weather-app-backend.onrender.com/api/weather?city=Iasi` |

---

## Functionalitati

- ✅ Cautare dupa **numele orasului** (ex: "Chicago IL")
- ✅ Afisare **temperatura in Celsius si Fahrenheit**
- ✅ **Rasarit si apus**, umiditate, vizibilitate, presiune
- ✅ **Directia vantului in cuvinte** (16 directii: nord, sud-vest, nord-nord-est etc.)
- ✅ **Tipul zilei** (frumoasa, ploioasa, furtuna, ninge, inghet etc.)
- ✅ **Haina sau umbrela** — recomandare automata
- ✅ **Procesarea meteo SEPARATA de afisare** (`weatherService.js`)
- ✅ **Geolocalizare** — locatia curenta din browser
- ✅ Prognoza **orara** (8 intervale x 3h) si **zilnica** (5 zile)
- ✅ **Calitatea aerului** (PM2.5, PM10, O3, NO2)
- ✅ **Orase favorite** cu previzualizare rapida a vremii
- ✅ **Istoricul cautarilor** salvat in json-server
- ✅ **Validare Joi** pe backend
- ✅ **Deployment** pe Render (backend) + Vercel (frontend)

---

## Documentatie API

### GET /api/weather
Preia datele meteo complete dupa oras sau coordonate.

Parametri (unul din doua variante):
- `city` — numele orasului (ex: `?city=Iasi`)
- `lat` + `lon` — coordonate GPS (ex: `?lat=47.1&lon=27.6`)

Raspuns exemplu:
```json
{
  "city": "Iași",
  "country": "RO",
  "lat": 47.1585,
  "lon": 27.6014,
  "current": {
    "tempCelsius": 18,
    "tempFahrenheit": 64,
    "feelsLikeCelsius": 16,
    "humidity": 65,
    "windSpeed": 15,
    "windDirection": { "text": "nord-vest", "emoji": "↖️", "abbr": "NV" },
    "description": "cer senin",
    "sunrise": "2026-04-27T04:23:00.000Z",
    "sunset": "2026-04-27T18:45:00.000Z"
  },
  "dayInterpretation": {
    "dayType": "frumoasa",
    "needsCoat": false,
    "needsUmbrella": false,
    "emoji": "☀️",
    "message": "Ce zi frumoasa! Cer senin si temperatura placuta.",
    "suggestion": "Zi perfecta pentru o plimbare."
  },
  "hourly": [...],
  "daily": [...],
  "alerts": []
}
```

### GET /api/weather/air?lat=&lon=
Calitatea aerului pentru coordonatele date.

### GET /api/geocode?city=
Geocodare oras — returneaza coordonate lat/lon.

### GET /api/searches
Istoricul cautarilor (din json-server).

### DELETE /api/searches/:id
Sterge o cautare din istoric.

### GET /api/favorites
Lista oraselor favorite.

### POST /api/favorites
Adauga oras la favorite. Body: `{ city, country, lat, lon }`

### DELETE /api/favorites/:id
Sterge un oras din favorite.

---

## Testare

### Teste unitare Jest
```bash
cd weather-app   # radacina proiectului (unde e package.json cu jest)
npm test
```

Testeaza functiile utilitare din `weatherService.js`:
- Conversii temperatura: Kelvin → Celsius, Celsius → Fahrenheit
- Directia vantului: grade → cuvinte (16 directii cardinale)
- Interpretarea zilei: tip zi, haina, umbrela

Rezultat asteptat: **29 teste, toate trec**

### Testare manuala API (curl)
```bash
# Vremea in Iasi
curl "http://localhost:5000/api/weather?city=Iasi"

# Calitatea aerului
curl "http://localhost:5000/api/weather/air?lat=47.1&lon=27.6"

# Adauga favorit
curl -X POST http://localhost:5000/api/favorites \
  -H "Content-Type: application/json" \
  -d '{"city":"Iași","country":"RO","lat":47.1585,"lon":27.6014}'

# Istoricul cautarilor
curl "http://localhost:5000/api/searches"
```

---

## Tehnologii

| Categorie             | Tehnologie                         |
|-----------------------|------------------------------------|
| Frontend              | React 18, React Router v6          |
| Styling               | Tailwind CSS v4                    |
| Build tool            | Vite v5                            |
| Backend               | Node.js >= 18, Express.js          |
| Date locale           | json-server + db.json              |
| Procese paralele      | concurrently                       |
| Validare backend      | Joi v17                            |
| API meteo             | OpenWeatherMap /data/2.5/ (gratuit)|
| Hot reload            | nodemon                            |
| Testare               | Jest v29                           |
| Deployment backend    | Render (Free tier)                 |
| Deployment frontend   | Vercel (Free tier)                 |

---

## Autori

Proiect 11 — Durnea Andrei & Lungu Christian