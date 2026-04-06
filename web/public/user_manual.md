# User Manual

This manual explains how to use Baby Growth Chart, a web application for visualizing and calculating growth percentiles based on the [WHO Child Growth Standards](https://www.who.int/tools/child-growth-standards/standards) for children aged 0 to 5 years.

## Introduction

The app has three main sections, accessible from the top navigation bar (or bottom bar on mobile):

1. **Calculator** — Calculate growth percentiles for weight, height, and head circumference simultaneously.
2. **Evolution** — Visualize growth over time with interactive charts using uploaded data or saved history.
3. **User Manual** — This page.

You can change the **language** (English, Spanish, Catalan) at any time from the language selector in the top bar.

## Baby Profiles

You can create and manage profiles for one or more babies from the profile selector in the top bar:

1. Click the profile selector and press **"Add baby"**. Enter the name and select the gender (boy or girl).
2. Select the active profile by clicking on it — it's used to save and retrieve measurement history, and the gender is automatically applied to calculations.
3. You can create multiple profiles (e.g. for twins) and switch between them.
4. **Edit** a profile by clicking the pencil icon to change the name or gender.
5. **Delete** a profile by clicking the trash icon.

When a profile is active, the gender selector doesn't appear in the calculator since the profile's gender is used. Without a profile, you can select the gender directly in the measurement form.

## Calculator

The Calculator lets you know which WHO percentile your baby's measurements fall into.

1. **Choose the age input method** using the tabs: birth date (saved automatically), age in days, or age in months.
2. **Enter one or more measurements** — weight (kg), height (cm), and/or head circumference (cm). Fill in whichever you have.
3. **Press Calculate.** Results show:
   - A **progress bar** for each measurement with a zone indicator (normal, low, high, etc.).
   - The **percentile value** in large format.
   - A **status label** with icon indicating the zone.
4. **Save** — If you have an active profile, click the Save button below the results. You'll be asked to confirm the measurement date.
5. **Create profile** — If no profile is active, a button appears to create one so you can save measurements.
6. **Share / Export** — Use the buttons below results to share or download as a PNG image.

### Upcoming Milestones

If you have a birth date configured, the calculator shows upcoming pediatric milestones (checkups, nutrition, motor development) with links to official sources.

### Measurement History

A **History** section shows saved measurements for the active profile:

- View the date, age (in months or years), weight, height, and head circumference.
- **Edit** a measurement by clicking the pencil icon.
- **Delete** a measurement by clicking the trash icon.

### Recent History

On the right side of the calculator, the last 3 measurements are shown with all recorded metrics (e.g. "8.2kg · 72cm · HC 45cm").

## Evolution

The Evolution page shows interactive charts with the **WHO Average** line (50th percentile) and shaded bands for the P1-P99 and P25-P75 percentile ranges.

### Register Measurements

Click the **"Register Weight"** button (or Height / Head Circumference depending on the selected metric) to quickly add a new measurement. A dialog opens where you enter the value and date (defaults to today). If no profile is active, the button lets you create one.

### Data Source

You can choose between two sources:

- **Saved history** — Uses measurements saved from the Calculator. Automatically selected when history is available.
- **Excel file** — Upload your own `.xlsx` file with measurements.

### Growth Chart

The chart shows:
- **Solid blue line**: WHO Average (50th percentile).
- **Darker blue band**: P25-P75 range (normal zone).
- **Lighter blue band**: P1-P99 range (wide zone).
- **Baby's line**: Your baby's measurements overlaid.

The X-axis shows age in months, with "Birth" as the starting point.

### Alerts

The right sidebar shows alerts if:
- The **current percentile** is low or very low.
- There has been a **significant percentile change** between measurements (rise or drop of more than 20 points).

### Export Charts

Click **"Export chart"** to download it as a PNG image.

### Excel File Format

Your Excel file must have these **4 columns** as headers:

| Column | Description | Example |
|--------|-------------|---------|
| `day` | Age in days (from birth) | 0, 30, 60, 90... |
| `w` | Weight in kg | 3.2, 4.5, 5.8... |
| `h` | Height in cm | 50, 54, 58... |
| `hc` | Head circumference in cm | 35, 37, 39... |

**Tips:**

- Column names must be **exactly** as shown (lowercase).
- You can leave cells empty — gaps are linearly interpolated.
- Use period (`.`) for decimals.
- Data must be on the **first sheet** of the Excel file.

## Data Sources

Sources used for milestones and standards are linked in the footer:

- **WHO Child Growth Standards** — Weight, height, and head circumference percentile curves.
- **AAP Bright Futures** — Pediatric checkup schedule.
- **WHO Infant Feeding Guidelines** — Nutrition milestones.
- **WHO Motor Development Study** — Motor development milestones.

## Medical Disclaimer

This tool is for **informational purposes only**. For any concerns about your baby's growth, consult a pediatrician or healthcare professional.
