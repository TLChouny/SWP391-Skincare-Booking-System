# 🌟 SWP391 - Skincare Booking System

The **Skincare Booking System** is a modern web application designed to manage skincare service bookings for a skincare center. It empowers customers to explore services, take skin quizzes, book appointments, and connect with skin therapists, while providing staff and managers with robust tools to streamline operations.

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Installation](#installation)
6. [Usage](#usage)
7. [Testing](#testing)
8. [Deployment](#deployment)
9. [References](#references)
10. [Contributing](#contributing)
11. [License](#license)

---

## 🌍 Project Overview
This project aims to simplify skincare service management for a single center. It supports multiple user roles with tailored features:
- **Guests**: Explore services and content.
- **Customers**: Book services and manage profiles.
- **Skin Therapists**: Handle appointments and results.
- **Staff**: Manage bookings and operations.
- **Managers**: Oversee analytics and configurations.

---

## ✨ Features
- 🏠 **Homepage**: Showcases the center, services, therapist profiles, blog, and news.
- 📝 **Skin Assessment Quiz**: Recommends services based on customer responses.
- 📅 **Booking System**: 
  - Book services with optional therapist selection.
  - Workflow: 
    1. Customer books → 
    2. Staff check-in → 
    3. Therapist assignment (if needed) → 
    4. Service execution → 
    5. Staff check-out.
- 💳 **Payment & Cancellation**: Manages payment policies and cancellations.
- ⚙️ **Service Management**: Configures services, schedules, and pricing.
- 👩‍⚕️ **Therapist Management**: Profiles include expertise, experience, and schedules.
- ⭐ **Rating & Feedback**: Collects customer reviews.
- 📚 **Customer Profiles**: Tracks history and details.
- 📊 **Dashboard & Reports**: Analytics for staff and managers.

---

## 🛠️ Tech Stack
- **Frontend**: 
  - ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white) 
  - ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
  - Deployed on ![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)
- **Backend**: 
  - ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
  - Deployed on ![Railway](https://img.shields.io/badge/Railway-0B0D0E?style=flat&logo=railway&logoColor=white)
- **Database**: 
  - ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white) (MongoDB Atlas)

---

## 📂 Project Structure
SWP391-Skincare-Booking-System/
├── frontend/              # Frontend source code
│   ├── src/              # TypeScript source files
│   ├── public/           # Static assets
│   ├── tailwind.config.js # Tailwind CSS configuration
│   └── package.json      # Frontend dependencies
├── backend/              # Backend source code
│   ├── src/              # Node.js source files
│   ├── .env              # Environment variables
│   └── package.json      # Backend dependencies
├── README.md             # Project documentation
└── .gitignore            # Git ignore file

---

## 🚀 Installation
### Prerequisites
- ![Node.js](https://img.shields.io/badge/Node.js-16+-339933?style=flat&logo=node.js) installed
- MongoDB Atlas account or local MongoDB
- npm or yarn
- Vercel CLI (`npm i -g vercel`) & Railway CLI (`npm i -g railway`)

### Steps
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/SWP391-Skincare-Booking-System.git
   cd SWP391-Skincare-Booking-System
🎯 Usage
🌐 Guests: Browse services and take quizzes.
👤 Customers: Register, book, and review.
👩‍⚕️ Therapists: Manage bookings and log results.
🧑‍💼 Staff: Check-in/out, assign therapists.
📈 Managers: Configure and analyze via dashboard.
🧪 Testing
Frontend: Run npm run test (if tests are implemented).
Backend: Use tools like Postman to test API endpoints.
Ensure MongoDB connection is active before testing.
📚 References
Dermalogica
Revival Labs Virtual Skincare Consultation
🤝 Contributing
Fork the repo.
Create a branch: git checkout -b feature/your-feature.
Commit changes: git commit -m "Add feature".
Push: git push origin feature/your-feature.
Submit a Pull Request.
📜 License
This project is licensed under the MIT License - see  for details.
📸 Screenshots (Optional)
Add screenshots of your app here for visual appeal.
Homepage:
![image](https://github.com/user-attachments/assets/ee464a49-7210-4776-b3a4-b6a51ce0a714)

Booking:
![image](https://github.com/user-attachments/assets/b81a73b2-8ba2-4c8d-8587-fe7932b36319)

Happy coding! 🚀
