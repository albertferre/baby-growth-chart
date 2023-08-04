import streamlit as st
import plotly.express as px
import plotly.graph_objects as go
import pandas as pd
import scipy.stats as stats

def standard_normal_distribution(value, M, S, L, is_cumulative=True):
    # Convert value, mean, and standard deviation to z-score
    z_score = (((value) / M) ** L - 1) / (L * S)

    # Calculate the standard normal distribution
    if is_cumulative:
        result = stats.norm.cdf(z_score)
    else:
        result = stats.norm.pdf(z_score)

    return result*100

def get_percentile(value, df, day):
    L = df.iloc[day]["L"]
    M = df.iloc[day]["M"]
    S = df.iloc[day]["S"]
    return standard_normal_distribution(value, M, S, L)

MEASURES_CODES = {
    "Weight": "wfa",
    "Height": "lhfa",
    "Head Circumference": "hcfa"
}

MEASURES_UNITS = {
    "Weight": "kg.",
    "Height": "cm.",
    "Head Circumference": "cm."
}

# Function to load data
def load_data(gender, measure):
    measure_code = MEASURES_CODES[measure]
    df = pd.read_excel(f"data/{measure_code}-{gender.lower()}-percentiles-expanded-tables.xlsx")
    df.rename(columns={"Age": "Day"}, inplace=True)
    return df

# Function to display the welcome message based on gender
def display_welcome_message(gender):
    if gender == "Boys":
        st.write("Welcome to the Boys section!")
    else:
        st.write("Welcome to the Girls section!")

# Function to create the Plotly plot
def create_plot(df, measure, df_baby=None):
    fig = px.line(df, x="Day", y=["P01", "P25", "P50", "P75", "P99"],
                  title=f"Time Evolution of {measure} Percentiles",
                  labels={"Day": "Days", "value": MEASURES_UNITS[measure]},
                  line_shape="linear",
                  color_discrete_map={
                      "P01": "rgba(255, 0, 0, 0.2)",
                      "P25": "rgba(255, 0, 0, 0.4)",
                      "P50": "rgba(255, 0, 0, 1.0)",
                      "P75": "rgba(255, 0, 0, 0.4)",
                      "P99": "rgba(255, 0, 0, 0.2)"
                  })

    # Add a new red line to the graph
    if df_baby is not None:
        fig.add_trace(px.line(df_baby, x="day", y="w", line_shape="linear",color_discrete_map={
                      "w": "rgba(255, 0, 0, 1.0)"
                  }).data[0])



    return fig

# Function to handle file uploads
def handle_file_upload():
    uploaded_file = st.sidebar.file_uploader("Upload an Excel file", type=["xls", "xlsx"])
    if uploaded_file is not None:
        df = pd.read_excel(uploaded_file)
        return df

def sidebar_menu(option):
    options_dict = dict()
    if option=="Time series":
        # Show the dropdown menu for selecting the metric
        options_dict["measure"] = st.sidebar.selectbox("Select Metric", ["Weight", "Height", "Head Circumference"])

        # Add a sidebar with options "Boys" and "Girls"
        options_dict["gender"] = st.sidebar.radio("Select Gender", ("Boys", "Girls"))
    else:
        pass

    return options_dict


def evolution_page():
        # Show the dropdown menu for selecting the metric
        measure = st.sidebar.selectbox("Select Metric", ["Weight", "Height", "Head Circumference"])

        # Add a sidebar with options "Boys" and "Girls"
        gender = st.sidebar.radio("Select Gender", ("Boys", "Girls"))

        # Handle file uploads
        df_baby = handle_file_upload()

        # Display welcome message based on gender
        display_welcome_message(gender)

        # Load the data
        df = load_data(gender=gender, measure=measure)



        # Create the Plotly plot
        fig = create_plot(df, measure, df_baby)



        # Show the Plotly plot using st.plotly_chart()
        st.plotly_chart(fig)

        if df_baby is not None:
            df_baby["P"] = df_baby.apply(lambda x: get_percentile(x.w, df, x.day), axis=1)
            bar_trace = go.Bar(x=df_baby.day, y=df_baby.P)


            # Create the figure using go.Figure() and add the trace to it
            fig = go.Figure(data=[bar_trace])

            # Update the layout if needed
            fig.update_layout(title="Bar Plot from Table", xaxis_title="Day", yaxis_title="w")

            # Show the plot using st.plotly_chart()
            st.plotly_chart(fig)


def main():
    st.title("Hello, World!")

    # Add a sidebar with options
    option = st.sidebar.radio("Select option", ("Individual", "Time series"))
    if option=="Time series":
        evolution_page()
    else:
        pass










if __name__ == "__main__":
    main()