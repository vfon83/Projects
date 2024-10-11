"""
This application uses the 'Breast Cancer Wisconsin (Diagnostic)' dataset from the UCI Machine Learning Repository. 
The dataset provides features for predicting whether a tumor is malignant or benign, based on characteristics 
from a digitized image of a fine needle aspirate (FNA) of a breast mass.

Dataset Reference:
Dua, D. and Graff, C. (2019). UCI Machine Learning Repository. Irvine, CA: University of California, School of ICS.

License:
This dataset is licensed under a Creative Commons Attribution 4.0 International (CC BY 4.0) license. 
You are free to share, copy, and adapt the dataset, provided proper attribution is given.

About the Code:
This code trains a Random Forest Classifier to predict cancer tumor malignancy based on the dataset's features. 
It uses Streamlit for an interactive web app, allowing users to input tumor data and get live predictions 
with a confidence score.
"""

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import streamlit as st

# Load the dataset from the UCI Machine Learning Repository
url = "https://archive.ics.uci.edu/static/public/17/data.csv"
column_names = ['ID', 'radius1', 'texture1', 'perimeter1', 'area1', 
                'smoothness1', 'compactness1', 'concavity1', 
                'concave_points1', 'symmetry1', 'fractal_dimension1', 
                'radius2', 'texture2', 'perimeter2', 'area2', 
                'smoothness2', 'compactness2', 'concavity2', 
                'concave_points2', 'symmetry2', 'fractal_dimension2', 
                'radius3', 'texture3', 'perimeter3', 'area3', 
                'smoothness3', 'compactness3', 'concavity3', 
                'concave_points3', 'symmetry3', 'fractal_dimension3', 
                'Diagnosis']

# Read the data into a Pandas DataFrame
data = pd.read_csv(url, header=0, names=column_names)

# Data Preprocessing: Convert Diagnosis labels from 'B'(benign)/'M'(malignant) to binary
data['Diagnosis'] = data['Diagnosis'].map({'B': 0, 'M': 1})

# Feature Selection: Identify the relevant features for model training
feature_columns = [col for col in data.columns if 'radius' in col or 'texture' in col or 
                   'perimeter' in col or 'area' in col or 
                   'smoothness' in col or 'compactness' in col or 
                   'concavity' in col or 'concave_points' in col or 
                   'symmetry' in col or 'fractal_dimension' in col]
 
# Define features (X) and target variable (y)
X = data[feature_columns]
y = data['Diagnosis']

# Split the data (80% train, 20% test)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Initialize and train the Random Forest Classifier
model = RandomForestClassifier()
model.fit(X_train, y_train)

# Make predictions on the test set
y_pred = model.predict(X_test)

# Evaluate the model's performance using accuracy and classification report
accuracy = accuracy_score(y_test, y_pred)
report = classification_report(y_test, y_pred)

# Streamlit Application: Setting up the web app for breast cancer prediction
st.title("Breast Cancer Prediction App")

# User input section for tumor characteristics
st.subheader("Enter tumor characteristics:")
radius1 = st.number_input("Radius 1")
texture1 = st.number_input("Texture 1")
perimeter1 = st.number_input("Perimeter 1")
area1 = st.number_input("Area 1")
smoothness1 = st.number_input("Smoothness 1")
compactness1 = st.number_input("Compactness 1")
concavity1 = st.number_input("Concavity 1")
concave_points1 = st.number_input("Concave Points 1")
symmetry1 = st.number_input("Symmetry 1")
fractal_dimension1 = st.number_input("Fractal Dimension 1")
radius2 = st.number_input("Radius 2")
texture2 = st.number_input("Texture 2")
perimeter2 = st.number_input("Perimeter 2")
area2 = st.number_input("Area 2")
smoothness2 = st.number_input("Smoothness 2")
compactness2 = st.number_input("Compactness 2")
concavity2 = st.number_input("Concavity 2")
concave_points2 = st.number_input("Concave Points 2")
symmetry2 = st.number_input("Symmetry 2")
fractal_dimension2 = st.number_input("Fractal Dimension 2")
radius3 = st.number_input("Radius 3")
texture3 = st.number_input("Texture 3")
perimeter3 = st.number_input("Perimeter 3")
area3 = st.number_input("Area 3")
smoothness3 = st.number_input("Smoothness 3")
compactness3 = st.number_input("Compactness 3")
concavity3 = st.number_input("Concavity 3")
concave_points3 = st.number_input("Concave Points 3")
symmetry3 = st.number_input("Symmetry 3")
fractal_dimension3 = st.number_input("Fractal Dimension 3")

# Create a DataFrame for the user input features
input_data = pd.DataFrame([[radius1, texture1, perimeter1, area1, smoothness1, 
                             compactness1, concavity1, concave_points1, 
                             symmetry1, fractal_dimension1, radius2, texture2, 
                             perimeter2, area2, smoothness2, compactness2, 
                             concavity2, concave_points2, symmetry2, 
                             fractal_dimension2, radius3, texture3, 
                             perimeter3, area3, smoothness3, compactness3, 
                             concavity3, concave_points3, symmetry3, 
                             fractal_dimension3]], 
                           columns=X.columns)

# Prediction: Make a prediction based on user input
if st.button("Predict"):
    prediction = model.predict(input_data)
    confidence = model.predict_proba(input_data).max() * 100
    diagnosis = "Malignant" if prediction[0] == 1 else "Benign"
    emoji = "\U0001F534" if prediction[0] == 1 else "\U0001F7E2"
    st.success(f"{emoji} The tumor is predicted to be: **{diagnosis}** with **{confidence:.2f}%** confidence. {emoji}")

# Display model evaluation metrics for user reference
st.subheader(f"Accuracy of the model: {accuracy * 100:.2f}%")
