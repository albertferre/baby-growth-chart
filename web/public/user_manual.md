# User Manual

This manual explains how to use Baby Growth Chart, a web application for visualizing and calculating growth percentiles based on [WHO Child Growth Standards](https://www.who.int/tools/child-growth-standards/standards) for children aged 0–5 years.

## Introduction

The app provides three main sections, accessible from the sidebar (or top navigation on mobile):

1. **Calculator** — Calculate growth percentiles for weight, height, and head circumference simultaneously.
2. **Evolution** — Visualize growth over time with interactive charts using uploaded data or saved history.
3. **User Manual** — This page.

You can change the **gender** (Boys or Girls), the **language** (English, Spanish, Catalan), and the **theme** (light or dark) at any time. The **metric** selector (Weight, Height, Head Circumference) is only shown on the Evolution page, since the Calculator always displays all three measurements. Settings are hidden on this page.

## Baby Profiles

You can create profiles for one or more babies from the sidebar (or the profile selector on mobile):

1. Click **"Add baby"** and enter the baby's name.
2. Select the active profile by clicking on it — this is used to save and retrieve measurement history.
3. You can create multiple profiles (e.g. for twins) and switch between them.
4. Delete a profile by clicking the trash icon next to it.
5. On mobile, use the **profile dropdown** in the settings bar to switch between profiles.

## Calculator

The Calculator lets you find out which WHO percentile your baby's measurements fall into.

1. **Choose the age input method** by clicking the collapsible selector: birth date (saved automatically for future visits), age in days, or age in months.
2. **Enter one or more measurements** — weight (kg), height (cm), and/or head circumference (cm). All three fields are always visible; fill in whichever you have.
3. **Press Calculate.** The results show:
   - A **zone bar** for each measurement with a marker indicating where your baby falls (color-coded: green = normal, yellow = low/high, red = very low/very high).
   - The **percentile value** highlighted in bold within a descriptive text explaining what it means.
   - An **interpretation badge** (e.g. "Within normal range", "Below average").
   - A **summary message** with an overall assessment of your baby's growth.
   - The baby's **age** in months and days.
4. **Save** — If you have an active baby profile, click the Save button. You will be asked to confirm the date of the measurement before saving.
5. **Share** — Click the Share button to share the results via WhatsApp, email, or other apps (on mobile), or copy to clipboard (on desktop).
6. **Export** — Click the Export button to download the result as a PNG image.

### Measurement History

Below the results, a collapsible **Measurement History** section shows all saved measurements for the active profile in a table:

- View the date, age, weight, height, and head circumference of each saved measurement.
- **Edit** a measurement by clicking the pencil icon — the row becomes editable.
- **Delete** a measurement by clicking the trash icon.

## Evolution

The Evolution page displays interactive Plotly charts with the WHO percentile curves (P01, P25, P50, P75, P99) for the selected metric and gender.

### Data source

You can choose between two data sources:

- **Excel file** — Upload your own `.xlsx` file with measurements.
- **Saved history** — Use measurements saved from the Calculator (requires an active baby profile with saved measurements). This is selected automatically when history is available.

### Uploading your data

1. Click the **Upload** area or drag and drop your file.
2. The chart will display your baby's data as a colored line on top of the percentile curves.
3. A second chart will appear showing the estimated percentile at each recorded day.
4. To remove the uploaded data, click the **×** button next to the file name.

### Percentile change alerts

If your baby's percentile changes significantly between measurements (more than 20 points), the app will display an alert:

- **Drops** are highlighted in red with a recommendation to consult your pediatrician.
- **Rises** are highlighted in green.

### Exporting charts

Click the **"Export chart"** button above the chart to download it as a PNG image — useful for sharing with your pediatrician or family. On mobile, rotating to landscape mode gives you a full-screen chart view.

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

- **Metric:** Weight, Height, or Head Circumference — changes the Evolution page chart. The Calculator always shows all three.
- **Gender:** Boys or Girls — WHO growth curves differ by gender.
- **Baby profile:** Create and manage profiles for your babies. Select the active profile to save and retrieve measurements.
- **Language:** English, Spanish, or Catalan.
- **Theme:** Light or dark mode, toggled from the top-right corner.

## Medical Disclaimer

This tool is for **informational purposes only**. For any health concerns about your baby's growth, please consult a pediatrician or healthcare professional. The percentile data comes from the WHO Child Growth Standards.
