# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Added

- **React + Vite web app** (`web/`) as a standalone frontend alternative to Streamlit
  - Percentile Calculator with visual gauge and gender-colored indicators
  - Evolution page with interactive Plotly charts and Excel upload (drag-and-drop style)
  - User Manual page rendered from Markdown
  - Sidebar with navigation, metric selector, and gender toggle
  - Responsive layout (desktop + mobile)
  - LMS percentile calculation using Abramowitz & Stegun normal CDF approximation (no server-side dependencies)
- Excel-to-JSON conversion script (`web/scripts/convert-data.js`) to pre-process WHO data for the browser
- Makefile targets: `web-install`, `web-dev`, `web-build`, `web-data`

## [0.2.0] - 2026-02-01

### Fixed

- Crash when no date was selected in the calculator (`days_difference` undefined)
- `IndexError` for babies older than 5 years (added bounds check in `get_percentile`)
- Input validation for future birth dates and non-positive measurements
- Defensive column rename (`Age` -> `Day`) to handle both `wfa`/`hcfa` and `lhfa` file formats

### Changed

- Migrated dependency management from `requirements.txt` / `environment.yml` to `pyproject.toml` + `uv`
- Added `Makefile` with `run`, `sync`, `clean`, `lint`, `format`, `check` targets
- Added `.python-version` (3.11)

## [0.1.3] - 2024-04-19

### Changed

- Updated Streamlit version pin

## [0.1.2] - 2023-08-14

### Fixed

- Handled edge case with `None` return in percentile calculation
- Added docstring to `standard_normal_distribution` function

## [0.1.1] - 2023-08-05

### Added

- Excel file upload for custom baby data with column validation (`day`, `h`, `w`, `hc`)
- Linear interpolation for missing values in uploaded data
- Bar chart showing percentile evolution over time
- User manual page (`user_manual.md`)
- Plot titles for evolution charts
- Code formatted with Black

## [0.1.0] - 2023-08-04

### Added

- Initial release
- Streamlit app with sidebar navigation (Calculator, Evolution, User Manual)
- Percentile calculator using WHO LMS method (`scipy.stats.norm.cdf`)
- Time series visualization with P01, P25, P50, P75, P99 curves (Plotly)
- WHO growth data for weight, height, and head circumference (boys & girls, 0–5 years)
