# 🏛️ Smart Public Grievance Management System

A **Smart Public Grievance Management System** designed to simplify how citizens submit, track, and manage public complaints. The platform combines a modern web interface with **AI-powered grievance classification, duplicate detection, voice-to-text input, and location-based complaint management**.

The system is designed to make grievance reporting more accessible while helping authorities organize, prioritize, and resolve complaints efficiently.

## 🌐 Live Demo

🚀 **Live Application:**
https://smart-public-grievance-managment.vercel.app

---

## 📌 Project Overview

Traditional grievance systems can make it difficult for citizens to submit complaints, track their status, and communicate issues effectively. This project provides a centralized digital platform where citizens can:

* Submit public grievances online
* Describe complaints using text or voice
* Submit complaints in **Tamil-English (Tanglish)**
* Automatically classify grievances using NLP
* Detect potentially duplicate complaints
* Attach complaint location
* Track grievance status and progress
* View previously submitted complaints

The system aims to improve **accessibility, transparency, and efficiency** in public grievance management.

---

## ✨ Key Features

### 👤 Citizen Grievance Submission

Citizens can submit complaints through a simple web interface by providing:

* Complaint title
* Complaint description
* Category
* Location
* Supporting information

---

### 🎙️ Voice-to-Text Complaint

The platform supports **voice-based complaint input**, allowing users to speak their grievance instead of typing it manually.

This can be particularly useful for:

* Users who prefer speaking over typing
* Mobile users
* Users with limited typing ability
* Faster complaint submission

The captured speech is converted into text and used as the grievance description.

---

### 🧠 Tanglish Grievance Classification

The system is designed to handle **Tanglish**, where Tamil and English are mixed in the same sentence.

For example:

> "Road la romba periya pothole irukku"

The NLP service analyzes the complaint and helps classify it into the appropriate grievance category.

This improves accessibility for users who naturally communicate using Tamil-English code-mixed language.

---

### 🔎 Duplicate Complaint Detection

The system analyzes newly submitted grievances against existing complaints to identify potentially similar or duplicate issues.

For example:

* "Street light not working near bus stop"
* "Bus stop pakkathula street light work aagala"

These complaints may refer to the same underlying issue.

Duplicate detection can help authorities:

* Reduce repeated complaints
* Identify recurring public issues
* Consolidate similar grievances
* Prioritize problems affecting multiple citizens

---

### 📍 Location-Based Grievance Management

Citizens can associate a grievance with a specific location.

Location information can help authorities understand **where an issue is occurring** and identify clusters of complaints in particular areas.

Examples include:

* Road damage
* Street-light problems
* Garbage accumulation
* Water leakage
* Drainage issues
* Public infrastructure problems

---

### 📊 Grievance Tracking

Citizens can track the progress of their submitted complaints through different stages, such as:

```text
Submitted
    ↓
Under Review
    ↓
Assigned
    ↓
In Progress
    ↓
Resolved
```

This provides better visibility into the grievance resolution process.

---

## 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │      Citizen        │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   React Frontend    │
                    │                     │
                    │ • Complaint Form    │
                    │ • Voice Input       │
                    │ • Maps / Location    │
                    │ • Status Tracking   │
                    └──────────┬──────────┘
                               │
                               │ REST API
                               ▼
                    ┌─────────────────────┐
                    │   Spring Boot API   │
                    │                     │
                    │ • Grievances        │
                    │ • Users             │
                    │ • Categories       │
                    │ • Status Management │
                    └──────┬───────┬──────┘
                           │       │
                ┌──────────┘       └──────────┐
                ▼                             ▼
      ┌──────────────────┐          ┌──────────────────┐
      │      MySQL       │          │   Python NLP     │
      │                  │          │     Service      │
      │ • Users          │          │                  │
      │ • Grievances     │          │ • Tanglish       │
      │ • Categories     │          │   Classification │
      │ • Status         │          │ • Duplicate      │
      │ • Locations      │          │   Detection      │
      └──────────────────┘          └──────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend

* **React.js**
* JavaScript
* HTML5
* CSS3
* Responsive UI
* Maps / Location Integration
* Voice-to-Text

### Backend

* **Spring Boot**
* Java
* REST APIs
* Spring Data JPA

### Database

* **MySQL**

Used for storing:

* User information
* Grievances
* Categories
* Complaint status
* Location information
* Complaint history

### AI / NLP

* **Python**
* Natural Language Processing
* Tanglish text processing
* Grievance classification
* Duplicate complaint detection

### Deployment

* **Vercel** – Frontend deployment
* Backend/NLP services can be deployed independently depending on the deployment configuration

---

## 🔄 Grievance Workflow

```text
Citizen
   │
   ▼
Submit Grievance
   │
   ├── Text Input
   │
   └── Voice Input
          │
          ▼
      Voice-to-Text
          │
          ▼
    Grievance Processing
          │
          ├── Category Classification
          │
          └── Duplicate Detection
                    │
                    ▼
             Store in Database
                    │
                    ▼
              Track Status
                    │
                    ▼
                 Resolve
```

---

## 🧩 Main Modules

### 1. Citizen Module

* User registration/login
* Submit grievance
* Voice-based complaint input
* Location selection
* View submitted grievances
* Track grievance status

### 2. Grievance Management

* Create grievance
* Categorize grievance
* Store complaint details
* Update grievance status
* Maintain complaint history

### 3. NLP Module

* Process complaint text
* Handle Tanglish input
* Classify grievance category
* Identify similar complaints
* Detect potential duplicates

### 4. Location Module

* Select complaint location
* Associate coordinates with grievances
* Support location-based analysis
* Identify recurring problems in specific areas

---

## 📂 Suggested Project Structure

```text
Smart-Public-Grievance-Managment/
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       └── App.jsx
│
├── backend/
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       └── resources/
│   └── pom.xml
│
├── nlp-service/
│   ├── models/
│   ├── classifier/
│   ├── duplicate_detection/
│   ├── app.py
│   └── requirements.txt
│
├── README.md
└── .gitignore
```

> Update the structure above if your actual repository uses different folder names.

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

* Node.js
* npm
* Java JDK
* Maven
* MySQL
* Python 3.x
* Git

---

### 1. Clone the Repository

```bash
git clone https://github.com/Nithish23013509/Smart-Public-Grievance-Managment.git
cd Smart-Public-Grievance-Managment
```

### 2. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

### 3. Start the Spring Boot Backend

Configure the MySQL database and update the application configuration.

Then run:

```bash
cd backend
mvn spring-boot:run
```

### 4. Start the NLP Service

```bash
cd nlp-service
pip install -r requirements.txt
python app.py
```

---

## 🗄️ Database

The application uses **MySQL** for persistent data storage.

Typical entities include:

```text
User
 └── User ID
 └── Name
 └── Email
 └── Password

Grievance
 └── Grievance ID
 └── User ID
 └── Title
 └── Description
 └── Category
 └── Status
 └── Location
 └── Created Date

Category
 └── Category ID
 └── Category Name

Grievance History
 └── History ID
 └── Grievance ID
 └── Status
 └── Updated Date
```

---

## 🔐 Security

The application should follow secure development practices including:

* Password protection
* Authentication and authorization
* Input validation
* API validation
* Environment variables for secrets
* Database access controls
* CORS configuration

Sensitive credentials such as database passwords and API keys should **never be committed to GitHub**.

---

## 🎯 Use Cases

The system can be used for managing complaints related to:

* 🛣️ Roads and potholes
* 💡 Street lights
* 🚰 Water supply
* 🗑️ Garbage collection
* 🚽 Drainage and sanitation
* 🏗️ Public infrastructure
* 🌳 Public spaces
* 🚦 Traffic-related infrastructure
* 🏘️ Local civic issues

---

## 🌟 Advantages

* **Easy complaint submission**
* **Voice-based accessibility**
* **Tanglish support**
* **AI-assisted classification**
* **Duplicate complaint detection**
* **Location-aware complaints**
* **Centralized grievance management**
* **Transparent status tracking**
* **Reduced manual categorization**
* **Better identification of recurring issues**

---

## 🔮 Future Enhancements

Possible future improvements include:

* 📱 Android/iOS mobile application
* 🤖 Advanced multilingual NLP
* 🗺️ Heatmaps for grievance hotspots
* 🔔 SMS and email notifications
* 📈 Administrative analytics dashboard
* 🚨 Automatic priority/severity detection
* 🧑‍💼 Officer assignment and workload management
* 📷 Image-based issue classification
* 🗣️ Multilingual voice support
* 📊 Predictive analysis of recurring civic issues

---

## 🎓 Project Purpose

This project was developed as an **academic and practical full-stack project** to explore how modern web technologies, NLP, voice interfaces, and location-based services can be combined to improve digital public-service delivery.

Government grievance platforms commonly provide mechanisms for citizens to lodge and track complaints; this project explores a student-built approach with additional AI and accessibility features.



## 🌐 Project Links

| Resource     | Link                                                                |
| ------------ | ------------------------------------------------------------------- |
| 🚀 Live Demo | https://smart-public-grievance-managment.vercel.app                 |
| 💻 GitHub    | https://github.com/Nithish23013509/Smart-Public-Grievance-Managment |

---

## ⭐ If You Like This Project

If you find this project useful or interesting:

⭐ Star the repository
🍴 Fork the repository
💡 Suggest improvements
🐛 Report issues

---

