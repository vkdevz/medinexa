# MediNexa Frontend - React Web Application

This is the frontend portal of the **MediNexa Next-Generation Digital Healthcare Platform**, built with React.js, React Router, Tailwind CSS, and Axios.

---

## 🛠️ Technology Stack
- **Library:** React.js
- **Build Tool:** Vite (high performance dev server)
- **Styling:** Tailwind CSS (utility-first styling framework)
- **Routing:** React Router v6
- **HTTP Client:** Axios (API interactions with token intercepts)

---

## 📂 Project Structure
```
medinexa-frontend/
├── public/                 # Static assets (favicons, manifest)
├── src/
│   ├── assets/             # Brand logos & design media
│   ├── components/         # Shared/Reusable UI components
│   ├── context/            # AuthContext & global state providers
│   ├── hooks/              # Custom hooks
│   ├── layouts/            # Dashboard & main layouts
│   ├── pages/              # Portal view pages (Patient, Doctor, Admin)
│   ├── services/           # Axios client & API endpoints mapping
│   ├── App.css             # App overrides
│   ├── App.jsx             # Main router configurations
│   ├── index.css           # Tailwind injection point
│   └── main.jsx            # React app mount bootstrap
├── tailwind.config.js      # Tailwind configurations & colors
├── postcss.config.js       # PostCSS config for Tailwind
├── index.html              # Core single-page template
└── package.json            # Node project configuration
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (v9 or higher)

### Run the Application

Navigate to the directory and install dependencies (if not already done):
```bash
npm install
```

Start the Vite local development server:
```bash
npm run dev
```

The application will run at `http://localhost:5173`. Any changes in source files will live-update in the browser using Hot Module Replacement (HMR).

### Linting & Formatting
Run oxlint / linter commands:
```bash
npx oxlint
```
