
# 🩺 ClinicalMind AI (Clinical OS)

<div align="center">

![Project Status](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/license-MIT-blue)
![Tech](https://img.shields.io/badge/Built%20With-React%2019%20%7C%20Gemini%20Pro%20%7C%20Tailwind-cyan)

**A High-Fidelity Clinical Diagnostic Simulation Platform powered by Google Gemini.**  
*Futuristic Interface • Real-time Vitals • Dynamic Visual Engine • AI Assessment*

[Live Demo](#) · [Report Bug](#) · [Request Feature](#)

</div>

---

## 📖 Introduction (项目介绍)

**ClinicalMind AI** is a web-based medical simulation workbench designed for medical students and residents. Unlike traditional text-based simulators, it features a **"Sci-Fi Medical OS"** interface (Dark Mode) that mimics high-end hospital monitoring systems.

It leverages **Google Gemini 2.5/Pro** to act as a standardized patient, a dynamic physiological engine, and an expert medical tutor simultaneously.

### ✨ Key Features (核心功能)

*   **🖥️ Immersive Medical Workbench**: 3-Column layout featuring Patient Monitor, Dialogue Stream, and Mock HIS (Hospital Information System).
*   **🫀 Dynamic Visual Engine**:
    *   **Real-time Vitals**: ECG waveforms that sync with the simulated Heart Rate.
    *   **SVG Composite Avatar**: Patient appearance (sweating, pallor, pain, consciousness) changes dynamically based on clinical deterioration or improvement.
    *   **Urgency Feedback**: UI flashes Red/Yellow based on patient stability.
*   **🏥 Mock HIS System**:
    *   Simulated Charting (History, Orders, Diagnosis).
    *   Realistic Lab/Imaging order workflow.
*   **🧠 AI Tutor & Scoring**:
    *   End-of-session evaluation comparing user actions against clinical Gold Standards.
    *   Radar charts for skill breakdown (History, Exam, Diagnosis).
*   **🌍 Multi-Language**: Native support for **English** and **Chinese (简体中文)** switching.
*   **🎨 Customizable Themes**: Switch between high-contrast "Sci-Fi Dark" modes (Cyan, Emerald, Rose) and a traditional **"Clinical Light"** mode via Settings.
*   **🛠️ Case Studio**: Built-in editor to manually create or edit clinical scenarios.

---

## 📸 Screenshots (界面演示)

| **Immersive Workbench** | **Case Library Dashboard** |
|:---:|:---:|
| ![Main Interface](https://via.placeholder.com/600x350/0f172a/06b6d4?text=3-Column+Medical+Interface) | ![Case Dashboard](https://via.placeholder.com/600x350/0f172a/06b6d4?text=Case+Selection+Library) |
| *Real-time Patient Monitor, Chat, and HIS* | *Select from Specialty or Custom Cases* |

| **Dynamic Patient Avatar** | **AI Evaluation Report** |
|:---:|:---:|
| ![Patient Monitor](https://via.placeholder.com/600x350/0f172a/ef4444?text=Dynamic+Avatar+%26+ECG) | ![Evaluation](https://via.placeholder.com/600x350/0f172a/10b981?text=Performance+Scorecard) |
| *Visual feedback changes with patient state* | *Detailed grading and missed items analysis* |

---

## ⚡ Tech Stack (技术栈)

*   **Frontend**: React 19, TypeScript, Vite
*   **Styling**: Tailwind CSS (with custom animations for ECG/Alerts)
*   **AI Core**: Google GenAI SDK (`@google/genai`)
*   **State Management**: React Hooks & Context
*   **Icons**: Heroicons / Custom SVGs

---

## 🚀 Quick Start (快速开始)

### Prerequisites
*   Node.js (v18 or higher)
*   Google Gemini API Key (Get it from [Google AI Studio](https://aistudio.google.com/))

### 💻 Local Installation (本地部署)

1.  **Clone the repo**
    ```sh
    git clone https://github.com/yourusername/clinical-mind-ai.git
    cd clinical-mind-ai
    ```

2.  **Install dependencies**
    ```sh
    npm install
    ```

3.  **Set up Environment Variables**
    Create a `.env` file in the root directory:
    ```env
    # Your Google Gemini API Key
    API_KEY=your_api_key_here
    ```
    *(Note: The app also supports entering the API Key via the Settings UI)*

4.  **Run the development server**
    ```sh
    npm run dev
    ```

5.  **Open in Browser**
    Visit `http://localhost:5173`

---

## ☁️ Deployment (一键部署)

You can deploy this project to the cloud in minutes.

### Option 1: Vercel (Recommended)

1.  Push your code to a GitHub repository.
2.  Click the button below (or import your repo in Vercel).
3.  Add your `API_KEY` in the Vercel Environment Variables settings.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Option 2: Netlify

1.  Drag and drop your `dist` folder (after running `npm run build`) or connect Git.
2.  Set `API_KEY` in **Site Settings > Build & Deploy > Environment**.

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)

---

## 📂 Project Structure

```text
src/
├── components/
│   ├── CaseDashboard.tsx   # Main Lobby (Netflix-style grid)
│   ├── PatientMonitor.tsx  # Left Sidebar (Avatar + ECG + Vitals)
│   ├── Dashboard.tsx       # Right Sidebar (HIS System)
│   ├── ChatMessage.tsx     # Dialogue bubbles & Medical Reports
│   └── ...
├── services/
│   └── geminiService.ts    # AI Logic (Prompts, JSON Protocol)
├── utils/
│   ├── translations.ts     # i18n Dictionary
│   └── storage.ts          # LocalStorage helper
├── types.ts                # TypeScript Interfaces
└── App.tsx                 # Main Controller
```

## 🛡️ Privacy & Security Note

This is a client-side application.
*   **API Keys**: If you deploy this publicly, **do not** hardcode your API Key in the code. Use the "Settings" panel in the app to let users input their own keys, or use a backend proxy if you want to provide the service yourself.
*   **Data**: All custom cases and chat history are stored in the browser's `localStorage` and are not sent to any server other than Google's AI API for processing.

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <p>Designed with ❤️ by ClinicalMind Team</p>
</div>