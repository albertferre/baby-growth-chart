# User Manual

This manual explains how to use Baby Growth Chart, a web application for visualizing and calculating growth percentiles based on [WHO Child Growth Standards](https://www.who.int/tools/child-growth-standards/standards) for children aged 0–5 years.

## Introduction

The app provides three main sections, accessible from the sidebar (or top navigation on mobile):

1. **Calculator** — Calculate the growth percentile for a single measurement.
2. **Evolution** — Visualize growth over time with interactive charts and your own data.
3. **User Manual** — This page.

You can change the **metric** (Weight, Height, or Head Circumference), the **gender** (Boys or Girls), and the **language** (English, Spanish, Catalan) at any time from the sidebar settings.

## Calculator

The Calculator lets you find out which WHO percentile a measurement falls into.

1. **Choose the age input method:** birth date (saved automatically for future visits), age in days, or age in months.
2. **Enter the measurement value** (weight in kg, height in cm, or head circumference in cm).
3. **Press Calculate.** The result shows a circular gauge with the exact percentile, along with the age in months and days.
4. **Export** — Click the Export button to download the result as a PNG image.

## Evolution

The Evolution page displays interactive Plotly charts with the WHO percentile curves (P01, P25, P50, P75, P99) for the selected metric and gender.

### Uploading your data

You can overlay your baby's measurements on the chart by uploading an Excel file (`.xlsx`):

1. Click the **Upload** area or drag and drop your file.
2. The chart will display your baby's data as a colored line on top of the percentile curves.
3. A second chart will appear showing the estimated percentile at each recorded day.
4. To remove the uploaded data, click the **&times;** button next to the file name.

### Downloading the template

If you don't have an Excel file yet, click **"Download template"** to get a pre-filled `.xlsx` file with the correct format and sample data. You can then replace the sample values with your baby's real measurements.

### Excel file format

Your Excel file must have these **4 columns** as headers in the first row:

| Column | Description | Example |
|--------|-------------|---------|
| `day` | Age in days (from birth) | 0, 30, 60, 90... |
| `w` | Weight in kg | 3.2, 4.5, 5.8... |
| `h` | Height in cm | 50, 54, 58... |
| `hc` | Head circumference in cm | 35, 37, 39... |

**Tips:**

- Column names must be **exactly** as shown above (lowercase).
- You can leave cells empty if you don't have that measurement — gaps will be linearly interpolated.
- Use decimal point (`.`) not comma (`,`) for decimal values.
- Data must be in the **first sheet** of the Excel file.

### Example

| day | w    | h  | hc |
|-----|------|----|----|
| 0   | 3.2  | 50 | 35 |
| 30  | 4.1  | 54 | 37 |
| 60  | 5.0  | 58 | 39 |
| 90  | 5.8  | 61 | 40 |

## Settings

- **Metric:** Weight, Height, or Head Circumference — changes both the Calculator and Evolution pages.
- **Gender:** Boys or Girls — WHO growth curves differ by gender.
- **Language:** English, Spanish, or Catalan.
- **Theme:** Light or dark mode, toggled from the top-right corner.

## Medical Disclaimer

This tool is for **informational purposes only**. For any health concerns about your baby's growth, please consult a pediatrician or healthcare professional. The percentile data comes from the WHO Child Growth Standards.
