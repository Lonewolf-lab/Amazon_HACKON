# ReLoop — AI-Powered Returns & Sustainable Resale

ReLoop turns the returns black hole into a circular loop: it stops bad purchases before they happen with **predictive return prevention**, runs **smart quality grading** on every returned item, and routes each one to its highest-value second life — **peer-to-peer resale**, **certified refurbished recommendations**, donation, or recycling — while rewarding shoppers with **green credits** for every sustainable choice.

## Tech Stack

| Layer     | Stack                                                              |
| --------- | ----------------------------------------------------------------- |
| Frontend  | Next.js 14 (App Router) · TypeScript · Tailwind CSS · shadcn/ui · axios · Chart.js / react-chartjs-2 |
| Backend   | FastAPI · Uvicorn · Pydantic · httpx                              |
| Cloud/AI  | AWS (boto3) · DynamoDB · S3                                       |

The app has four screens:

1. **Product** — shopper-facing keep-rate badge (predictive return prevention).
2. **Seller Return Portal** — image upload → smart quality grading → recommended routing.
3. **Green Credits** — sustainability rewards wallet.
4. **Admin Dashboard** — recovery value, disposition mix, and credits analytics.

## Local Setup

### Backend (FastAPI)

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload
```

- API: http://localhost:8000
- Health check: http://localhost:8000/
- Swagger UI: http://localhost:8000/docs

### Frontend (Next.js 14)

```bash
cd frontend
npm install
npm run dev
```

- App: http://localhost:3000 (redirects to `/product`)

> Start the backend first so the frontend's API calls resolve.

## Environment Variables

### `frontend/.env.local`

| Variable              | Description              | Example                 |
| --------------------- | ------------------------ | ----------------------- |
| `NEXT_PUBLIC_API_URL` | Base URL of the backend  | `http://localhost:8000` |

### `backend/.env`

| Variable                  | Description                  |
| ------------------------- | ---------------------------- |
| `AWS_ACCESS_KEY_ID`       | AWS access key               |
| `AWS_SECRET_ACCESS_KEY`   | AWS secret key               |
| `AWS_REGION`              | AWS region (e.g. `us-east-1`)|
| `DYNAMODB_TABLE_PRODUCTS` | Products table name          |
| `DYNAMODB_TABLE_RETURNS`  | Returns table name           |
| `DYNAMODB_TABLE_USERS`    | Users table name             |
| `S3_BUCKET_NAME`          | S3 bucket for item images    |

> `.env` and `.env.local` are git-ignored. The committed values are placeholders — replace them with real credentials locally.

## API Endpoints

All routes are mounted under `/api`:

| Method | Endpoint              | Purpose                                  |
| ------ | --------------------- | ---------------------------------------- |
| GET    | `/`                   | Health check                             |
| POST   | `/api/prevent/score`  | Predictive return prevention (keep rate) |
| POST   | `/api/grade`          | Smart quality grading                    |
| POST   | `/api/redirect`       | Disposition routing recommendations      |
| POST   | `/api/credits/issue`  | Issue green credits                      |

## Live Links

| Environment | URL                                      |
| ----------- | ---------------------------------------- |
| Frontend    | https://reloop.example.com _(placeholder)_ |
| Backend API | https://api.reloop.example.com _(placeholder)_ |
| Swagger UI  | https://api.reloop.example.com/docs _(placeholder)_ |
