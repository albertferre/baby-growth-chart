# Growth Percentiles Visualization App

This is a Streamlit app that allows users to visualize growth percentiles based on gender, metric (weight, height, or head circumference), and time evolution. The app provides two main features: **Time Series Visualization** and **Percentile Calculator**.

## Features

### Time Series Visualization

- Visualize the time evolution of growth percentiles for a specific metric (weight, height, or head circumference) and gender (boys or girls).
- Upload your own data to compare against the growth percentiles.
- Display the growth percentiles (P01, P25, P50, P75, and P99) using discontinued lines to easily differentiate them.
- Optional bar plot visualization for uploaded data, showing percentiles at each day.

### Percentile Calculator

- Calculate the percentile of a specific numeric value (e.g., weight, height, or head circumference) for a baby born on a specific date.
- Estimate the baby's age in months and days since the birth date to calculate the percentile based on growth percentiles.
- Display the estimated percentile for the entered numeric value based on the growth percentiles.

## Getting Started

1. Clone the repository to your local machine.

2. Install the required dependencies by running the following command:
   ```
   pip install -r requirements.txt
   ```

3. Run the Streamlit app using the following command:
   ```
   streamlit run app.py
   ```

4. Access the app in your web browser by entering the URL displayed in the terminal.

Certainly! Below is the updated section of the README file specifying that the Excel files used in the app are from the World Health Organization:

## Data Sources

The growth percentiles data used in this app is sourced from the World Health Organization (WHO) and is based on standard growth charts. The data is loaded from Excel files in the `data` folder, which are named based on the metric and gender (e.g., `wfa-boys-percentiles-expanded-tables.xlsx`, `lhfa-girls-percentiles-expanded-tables.xlsx`, etc.).

## Dependencies

- Streamlit
- Plotly
- Pandas
- SciPy
- datetime

## License

This project is licensed under the [MIT License](LICENSE).

## Demo

Check out the live demo of the Baby Growth Chart Visualization App here: [https://baby-growth-chart.streamlit.app/](https://baby-growth-chart.streamlit.app/)
