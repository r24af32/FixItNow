## 📅 Milestone 3 – Week 5: Core Booking Engine

### 🎯 Overview

Week 5 focused on implementing the **core transaction engine** of the FixItNow platform.
The system transitioned from static UI mockups to a **fully functional full-stack booking workflow**.

Customers can request services for specific **dates and time slots**, while providers can **view, accept, or reject booking requests** through a dedicated dashboard.

---

## ✨ Features Implemented

### 1️⃣ Customer Booking Flow

* **Time Slot Selection**
  Customers can choose a valid **date and available time slot** from the `ServiceDetailPage`.

* **Instant Booking**
  Clicking **“Pay & Confirm”** sends the booking payload (including dynamically fetched `providerId`) to the backend API.

* **Customer Dashboard**
  The **My Bookings** page dynamically loads booking history from the backend and displays:

  * Service icon
  * Price
  * Provider details
  * Booking status

---

### 2️⃣ Provider Request Management

* **Provider Dashboard**
  Providers can log in and view all **PENDING booking requests** assigned to them.

* **Accept / Decline Workflow**
  Providers can:

  * Accept a booking
  * Reject a booking

  The UI updates instantly without requiring a page refresh.

---

### 3️⃣ Booking Status Lifecycle

Implemented the complete booking lifecycle:

| Status        | Description                          |
| ------------- | ------------------------------------ |
| **PENDING**   | Booking request created by customer  |
| **CONFIRMED** | Provider accepts the booking         |
| **COMPLETED** | Provider marks job as finished       |
| **CANCELLED** | Provider rejects or customer cancels |

---

## 🛠️ Technical Implementation

### Backend (Spring Boot)

**Entities & Repositories**

* Created `Booking.java` entity
* Added explicit `@Column` mappings for database consistency
* Implemented repository methods:

  * `findByCustomerId()`
  * `findByProviderId()`

**Controllers & Services**
Implemented REST endpoints in `BookingController.java`:

```
POST   /api/bookings/create
GET    /api/bookings/customer/{id}
GET    /api/bookings/provider/{id}
PUT    /api/bookings/accept/{id}
PUT    /api/bookings/reject/{id}
```

**DTO Enhancements**
Updated `ServiceResponse.java` to expose `providerId` for frontend booking requests.

**Security**
All booking endpoints are protected using **JWT authentication**.

---

### Frontend (React + Tailwind)

**State Management**
Replaced static mock data with API calls using `useEffect` and Axios.

**Payload Construction**
`ServiceDetailPage.js` constructs booking payload:

```json
{
  "serviceId": 1,
  "customerId": 5,
  "providerId": 3,
  "bookingDate": "2026-03-15",
  "timeSlot": "10:00 AM - 12:00 PM"
}
```

**UI Improvements**

* Loading spinners (`Loader2`)
* Error alerts
* Dynamic booking status updates

---

## 🐛 Key Bug Fixes

### Provider ID Null Issue

Bookings were saved with `provider_id = NULL`.

**Fix:**
Updated `ServiceResponse` DTO to include `providerId`, allowing React to correctly send it in the booking request.

---

### Hibernate Mapping Issue

Provider queries returned empty results.

**Fix:**
Added explicit mapping:

```java
@Column(name = "provider_id")
```

in the `Booking` entity.

---

## 🚀 Next Steps – Week 6

Upcoming features:

* ⭐ Review & Rating System
  Customers can rate providers after a booking is **COMPLETED**

* 💬 Real-time Chat
  Implement **WebSocket-based chat** between customers and providers.
