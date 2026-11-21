# 🏛️ CampusCare AI

> **AI-Powered University Student Complaint & Grievance Management System**
> Mandatory Authentication Wall • Role-Based Portal Routing • Single Bootstrap Admin Account • Dynamic Sign-Up with OTP Verification & Admin Approvals

---

## 🔒 Mandatory Authentication & Access Control

When opening the web application, the **Login Page** is strictly presented. **No user can access the dashboard or portals without authenticating.**

### Role-Based Portal Redirection
Upon entering valid credentials, the system automatically redirects the user to their designated workspace based on their verified role:

| Authenticated Role | Landed Portal | Access Restrictions |
| :--- | :--- | :--- |
| 🎓 **Student** | **Student Portal** | Can file complaints in English, Hinglish, or Romanised Punjabi, use voice dictation, and track personal complaints. **Staff Dashboard & Admin Approvals are strictly hidden and inaccessible.** |
| 🛠️ **Management** | **Staff Dashboard** | Can view department statistics, ticket workloads, assign technicians, update statuses (In Progress, Resolved), and triage tickets in the Human Review Queue. **Admin Approvals Hub is hidden.** |
| 👑 **Administrator** | **Admin Portal** | Lands directly on the **User Access & Approvals Portal** to inspect sign-up requests, verify OTP status, and approve or reject accounts. Can also navigate to the Staff Dashboard and Student Section. |

---

## 🔑 Initial Administrator Account

All demo and dummy accounts have been purged. The system starts with **one single root Administrator account**:

- **Email**: `admin@campuscare.edu`
- **Password**: `admin123`
- **Name**: `System Administrator`
- **Role**: `Admin`

---

## 📝 How New Student & Management Accounts Are Created

1. From the Login Page, any student or staff member clicks **"Sign Up with OTP"**.
2. They fill in their details and select their desired role (**Student** or **Management**).
3. A 6-digit **OTP** is issued to verify identity.
4. Once verified, the account enters the **`PENDING_APPROVAL`** state.
5. The Administrator logs in using `admin@campuscare.edu` / `admin123`.
6. The Administrator navigates to the **User Approvals** portal and clicks **"Approve & Authorize as [Student/Management]"** (or rejects the request).
7. The user can then immediately sign in with their email and password, landing directly in their authorized portal.

---

## 🚀 How to Run the Project

```powershell
cd "C:\Users\subha\.gemini\antigravity\scratch\campuscare-ai"
npm run dev
```

Open `http://localhost:5173` in your browser. You will be greeted directly by the **Sign In** screen.
