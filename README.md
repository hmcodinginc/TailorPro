# Tailor Management System 
A site  with FastAPI backend and React frontend for managing tailor shop: customers, orders, measurements.

## Features
- CRUD for Customers, Orders, Measurements
- Order status updates
- React Query for data fetching/caching
- shadcn/ui components

## Setup & Run

### Backend
```bash
cd backend
pip install -r requirements.txt
# Set DATABASE_URL in .env (SQLAlchemy)
uvicorn app.main:app --reload --port 8000
```
API ready at http://localhost:8000

### Frontend
```bash
cd frontend
npm install
npm run dev
```
App at c (proxies /api to backend)

## Next
- Add auth (JWT)
- Migrate Supabase data if needed
- Detail pages, delete funcs
- Backend populate customer name in orders
