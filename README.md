# Three.js Game Project

## Descriere

Joc 3D cu mașină, pietre și copaci realizat cu Three.js.

## Rulare locală

### 1. Direct cu Python

```bash
python3 -m http.server 8000
```

Sau folosind scriptul:

```bash
./server.sh
```

### 2. Cu Docker Compose

```bash
docker-compose up
```

Pentru rebuild:

```bash
docker-compose up --build
```

Pentru a opri:

```bash
docker-compose down
```

## Acces

Deschide browser la: http://localhost:8000

## Controlere

- **↑↓←→** - Direcție
- **SPACE** - Accelerează
- **R** - Resetează

## Structură Proiect

```
basic/
├── index.html          # Pagina principală
├── index.js            # Logic joc
├── config.js           # Configurare constantelor
├── components/         # Componente modulare
│   ├── car.js         # Mașină
│   ├── copac.js       # Copaci
│   ├── drum.js        # Drum
│   ├── lumini.js      # Lumini
│   ├── particles.js   # Sistem particule
│   └── piatra.js      # Pietre
└── docker-compose.yml # Configurare Docker
```

## Dezvoltare

Toate fișierele sunt montate ca volume în Docker, deci modificările sunt reflectate instant. Reîmprospătează browser-ul pentru a vedea schimbările.
