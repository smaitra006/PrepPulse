# PrepPulse Architecture

## Core Stack
- **Runtime:** Node.js (v22 LTS)
- **Backend Framework:** Express.js (v5.x)
- **Database:** PostgreSQL (v16) with `pg` driver (No ORM)
- **Frontend:** Plain HTML, Vanilla JS (Fetch API), Tailwind CSS (v4.x)

## Authentication Strategy
- **Mechanism:** JSON Web Tokens (JWT) stored in `HttpOnly` cookies.
- **Why:** Keeps the Express backend stateless while protecting against Cross-Site Scripting (XSS) attacks.

## Data Isolation
- Global data (problems, companies, topics) is strictly separated from user data (status, notes, applications).
- Every protected route will extract `user_id` from the JWT, and all DB queries modifying or fetching user data will include `WHERE user_id = $1`.
