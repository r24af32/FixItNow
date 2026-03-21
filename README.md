# 🛠️ FixItNow - Neighborhood Service & Repair Marketplace

## Documentation Policy

- Use README.md as the full, permanent project note (architecture, setup, milestones, and usage).
- Use README_TASK_CHANGES.md only for temporary task-level updates and short-term implementation notes.

## 📖 Project Overview

FixItNow is a full-stack neighborhood service platform designed to connect residents with nearby verified service professionals (electricians, plumbers, carpenters, cleaners, etc.).

This repository contains the progress of the application development from **Week 1 to Week 5**, encompassing the core authentication, service listing, location-based searching, and the complete booking transaction engine.

---

## 💻 Tech Stack

* **Frontend:** React.js, Tailwind CSS, React Router
* **Backend:** Spring Boot (Java), Spring Security
* **Database:** MySQL, Hibernate / Spring Data JPA
* **Authentication:** JWT (JSON Web Tokens) for stateless session management
* **External APIs:** Google Maps API, HTML5 Geolocation API

---

## 🚀 Development Progress (Weeks 1 - 5)

### 🚩 Milestone 1: Authentication & Basic Setup (Weeks 1 - 2)

* **Project Architecture:** Initialized the React frontend and Spring Boot backend repositories.
* **Database Design:** Created the initial MySQL schemas for `Users` with distinct roles (`CUSTOMER`, `PROVIDER`, `ADMIN`).
* **Secure Auth:** Implemented robust JWT-based login and registration flows to protect API endpoints.
* **Role-Based Routing:** Built secure React routes ensuring users are directed to their specific dashboards based on their role.
* **Provider Onboarding:** Developed a specialized registration form for providers to input their service categories, skills, and capture their exact location coordinates using the browser's Geolocation API.

### 🚩 Milestone 2: Service Listings & Search (Weeks 3 - 4)

* **Service Catalog:** Created the database structure for parent categories (e.g., Plumbing) and subcategories (e.g., Pipe Repair).
* **Provider Services Manager:** Built a CRUD interface for providers to list their specific offerings, setting custom prices and availability.
* **Customer Discovery:** Developed the main Customer Dashboard allowing users to browse services dynamically.
* **Map Integration:** Integrated Google Maps API to visually display nearby service providers based on the customer's radius.
* **Service Details:** Built the detail view for individual services, displaying the provider's information, aggregate ratings, and historical reviews.

### 🚩 Milestone 3 (Part 1): Core Booking Engine (Week 5)

* **Time Slot Selection:** Integrated a calendar and time-slot picker into the Service Detail page.
* **Transactional Payload:** Engineered a secure booking creation flow that maps the `customerId`, `providerId`, and `serviceId` together into the database.
* **Provider Request Dashboard:** Built a real-time queue where providers can view incoming jobs and their specific details.
* **Lifecycle State Machine:** Implemented the full job status flow (`PENDING` → `CONFIRMED` → `COMPLETED` or `CANCELLED`). Providers and Customers can update these statuses dynamically without page reloads.

---

## ⚙️ How to Run the Project Locally

### 1. Database Setup

1. Open MySQL Workbench.
2. Create a new schema named `fixitnow`.
3. Update your Spring Boot `application.properties` with your MySQL username and password.

### 2. Start the Backend (Spring Boot)

1. Navigate to the `backend` folder.
2. Run `mvn clean install` to install dependencies.
3. Run the application via your IDE or using `mvn spring-boot:run`. The API will start on `http://localhost:8080`.

### 3. Start the Frontend (React)

1. Navigate to the `frontend` folder.
2. Run `npm install` to install dependencies.
3. Add your Google Maps API key to your `.env` file (`REACT_APP_GOOGLE_MAPS_API_KEY=your_key_here`).
4. Run `npm start`. The app will open at `http://localhost:3000`.

---

### 🚩 Milestone 4: Real-Time Chat, Access Control & Admin System (Week 6)

* **Multi-Admin Real-Time Chat:** Implemented WebSocket fanout pattern using Spring WebSocket + STOMP where all admin staff see the same customer/provider conversations in real-time. Messages sent by any admin are instantly visible to all other admins.
* **Shared Chat History:** Added specialized query methods to retrieve shared conversation threads regardless of which admin ID queries them.
* **Dynamic Admin Support:** Frontend dynamically fetches admin support user ID at runtime instead of hard-coding values, with graceful fallback if endpoint is unavailable.
* **Chat Synchronization:** Implemented polling fallback (1.5s interval) to ensure message delivery if WebSocket connection is momentarily delayed.
* **User Suspension & Restoration:** Admins can now suspend user accounts (customers or providers), which immediately:
  - Prevents suspended users from creating new bookings or services
  - Suspends all associated provider services
  - Disables booking/service features while maintaining chat access for support
* **Provider Approval Workflow:** Implemented pending provider approval system where incomplete provider profiles are marked as "awaiting approval".
* **Access Control System:** Created a comprehensive access control layer:
  - Suspended users can only access chat; booking and service features are unavailable
  - Pending providers cannot create/modify services until approved by admin
  - Frontend displays warning banner for limited-access users
  - Sidebar navigation adapts to show only available features
* **Admin Dashboards:** Built/enhanced admin management interfaces:
  - **Users Management:** View all users, filter by role, suspend/activate accounts with single-click restoration
  - **Provider Approvals:** Review pending providers with approve/reject buttons
  - **Service Management:** Monitor provider services with real-time statistics (completed jobs, total revenue, average ratings)
  - **Dispute Resolution:** Resolve or dismiss customer reports
* **Real-Time Statistics:** Admin dashboards now display actual computed statistics from database:
  - Number of completed jobs per provider
  - Total revenue per provider (sum of completed booking prices)
  - Average customer rating per provider
  - Review count per provider
* **Code Quality Improvements:**
  - Removed all debug console.log statements from chat components
  - Removed temporary backup files
  - Removed unused icon imports and helper functions
  - Fixed security configuration to require authentication for message history endpoints
  - Added proper production-grade comments and error handling

---

## 🔜 Next Steps (Week 7)

* **Review & Rating System:** Enabling customers to leave a 1-5 star rating and feedback comment after a provider marks a job as `COMPLETED`.
* **Chat Message Persistence:** Ensure all chat messages are properly stored and retrievable in the database for audit and support purposes.
* **Push Notifications:** Implement real-time notifications for booking requests, chat messages, and status updates.
* **Enhanced Admin Analytics:** Add date-range filtering, export capabilities, and trend analysis to admin dashboards.
