# SWP391 - Skincare Booking System

The **Skincare Booking System** is a web application designed to manage skincare service bookings for a skincare center. It provides an intuitive platform for customers to explore services, take skin assessment quizzes, book appointments with specific skin therapists, and manage their profiles. Additionally, it offers staff and managers tools to handle bookings, check-ins/check-outs, therapist assignments, payment policies, and generate reports.

## Table of Contents
1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Installation](#installation)
5. [Usage](#usage)
6. [Deployment](#deployment)
7. [References](#references)
8. [Contributing](#contributing)
9. [License](#license)

## Project Overview
The Skincare Booking System aims to streamline the process of booking and managing skincare services for a single skincare center. It caters to multiple user roles including Guests, Customers, Skin Therapists, Staff, and Managers, each with tailored functionalities.

## Features
- **Homepage**: Introduces the skincare center, available services, skin therapist profiles, blog posts, news, and updates.
- **Skin Assessment Quiz**: Allows customers to take a quiz and receive personalized skincare service recommendations.
- **Booking System**: Enables customers to book services and optionally select a preferred skin therapist.
- **Booking Workflow**:
  - Customers book a service (with or without specifying a therapist).
  - Staff perform check-in for customers at the center.
  - Staff assign a therapist if not pre-selected.
  - Therapists perform the service and log results.
  - Staff handle check-out.
- **Payment & Cancellation Policy**: Manages payment processes and cancellation rules.
- **Service Management**: Allows configuration of services, center working schedules, and pricing.
- **Skin Therapist Management**: Manages therapist profiles (general info, expertise, experience, schedules).
- **Rating & Feedback**: Collects and manages customer ratings and feedback.
- **Customer Profiles**: Tracks customer details and booking history.
- **Dashboard & Reports**: Provides insights and analytics for staff and managers.

## Technology Stack
- **Frontend**: TypeScript, Tailwind CSS, deployed on Vercel
- **Backend**: Node.js, deployed on Railway
- **Database**: MongoDB, hosted on MongoDB Atlas

## Installation
Follow these steps to set up the project locally:

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB instance)
- Vercel CLI (optional, for deployment)
- Railway CLI (optional, for deployment)

### Steps
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/SWP391-Skincare-Booking-System.git
   cd SWP391-Skincare-Booking-System
