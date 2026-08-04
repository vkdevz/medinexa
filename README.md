# 🏥 VeloCura (formerly MediNexa) — AI-Powered Digital Clinic Platform

VeloCura is a modern, premium digital clinic ecosystem built for startups. It bridges automated clinical intelligence with immediate, real-time doctor interventions via WebRTC and secure electronic health passport timeline integrations.

---

## 🌟 Core Features

### 1. 🤖 Conversational AI Symptom Triage Advisor
*   **Public Landing Page Chatbot**: Allows anonymous guest visitors to perform up to **3 symptom checks** for free.
*   **Conversion Barrier**: Exceeding the free check limit renders a lock screen modal directing guests to sign up or log in.
*   **Structured Medical Response**: Evaluates patient symptoms and categorizes severity (Mild, Moderate, Critical). Recommends home care remedies, safe OTC salt guidelines, and suggests direct communication channels.

### 📜 2. Unified Patient Health Passport Timeline
*   **Allergies Ledger**: Patients manage active salt, drug, and food allergies (flagged as red warning badges).
*   **Chronological Health Timeline**: Patients log surgeries, fractures, chronic illnesses, and medical milestones.
*   **Clinic Cohesion**: Automatically merges user-logged timeline items with official digital diagnoses and prescriptions issued by consulting doctors.
*   **Doctor Panel Inspection**: When a doctor opens a consultation, the window splits to show the patient's complete Health Passport in real-time, preventing adverse drug-allergy interactions.

### 📹 3. Peer-to-Peer Telehealth Rooms
*   **Instant WebRTC Rooms**: One-click voice or video call sessions launched directly from patient and doctor dashboards (using secure Jitsi Meet integrations).
*   **Dynamic Room Security**: Room tokens are created on-the-fly and bind to active session IDs.

### 📊 4. Vitals Logger & Metrics Trends
*   **Continuous Monitoring**: Logs blood pressure (systolic/diastolic), heart rate (BPM), and blood sugar levels (mg/dL).
*   **Trend Flags**: Color-coded threshold badges indicate normal, elevated, or critical vitals.

---

## 🛠️ Tech Stack

### Backend
*   **Language & Framework**: Java 21 / Spring Boot 3.3
*   **Security**: Stateless JSON Web Tokens (JWT) + Spring Security
*   **Database**: H2 Database Engine (with JPA/Hibernate ORM mappings)
*   **Testing**: Mockito unit testing suite

### Frontend
*   **Language & Framework**: React / Vite / Javascript ES6
*   **Styles**: Vanilla CSS & TailwindCSS
*   **Networking**: Axios interceptors with local session tracking

---

## 🚀 Installation & Local Setup

### Prerequisite Checklist
*   **Java Development Kit (JDK 21+)**
*   **Node.js (v20+ or v22.12+)**

### 1. Clone & Project Initialization
```bash
git clone https://github.com/vkdevz/medinexa.git
cd medinexa
```

### 2. Start the Backend API Server
```bash
cd medinexa-backend
./mvnw spring-boot:run
```
*   **Port**: `http://localhost:8080`
*   **Admin Seeder Credential**:
    *   *Email*: `admin@medinexa.com`
    *   *Password*: `admin_password`

### 3. Start the Frontend Client
```bash
cd medinexa-frontend
npm install
npm run dev
```
*   **URL**: `http://localhost:5173`

---

## 🧪 Running Tests
To run unit and integration tests inside the backend project directory:
```bash
cd medinexa-backend
./mvnw test
```
