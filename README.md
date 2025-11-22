#  SyncUp — A Social Platform for Campus Clubs

## Overview
**SyncUp** is a full-stack web platform connecting students with campus clubs.  
It allows users to:
- View clubs and public posts without logging in
- Join clubs and access exclusive content
- Create posts (for club members)
- Like and comment on posts
- Register for events hosted by clubs  

Built with **React**, **Express**, **Node.js**, **Prisma**, and **MySQL/Supabase**, SyncUp makes campus engagement fun, structured, and collaborative.

---

## Getting Started

### Prerequisites
* Node.js (v18 or higher recommended)
* npm
* A MySQL database (e.g., from Supabase)

### Backend Setup

1.  Navigate to the backend directory:
    ```sh
    cd backend
    ```
2.  Install dependencies:
    ```sh
    npm install
    ```
3.  Create a `.env` file in the `backend` directory with the following variables:
    ```
    # Get this from your MySQL database provider
    DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE"

    # Create a strong secret for signing JWTs
    JWT_SECRET="YOUR_SUPER_SECRET_KEY_HERE"
    ```
4.  Run the database migrations to create the tables:
    ```sh
    npx prisma migrate dev --name init
    ```
5.  Start the backend server:
    ```sh
    npm run start 
    ```
    The server will be running on `http://localhost:5000`.

### Frontend Setup

1.  Open a new terminal and navigate to the frontend directory:
    ```sh
    cd frontend
    ```
2.  Install dependencies:
    ```sh
    npm install
    ```
3.  Start the frontend development server:
    ```sh
    npm start
    ```
4.  Open [http://localhost:3000](http://localhost:3000) (or the port specified in your terminal) in your browser.

---

## Database ER Diagram

This diagram shows the structure of our database, as defined in `prisma/schema.prisma`.

```mermaid
erDiagram
    users {
        Int user_id PK
        String name
        String email UK
        String password_hash
        String profile_pic_url
        String bio
        DateTime created_at
        DateTime updated_at
    }

    posts {
        Int post_id PK
        Int user_id FK
        Int club_id FK
        String content
        String image_url
        String visibility
        DateTime created_at
        DateTime updated_at
    }

    likes {
        Int like_id PK
        Int user_id FK
        Int post_id FK
        DateTime created_at
    }

    comments {
        Int comment_id PK
        Int user_id FK
        Int post_id FK
        String content
        DateTime created_at
        DateTime updated_at
    }

    clubs {
        Int club_id PK
        String name
        String description
        Int created_by FK
        DateTime created_at
        DateTime updated_at
    }

    memberships {
        Int membership_id PK
        Int user_id FK
        Int club_id FK
        String role
        DateTime joined_at
    }

    image_storage {
        Int image_id PK
        Int post_id FK
        String image_url
        DateTime uploaded_at
    }

    notifications {
        Int notification_id PK
        Int user_id FK
        String type
        Int reference_id
        String message
        DateTime created_at
        Boolean read_status
    }

    events {
        Int event_id PK
        Int club_id FK
        String title
        String description
        DateTime event_date
        DateTime created_at
    }

    users ||--o{ posts : "creates"
    users ||--o{ likes : "gives"
    users ||--o{ comments : "writes"
    users ||--o{ clubs : "created by"
    users ||--o{ memberships : "has"
    users ||--o{ notifications : "receives"
    
    clubs ||--o{ posts : "has"
    clubs ||--o{ memberships : "has"
    clubs ||--o{ events : "hosts"
    
    posts ||--o{ likes : "receives"
    posts ||--o{ comments : "has"
    posts ||--o{ image_storage : "has images"
    
    events ||--o{ clubs : "belongs to"
