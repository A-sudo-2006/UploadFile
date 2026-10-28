# Akatsuki's Draft - Backend (Nodevember 4.0)

## Setup
1. `npm install`
2. Edit `.env`: set `MONGO_URI` (Atlas connection string), `JWT_SECRET`, `GEMINI_API_KEY`, `ADMIN_SECRET_KEY`
3. `npm run dev` (or `npm start`) -> http://localhost:5000
4. Import `Akatsuki-Draft.postman_collection.json` into Postman

## Admin user
Register with an extra field `"adminKey": "<ADMIN_SECRET_KEY from .env>"` to get role `admin`.

## Endpoints
| Method | Route | Access |
|---|---|---|
| POST | /auth/register | public |
| POST | /auth/login | public |
| GET | /auth/me | user |
| POST | /posts | user (status: draft or pending) |
| GET | /posts | public (approved only) |
| GET | /posts/my-posts | user |
| GET | /posts/:id | public (approved only) |
| PATCH | /posts/:id | owner |
| DELETE | /posts/:id | owner |
| GET | /admin/posts/pending | admin |
| PATCH | /admin/posts/approve/:id | admin |
| PATCH | /admin/posts/reject/:id | admin |
| POST | /ai/improve/:postId | owner (creates new draft) |

Send the token as `Authorization: Bearer <token>`.

## Deploy to Vercel
Add the same env variables in the Vercel dashboard and run `vercel`.
