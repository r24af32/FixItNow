# FixItNow - Neighborhood Service and Repair Marketplace

FixItNow is a full-stack neighborhood service platform that connects residents with nearby electricians, plumbers, carpenters, appliance repairers, and other professionals. It provides service discovery, booking, chat, reviews, payment flow, and admin moderation in one role-based application.

## Project Statement

The product vision is to deliver a trusted local-services experience with:

- Location-based service search and booking
- Category and subcategory filtering
- Instant booking with time slots
- Provider profiles with ratings and reviews
- Real-time communication between customers and providers
- Admin verification, dispute handling, and platform analytics

## Technology Stack

- Frontend: React.js, React Router, Tailwind CSS, Recharts, Leaflet
- Backend: Spring Boot (Java), Spring Security, Spring Data JPA, WebSocket/STOMP
- Database: MySQL
- Authentication: JWT
- Maps and Location: Google Maps API, Geolocation API
- AI Assistant: Google Gemini via @google/genai

## System Modules

- Module A: User and Provider Management (registration, authentication, roles)
- Module B: Service Listing and Location-based Search
- Module C: Booking and Scheduling
- Module D: Reviews, Ratings, and Chat
- Module E: Admin Dashboard (verification, disputes, analytics)

## Milestone Plan and Delivery Status

Status legend:

- Done: Implemented and available in current project
- Partial: Implemented in core flow, with optional enhancements pending
- Planned: Defined in plan but not fully delivered yet

### Milestone 1 (Weeks 1-2) - Authentication and Basic Setup

Planned tasks from reference document:

- Set up frontend and backend architecture
- JWT authentication (login and registration)
- User model with roles (customer, provider, admin)
- Role-based routing and dashboards
- Geolocation capture during onboarding
- Provider registration form with category, skills, and service area

Current status: Done

Delivered in repository:

- Full role-based authentication flow
- Protected routes for customer, provider, and admin
- Role-specific dashboards and navigation
- Provider onboarding and profile fields
- Location-aware support integrated in customer/provider workflows

### Milestone 2 (Weeks 3-4) - Service Listings and Search

Planned tasks from reference document:

- Category/subcategory service structure
- Provider service listing with pricing and availability
- Customer service browsing by category and location
- Map-based provider search using Google Maps
- Service detail page with booking form
- Provider ratings and reviews display

Current status: Done

Delivered in repository:

- Service catalog and listing flows
- Provider-side service CRUD management
- Customer-side service filtering and discovery
- Map/location selection and location-based service experience
- Service detail page with booking entry points
- Review visibility and service context presentation

### Milestone 3 (Weeks 5-6) - Booking and Interaction

Planned tasks from reference document:

- Booking request system with time slots
- Provider accept/reject actions
- Booking status lifecycle (Pending, Confirmed, Completed, Cancelled)
- Real-time customer-provider chat
- Review and rating after completion

Current status: Done

Delivered in repository:

- End-to-end booking lifecycle
- Provider booking queue management with action controls
- Status transitions across booking states
- Chat and support messaging flows
- Post-completion rating and review workflow
- Customer payment step after completion

### Milestone 4 (Weeks 7-8) - Admin Panel and Final Enhancements

Planned tasks from reference document:

- Provider verification with document approval
- Dispute resolution workflow
- Analytics dashboard for platform performance
- Deployment and final QA

Current status: Partial

Delivered in repository:

- Pending provider approvals and rejection flow
- Admin user management (search/filter/suspend/activate)
- Admin provider management and moderation controls
- Service moderation (suspend/restore)
- Detailed dispute management with resolve and dismiss actions
- Escalation actions from disputes: suspend provider and suspend service
- Admin analytics dashboards with operational metrics

Pending or not formally completed:

- Deployment and release pipeline hardening as a finalized milestone deliverable
- Formal final QA sign-off checklist documented in repository
- Refund handling as an explicit dispute sub-flow is not fully specified in current UI/API documentation

## Implemented Features by Role

### Customer

- Dashboard with booking/activity insights
- Service browse, search, and filtering
- Service detail pages and booking initiation
- Booking tracking and status updates
- Payment flow for completed jobs
- Reviews and ratings submission
- Chat with providers and admin support
- Profile/settings management

### Provider

- Dashboard with earnings and activity indicators
- Service CRUD management
- Booking queue with action controls
- Completion flow triggering customer payment
- Route/map support for job visits
- Chat with customers and admin
- Profile/settings management

### Admin

- Analytics dashboard with platform KPIs
- User management with lifecycle controls
- Provider review and approval workflows
- Service moderation and status controls
- Dispute management with enriched detail view
- Dispute action set: resolve, dismiss, suspend provider, suspend service
- Messaging with customers and providers

### AI Assistant

- Gemini-based in-app assistant
- Role-aware guidance for customer, provider, and admin tasks
- Context constrained to implemented project functionality

## Expected Project Outcome Alignment

The reference outcome targets are largely achieved:

- Secure authentication and role-based dashboards: Achieved
- Location-based service search and booking: Achieved
- Provider-customer communication: Achieved
- Review and rating system: Achieved
- Admin verification, moderation, analytics: Achieved (deployment/final QA formalization remains)

## Database Schema Reference (From Project Plan)

Primary entities defined in the project document:

- Users
- Services
- Bookings
- Reviews
- Messages
- Reports
- AdminLogs

The current implementation aligns with this model direction and includes operational entities for provider profiles and moderation workflows.

## Repository Structure

- backend/: Spring Boot API, security, business services, repositories, domain entities
- frontend/: React application, role-based pages, shared components, chatbot integration

## Local Setup

### Prerequisites

- Java 17+
- Maven
- Node.js 18+
- npm
- MySQL 8+

### 1. Configure Database

1. Create a MySQL schema named fixitnow.
2. Update backend/src/main/resources/application.properties with database credentials.

### 2. Run Backend

1. Open terminal in backend/.
2. Run:

```bash
mvn clean install
mvn spring-boot:run
```

Backend URL: http://localhost:8080

### 3. Run Frontend

1. Open terminal in frontend/.
2. Run:

```bash
npm install
npm start
```

Frontend URL: http://localhost:3000

### 4. Environment Variables

Create frontend/.env:

```env
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_key
REACT_APP_GEMINI_API_KEY=your_gemini_api_key
```

## Route Areas

- Customer: /customer/*
- Provider: /provider/*
- Admin: /admin/*

## Documentation Policy

This README is the single source of project documentation in the repository and should be updated whenever features, milestone status, architecture, or setup changes.
