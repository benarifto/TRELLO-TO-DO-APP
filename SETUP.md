# Trello TODO Application Setup Guide

## Prerequisites
- Node.js (v16 or higher)
- MySQL database
- npm or yarn package manager

## Quick Start

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Database Setup
1. Create a MySQL database named `trello_todo_db`
2. Copy `server/env.example` to `server/.env`
3. Update the database credentials in `server/.env`:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=trello_todo_db
   ```

### 3. Run Database Migrations
```bash
npm run migrate
```

### 4. Seed Initial Data
```bash
npm run seed
```

### 5. Start the Application
```bash
npm run dev
```

This will start both the backend server (port 3000) and frontend (port 5173).

## Environment Variables

### Required for Basic Functionality
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`

### Optional (Trello Integration)
- `TRELLO_KEY`, `TRELLO_TOKEN`, `TRELLO_BOARD_ID`, `TRELLO_LIST_ID`

### File Upload
- `MAX_FILE_SIZE` (default: 2MB)
- `UPLOAD_PATH` (default: ./uploads)

## Features

✅ **Complete TODO Management**: Create, read, update, delete todos
✅ **Image Upload**: Support for PNG/JPEG images with automatic resizing
✅ **Categories**: Organize todos by categories
✅ **Importance Levels**: High, Medium, Low priority
✅ **Status Management**: Active/Completed status
✅ **Multi-language**: Turkish and English support
✅ **Responsive Design**: Mobile-friendly interface
✅ **Trello Integration**: Sync todos with Trello boards
✅ **Database**: MySQL with Knex.js migrations
✅ **Modern Stack**: Vue 3 + Fastify + SCSS

## API Endpoints

- `GET /api/todos` - List todos with filters
- `POST /api/todos` - Create new todo
- `GET /api/todos/:id` - Get single todo
- `PUT /api/todos/:id` - Update todo
- `DELETE /api/todos/:id` - Delete todo
- `PATCH /api/todos/:id/status` - Update status
- `PATCH /api/todos/:id/importance` - Update importance
- `GET /api/categories` - List categories

## Troubleshooting

### Database Connection Issues
- Ensure MySQL is running
- Check database credentials in `.env`
- Verify database exists

### Image Upload Issues
- Ensure `uploads` directory exists
- Check file size limits
- Verify image format (PNG/JPEG only)

### Trello Integration Issues
- Set up Trello API credentials
- Create Trello board and list
- Update environment variables
