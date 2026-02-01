# Baby Growth Chart

Visualize and calculate WHO growth percentiles (weight, height, head circumference) for children aged 0–5 years. Available as a **Streamlit app** and a **React web app**.

## Features

- **Percentile Calculator** — enter birth date and a measurement to get the exact growth percentile using the LMS method.
- **Time Series Evolution** — interactive Plotly charts with P01, P25, P50, P75 and P99 curves. Upload your own Excel data to overlay and track your baby's growth.
- **User Manual** — in-app documentation explaining how to use each feature.

## Quick start

### Prerequisites

- Python 3.11+ and [uv](https://docs.astral.sh/uv/) (for the Streamlit app)
- Node.js 18+ (for the web app)

### Streamlit app

```bash
make sync        # install Python dependencies
make run         # start the Streamlit app
```

### React web app

```bash
make web-install # install npm dependencies
make web-data    # convert WHO Excel files to JSON
make web-dev     # start the Vite dev server (localhost:5173)
```

For a production build:

```bash
make web-build   # outputs to web/dist/
```

## Project structure

```
├── app.py                  # Streamlit application
├── data/                   # WHO growth percentile Excel files
├── user_manual.md          # User documentation
├── web/                    # React + Vite frontend
│   ├── scripts/            #   Excel → JSON converter
│   ├── public/data/        #   Generated JSON (gitignored)
│   ├── src/
│   │   ├── pages/          #   Calculator, Evolution, UserManual
│   │   └── utils/          #   LMS percentile math, data loading
│   └── package.json
├── Makefile
└── pyproject.toml
```

## Available `make` targets

| Target | Description |
|---|---|
| `make run` | Start the Streamlit app |
| `make sync` | Install/update Python dependencies |
| `make lint` | Run ruff linter |
| `make format` | Auto-format Python code |
| `make check` | Run all checks (lint + format) |
| `make clean` | Remove cache and temporary files |
| `make web-install` | Install web app npm dependencies |
| `make web-data` | Convert Excel data to JSON for the web app |
| `make web-dev` | Start web app dev server |
| `make web-build` | Build web app for production |

## Data sources

Growth percentile data is sourced from the [World Health Organization (WHO)](https://www.who.int/tools/child-growth-standards/standards) standard growth charts. The six Excel files in `data/` cover weight-for-age, length/height-for-age, and head-circumference-for-age for boys and girls (0–1856 days).

## Tech stack

| | Streamlit app | Web app |
|---|---|---|
| **Framework** | Streamlit | React 19 + Vite |
| **Charts** | Plotly | react-plotly.js |
| **Percentile math** | scipy (norm.cdf) | Custom normal CDF (Abramowitz & Stegun) |
| **Data loading** | pandas + openpyxl | Pre-converted JSON via fetch |

## License

[MIT](LICENSE)

## Demo

Streamlit version: [baby-growth-chart.streamlit.app](https://baby-growth-chart.streamlit.app/)
