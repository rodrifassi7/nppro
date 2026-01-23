  # NP PRO Admin Lite

A production-ready web application for tracking meal-prep orders and revenue.

## Tech Stack
- **Framework**: React + Vite + TypeScript
- **Styling**: Tailwind CSS
- **Backend & Auth**: Supabase (Postgres)
- **Icons**: Lucide React

## Setup Instructions

### 1. Environment Variables
Create a file named `.env` in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Database Setup
1.  Run the contents of `supabase_schema.sql` in your Supabase SQL Editor.
2.  This will create the necessary tables, triggers, policies, and seed data.

### 3. Installation & Run
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

## Features
- **Dashboard**: Revenue tracking, order volume, and top meals (Today/Week/Month).
- **New Order**: Fast entry form with auto-calculated pricing for Packs.
- **Orders List**: Filterable status, search, and quick paid/delivered actions.
- **Meals Catalog**: Manage available meals for tracking.
- **Roles & Security**:
  - **Staff**: Can create/view/update orders.
  - **Admin**: Can also delete orders and manage meals/profiles.
  - **RLS**: Policies enforce data security at the database level.
