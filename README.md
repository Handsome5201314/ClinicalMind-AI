
# 🩺 ClinicalMind AI (Clinical OS)

<div align="center">

![Project Status](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/license-MIT-blue)
![Tech](https://img.shields.io/badge/Stack-React%2019%20%7C%20Gemini%202.5%20%7C%20Tailwind-cyan)

**A High-Fidelity Clinical Diagnostic Simulation Platform powered by Google Gemini.**  
*Telemedicine Interface • Real-time Vitals • Voice Interaction • AI Assessment*

[Live Demo](#) · [Report Bug](#) · [Request Feature](#)

</div>

---

## 📖 Introduction (项目介绍)

**ClinicalMind AI** is a next-generation medical simulation workbench designed for medical students and residents. It transforms a standard LLM interaction into a **"Sci-Fi Medical OS"** experience.

Unlike text-based chatbots, this system features a **Physiological Engine** that simulates vital signs (HR, BP, SpO2) in real-time, reacting to the patient's simulated pain and stress levels. Users can interact via text or **Voice Call**, order tests via a mock HIS system, and receive a graded evaluation at the end.

### ✨ Key Features (核心功能)

#### 🏥 The Clinical Workbench
*   **Dynamic Patient Monitor**: Real-time ECG waveforms, SpO2 pleth waves, and vital signs that drift and fluctuate based on physiological algorithms.
*   **Procedural Avatar**: An SVG-based visual engine that updates the patient's appearance (sweating, pallor, consciousness, breathing rate) based on their clinical state.
*   **Mock HIS System**: A realistic Hospital Information System for charting history, ordering labs (CBC, BMP, CT, etc.), and finalizing diagnoses.

#### 🗣️ Telemedicine Mode (New!)
*   **Voice Interaction**: Full duplex voice support using **Web Speech API**. Speak to the patient naturally, and hear them reply with synthesized speech.
*   **Live Transcription**: Real-time speech-to-text transcription overlaid on the video feed.

#### ⚡ Case Studio & Smart Import (New!)
*   **AI Smart Import**: Paste raw, unstructured clinical notes or upload a text file. The AI analyzes the text and auto-fills a structured simulation case (HPI, Vitals, Lab Results).
*   **Manual Editor**: Fine-tune difficulty, demographics, and hidden diagnosis details.

#### 🧠 AI Tutor & Evaluation
*   **Gold Standard Comparison**: The system compares your actions against the ideal clinical pathway.
*   **Performance Radar**: Visual breakdown of your skills in History Taking, Physical Exam, and Diagnosis.

#### 🎨 Customization
*   **Visual Themes**: Switch between **Cyan (Default)**, **Emerald (Bio)**, **Rose (Emergency)**, or **Clinical Light** modes.
*   **Environment**: Upload custom background images to simulate different environments (ER, ICU, Ambulance).
*   **Multi-Language**: Native support for **English** and **Chinese (简体中文)**.

---

## 📸 Interface Overview

| **Telemedicine & Monitor** | **HIS Workstation** |
|:---:|:---:|
| ![Telemedicine](https://via.placeholder.com/600x350/0f172a/06b6d4?text=Voice+Call+%26+Avatar) | ![HIS](https://via.placeholder.com/600x350/0f172a/06b6d4?text=Orders+%26+Charting) |
| *Real-time Avatar, ECG, Voice Call* | *Lab Orders, Notes, Diagnosis* |

| **Case Studio** | **AI Evaluation** |
|:---:|:---:|
| ![Studio](https://via.placeholder.com/600x350/0f172a/10b981?text=Smart+Import+%26+Editor) | ![Evaluation](https://via.placeholder.com/600x350/0f172a/f43f5e?text=Grading+%26+Feedback) |
| *Smart Import unstructured data* | *Detailed performance metrics* |

---

## ⚡ Tech Stack (技术栈)

*   **Frontend**: React 19, TypeScript, Vite
*   **Styling**: Tailwind CSS (Glassmorphism, Custom Animations)
*   **AI Core**: Google GenAI SDK (`@google/genai`)
*   **Audio**: Web Speech API (STT/TTS) + Web Audio API (Procedural Heart Sounds)
*   **State**: React Hooks & Context

---

## 🚀 Quick Start (快速开始)

### Prerequisites
*   Node.js (v18+)
*   Google Gemini API Key (Get it from [Google AI Studio](https://aistudio.google.com/))
*   *Note: Voice features require a browser supporting Web Speech API (Chrome/Edge/Safari).*

### 💻 Local Installation (本地部署)

1.  **Clone the repository**
    ```sh
    git clone https://github.com/yourusername/clinical-mind-ai.git
    cd clinical-mind-ai
    ```

2.  **Install dependencies**
    ```sh
    npm install
    ```

3.  **Configuration**
    *   Create a `.env` file in the root directory:
        ```env
        API_KEY=your_google_api_key_here
        ```
    *   *Alternatively, you can enter the API Key directly in the App Settings UI.*

4.  **Run the application**
    ```sh
    npm run dev
    ```

5.  **Access**
    Open `http://localhost:5173` in your browser.

---

## 🛠️ Configuration & Customization

Click the **Settings (Gear Icon)** in the dashboard to:
1.  **Change AI Model**: Switch between `gemini-2.5-flash` (faster) or `gemini-3-pro` (smarter).
2.  **Assign Roles**: Use different models for the Patient (Simulation) vs. the Tutor (Evaluation).
3.  **Customize Appearance**: Change the theme color or upload a custom ER/Office background image.

---

## 🤝 Contributing

Contributions are welcome!
1.  Fork the project.
2.  Create your feature branch (`git checkout -b feature/NewFeature`).
3.  Commit your changes.
4.  Push to the branch.
5.  Open a Pull Request.

## 📜 License

Distributed under the MIT License.

---

<div align="center">
  <p>Designed for Medical Education & AI Research</p>
</div>
