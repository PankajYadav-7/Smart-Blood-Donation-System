# Jeevan Saarthi — Smart Blood Donation & Emergency Finder System

A full-stack web application built for my Final Year Project at Herald College Kathmandu, University of Wolverhampton.

## Project Overview

Jeevan Saarthi (meaning "Life Companion") is a platform that connects blood donors with patients in urgent need across Nepal. It enables real-time matching between donors, hospitals, NGOs, and patients.

## Student Information

- **Student:** Pankaj Yadav
- **Student ID:** 2431153
- **Course:** BSc Hons Computer Science
- **Institution:** Herald College Kathmandu
- **University:** University of Wolverhampton
- **Supervisor:** Mr. Bishal Shrestha
- **Module:** 6CS007 Project & Professionalism

## Technology Stack

**Frontend:**
- React.js with Vite
- Tailwind CSS
- React Router DOM
- Axios

**Backend:**
- Node.js
- Express.js
- MongoDB (local)
- JWT Authentication
- bcryptjs

## Key Features

- User registration with multiple roles (Donor, Hospital, NGO, Patient, Admin)
- Blood group compatibility matching
- Real-time blood request management
- Consent-based donor contact sharing
- Admin panel for user management
- Donor badges and certificates
- Emergency request system (no account required)

## How to Run

**Backend:**
```
cd server
npm install
npm run dev
```

**Frontend:**
```
cd client
npm install
npm run dev
```

## Environment Variables

Create a `.env` file inside the `server` folder:
```
MONGO_URI=mongodb://localhost:27017/blooddonation
JWT_SECRET=your_secret_key
```

## System Architecture

The system follows a standard MERN stack architecture with:
- React frontend running on port 5173
- Express backend running on port 5000
- MongoDB database running on port 27017

## FYP Subsystems

| Subsystem | Description |
|-----------|-------------|
| URM | User & Role Management |
| DMS | Donor Management System |
| RMS | Request Management System |
| MCS | Matching & Consent System |
| NS | Notification System |
| AVS | Admin & Verification System |