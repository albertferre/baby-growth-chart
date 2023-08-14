import streamlit as st
import plotly.express as px
import plotly.graph_objects as go
import pandas as pd
import scipy.stats as stats
from datetime import datetime, timedelta


def standard_normal_distribution(value, M, S, L, is_cumulative=True):
    # Convert value, mean, and standard deviation to z-score
    z_score = (((value) / M) ** L - 1) / (L * S)

    # Calculate the standard normal distribution
    if is_cumulative:
        result = stats.norm.cdf(z_score)
    else:
        result = stats.norm.pdf(z_score)

    return result * 100


def get_percentile(value, df, day):
    L = df.iloc[day]["L"]
    M = df.iloc[day]["M"]
    S = df.iloc[day]["S"]
    return standard_normal_distribution(value, M, S, L)


MEASURES_CODES = {"Weight": "wfa", "Height": "lhfa", "Head Circumference": "hcfa"}

MEASURES_UNITS = {"Weight": "kg.", "Height": "cm.", "Head Circumference": "cm."}

MEASURES_PROMT_MSG = {
    "Weight": "enter weight kg. value",
    "Height": "enter height cm. value",
    "Head Circumference": "enter head circumference cm. value",
}

MEASURES_INPUT = {"Weight": "w", "Height": "h", "Head Circumference": "hc"}

# Function to load data
def load_data(gender, measure):
    measure_code = MEASURES_CODES[measure]
    df = pd.read_excel(
        f"data/{measure_code}-{gender.lower()}-percentiles-expanded-tables.xlsx"
    )
    df.rename(columns={"Age": "Day"}, inplace=True)
    return df


# Function to create the Plotly plot
def create_plot(df, measure, gender, df_baby=None):
    fig = px.line(
        df,
        x="Day",
        y=["P01", "P25", "P50", "P75", "P99"],
        title=f"Time Evolution of {measure} Percentiles for {gender}",
        labels={"Day": "Days", "value": MEASURES_UNITS[measure]},
        line_shape="vh",
        color_discrete_map={
            "P01": "rgba(160, 160, 160, 0.2)",
            "P25": "rgba(160, 160, 160, 0.4)",
            "P50": "rgba(160, 160, 160, 1.0)",
            "P75": "rgba(160, 160, 160, 0.4)",
            "P99": "rgba(160, 160, 160, 0.2)",
        },
    )

    # Add a new red line to the graph
    if df_baby is not None:
        fig.add_trace(
            px.line(
                df_baby,
                x="day",
                y=MEASURES_INPUT[measure],
                line_shape="linear",
                color_discrete_map={MEASURES_INPUT[measure]: "rgba(0, 0, 255, 1.0)"},
            ).data[0]
        )

    return fig


def handle_file_upload():
    uploaded_file = st.sidebar.file_uploader(
        "Upload an Excel file", type=["xls", "xlsx"]
    )
    if uploaded_file is not None:
        df = pd.read_excel(uploaded_file)

        # Check if all required columns are present
        required_columns = ["day", "h", "w", "hc"]
        missing_columns = set(required_columns) - set(df.columns)

        if missing_columns:
            st.error(f"The uploaded file is missing the following columns: {', '.join(missing_columns)}. See user manual for more information")
            return None

        df["w"] = df["w"].interpolate(method="linear")
        df["h"] = df["h"].interpolate(method="linear")
        df["hc"] = df["hc"].interpolate(method="linear")
        return df


def sidebar_menu(option):
    options_dict = dict()
    if option == "Time series":
        # Show the dropdown menu for selecting the metric
        options_dict["measure"] = st.sidebar.selectbox(
            "Select Metric", ["Weight", "Height", "Head Circumference"]
        )

        # Add a sidebar with options "Boys" and "Girls"
        options_dict["gender"] = st.sidebar.radio("Select Gender", ("Boys", "Girls"))
    else:
        pass

    return options_dict


def evolution_page(df, measure, gender):
    """
    Display the evolution of a specific measure for different genders and compare it with baby data.

    Parameters:
        df (pandas.DataFrame): The main dataset containing the data for analysis.
        measure (str): The measure to be analyzed.
        gender (str): The gender for which the analysis is performed.

    """

    st.title("Values Evolution")
    # Handle file uploads
    df_baby = handle_file_upload()

    # Create the Plotly plot
    fig = create_plot(df, measure, gender, df_baby)

    # Show the Plotly plot using st.plotly_chart()
    st.plotly_chart(fig)

    if df_baby is not None:

        column = MEASURES_INPUT[measure]
        df_baby["P"] = df_baby.apply(
            lambda x: get_percentile(x[column], df, x.day), axis=1
        )

        bar_trace = go.Bar(x=df_baby.day, y=df_baby.P)

        # Create the figure using go.Figure() and add the trace to it
        fig = go.Figure(data=[bar_trace])

        # Update the layout if needed
        fig.update_layout(
            title="Percentile evolution",
            xaxis_title="Day",
            yaxis_title=f"{measure} percentile",
        )

        # Show the plot using st.plotly_chart()
        st.plotly_chart(fig)


def calculator_page(df, measure, gender):
    st.title("Percentile Calculator")

    # Add a date input widget
    selected_date = st.date_input("Select born date")
    # Calculate the difference between the selected date and today

    # Add a numeric input widget
    numeric_value = st.number_input(MEASURES_PROMT_MSG[measure])

    if selected_date is not None:
        today = datetime.today().date()
        days_difference = (today - selected_date).days

        # Calculate the difference in months and days
        difference_in_months = days_difference / 30.5

        # Display the selected date and difference in months and days
        difference_in_months = "{:.1f}".format(difference_in_months)
        st.write("Difference in months:", difference_in_months)

        # Display the selected date and days difference
        st.write("Days from selected date to today:", days_difference)

    percentile = get_percentile(numeric_value, df, days_difference)
    # Display the entered numeric value
    formatted_value = "{:.1f}%".format(percentile)
    st.write("Entered numeric value:", formatted_value)


def user_manual():
    # Read the contents of the Markdown file
    with open("user_manual.md", "r") as file:
        markdown_content = file.read()

    # Display the Markdown content in the app
    st.markdown(markdown_content)


def main():

    # Add a sidebar with options
    option = st.sidebar.radio(
        "Select option", ("User Manual", "Calculator", "Evolution")
    )

    # Show the dropdown menu for selecting the metric
    measure = st.sidebar.selectbox(
        "Select Metric", ["Weight", "Height", "Head Circumference"]
    )

    # Add a sidebar with options "Boys" and "Girls"
    gender = st.sidebar.radio("Select Gender", ("Boys", "Girls"))

    # Load the data
    df = load_data(gender=gender, measure=measure)

    if option == "User Manual":
        user_manual()
    elif option == "Evolution":
        evolution_page(df, measure, gender)
    else:
        calculator_page(df, measure, gender)


if __name__ == "__main__":
    main()
