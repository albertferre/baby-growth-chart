# User Manual for Streamlit App

This user manual provides guidance on how to use the Streamlit app for visualizing growth percentiles based on gender, metric (weight, height, or head circumference), and time evolution.

## Introduction
The Streamlit app provides two main features:

1. **Time Series Visualization:** This feature allows you to visualize the time evolution of growth percentiles for a specific metric (weight, height, or head circumference) and gender (boys or girls). You can also upload your own data to compare against the percentiles.

2. **Percentile Calculator:** This feature enables you to calculate the percentile of a numeric value (e.g., weight, height, or head circumference) for a baby born on a specific date. The app calculates the baby's age in months and days since the birth date and then estimates the percentile based on growth percentiles.

## Getting Started

1. **Access the Streamlit App:** Open the Streamlit app by running the Python script provided. You can access it in your web browser by entering the URL displayed in the terminal after running the script.

2. **Select Option:** The app will prompt you to select one of the two available options:
   - **Calculator:** Calculate the percentile for a specific numeric value based on the baby's birth date.
   - **Evolution:** Visualize the time evolution of growth percentiles for a specific metric and gender.

## Calculator Option

1. **Select Gender:** Choose the gender for which you want to calculate the growth percentile (boys or girls) using the radio button on the left sidebar.

2. **Select Metric:** Choose the metric (weight, height, or head circumference) using the dropdown menu on the left sidebar.

3. **Select Birth Date:** Enter the baby's birth date using the date picker input labeled "Select born date."

4. **Enter Numeric Value:** Input the numeric value (e.g., weight in kg, height in cm, or head circumference in cm) you want to calculate the percentile for. The required input label will be dynamically updated based on the chosen metric.

5. **View Results:** The app will display the difference in months and days between the birth date and today. Additionally, it will show the estimated percentile for the entered numeric value based on the growth percentiles.

## Evolution Option

1. **Select Gender:** Choose the gender (boys or girls) for which you want to visualize the time evolution of growth percentiles using the radio button on the left sidebar.

2. **Select Metric:** Choose the metric (weight, height, or head circumference) using the dropdown menu on the left sidebar.

3. **Upload Data (Optional):** If you have data to compare against the growth percentiles, you can upload an Excel file using the "Upload an Excel file" option in the left sidebar. The app will visualize your data as a red line along with the growth percentiles.

4. **View Plot:** The app will display a Plotly line plot showing the time evolution of growth percentiles for the chosen metric and gender. The percentiles (P01, P25, P50, P75, and P99) will be displayed using discontinued lines, making it easier to differentiate them.

5. **View Bar Plot (Optional):** If you uploaded data, the app will display a bar plot based on the uploaded data, representing the percentiles at each day.

## Conclusion

With the Streamlit app, you can easily visualize the growth percentiles for different metrics and genders, as well as calculate the estimated percentile for a specific numeric value based on a baby's birth date. Additionally, you can compare your own data against the growth percentiles to gain valuable insights into the baby's growth and development.