
# DataCleanr ✨

<div align="center">
  <img src="https://raw.githubusercontent.com/firebase/firebase-studio/main/static/images/datacleanr_logo.png" alt="DataCleanr Logo" width="150">
  <p>
    <strong>The intelligent tool to clean, preprocess, and analyze your datasets with ease.</strong>
  </p>
  <p>
    Transform raw data into actionable insights in minutes.
  </p>
</div>

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn/ui-000000?style=for-the-badge&logo=shadcnui&logoColor=white)](https://ui.shadcn.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)

</div>

---

## 🚀 Overview

DataCleanr is a modern web application designed to dramatically simplify the data preprocessing workflow. It provides a user-friendly interface to upload, clean, and analyze datasets, bridging the gap between raw data and machine learning-ready formats. Whether you're a data scientist, analyst, or student, DataCleanr empowers you to bypass tedious cleaning tasks and focus on what truly matters: deriving insights.

The application features both automated and manual cleaning modes, backed by a powerful Python/Flask backend, and delivers a comprehensive Exploratory Data Analysis (EDA) report to guide your analysis.

## ✨ Key Features

-   **Seamless Data Upload**: Upload `.csv` or `.xlsx` files from your local machine, or directly load data from a public URL.
-   **Interactive Data Preview**: Instantly view a snapshot of your dataset in a clean, scrollable table to understand its structure.
-   **Automated Cleaning**: With a single click, apply a smart, default preprocessing pipeline that handles common data issues.
-   **Manual Control Pipeline**: For advanced users, a multi-step sidebar allows for fine-tuned configuration of cleaning steps:
    -   Column selection (dropping unnecessary features)
    -   Missing value imputation (mean, median, mode, etc.)
    -   Outlier handling
    -   Categorical data encoding (One-Hot, Label)
    -   Numerical feature scaling (Standard Scaler, Min-Max)
-   **Comprehensive EDA Dashboard**: Automatically generate and display a detailed EDA report from `ydata-profiling`, showing key insights like data types, null counts, distributions, and correlations.
-   **Downloadable Assets**: At the end of the workflow, easily download your cleaned dataset and the full HTML EDA report.

## 🛠️ Technology Stack

DataCleanr is built with a modern, robust, and scalable technology stack.

### Frontend

-   **Framework**: [Next.js](https://nextjs.org/) (with App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **UI Library**: [React](https://reactjs.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Component Library**: [ShadCN UI](https://ui.shadcn.com/)
-   **State Management**: React Context API
-   **Data Parsing**: `papaparse` for CSV, `xlsx` for Excel files.
-   **Deployment**: Firebase App Hosting

### Backend

-   **Framework**: [Flask](https://flask.palletsprojects.com/)
-   **Language**: [Python](https://www.python.org/)
-   **Core Libraries**:
    -   `pandas` for data manipulation.
    -   `ydata-profiling` for generating detailed EDA reports.
    -   `scikit-learn` for preprocessing tasks.

## ⚙️ Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

-   Node.js (v18 or later)
-   npm or yarn

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/DataCleanr.git
    cd DataCleanr
    ```

2.  **Install NPM packages:**
    ```sh
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root of the project and add the URL of your backend server.
    ```env
    NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:5000
    ```

4.  **Run the development server:**
    ```sh
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📋 Project Structure

The frontend codebase is organized to be modular and maintainable.

```
src/
├── app/                  # Next.js App Router pages and layouts
├── components/           # Reusable React components (UI, layout, features)
│   └── ui/               # Core ShadCN UI components
├── context/              # React Context for global state (e.g., data management)
├── hooks/                # Custom React hooks
└── lib/                  # Utility functions and libraries
```

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

Please feel free to fork the repo, create a feature branch, and submit a pull request.

---

Built with ❤️ by the Firebase Studio team.
