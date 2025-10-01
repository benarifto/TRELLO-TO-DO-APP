require('dotenv').config();
const fastify = require('fastify')({ logger: true });
const path = require('path');
const fs = require('fs');

// Import services and routes
const todoRoutes = require('./routes/todos');
const categoryRoutes = require('./routes/categories');
const trelloService = require('./services/trelloService');

// Register plugins
fastify.register(require('@fastify/cors'), {
  origin: true,
  credentials: true
});

 fastify.register(require('@fastify/multipart'), {
   limits: {
     fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880, // 5MB
     files: 1,
     fieldSize: 1024 * 1024, // 1MB for text fields
     fieldNameSize: 100,
     fields: 10
   },
   attachFieldsToBody: true,
   addToBody: false,
   sharedSchemaId: false
 });

// Serve static files (uploads)
fastify.register(require('@fastify/static'), {
  root: path.join(__dirname, process.env.UPLOAD_PATH || 'uploads'),
  prefix: '/uploads/'
});

// Health check endpoint
fastify.get('/health', async (request, reply) => {
  return { status: 'OK', timestamp: new Date().toISOString() };
});

// Root endpoint
fastify.get('/', async (request, reply) => {
  return {
    message: 'Welcome to Trello TODO API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      todos: '/api/todos',
      categories: '/api/categories',
      uploads: '/uploads/'
    },
    documentation: 'API endpoints are prefixed with /api'
  };
});

// Test endpoint for creating todo (for debugging)
fastify.post('/test-todo', async (request, reply) => {
  try {
    const todoData = {
      title: 'Test Todo',
      description: 'Test Description',
      category_id: 11, // Use first category ID
      importance: 'Orta'
    };
    
    console.log('🧪 Test todo creation:', todoData);
    
    const todoService = require('./services/todoService');
    const todo = await todoService.createTodo(todoData, null);
    
    console.log('🧪 Test todo created:', todo);
    reply.code(201).send(todo);
  } catch (error) {
    console.error('🧪 Test todo error:', error);
    reply.code(500).send({ error: error.message });
  }
});

// Register routes
fastify.register(todoRoutes, { prefix: '/api' });
fastify.register(categoryRoutes, { prefix: '/api' });

// Error handler
fastify.setErrorHandler(function (error, request, reply) {
  fastify.log.error(error);
  
  if (error.validation) {
    reply.code(400).send({ error: 'Validation error', details: error.validation });
  } else {
    reply.code(500).send({ error: 'Internal server error' });
  }
});

// Start server
const start = async () => {
  try {
    // Validate Trello configuration (optional)
    const trelloConfigured = trelloService.validateConfig();
    if (trelloConfigured) {
      console.log('✅ Trello integration is configured and enabled');
    } else {
      console.log('⚠️  Trello integration is disabled - todos will work without Trello cards');
    }
    
    // Ensure uploads directory exists
    const uploadsDir = path.join(__dirname, process.env.UPLOAD_PATH || 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('📁 Created uploads directory:', uploadsDir);
    }
    const uploadDir = path.join(__dirname, process.env.UPLOAD_PATH || 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const port = process.env.PORT || 3000;
    await fastify.listen({ port, host: '0.0.0.0' });
    
    console.log(`🚀 Server is running on port ${port}`);
    console.log(`📁 Uploads directory: ${uploadDir}`);
    console.log(`🔗 Health check: http://localhost:${port}/health`);
    console.log(`📋 API endpoints: http://localhost:${port}/api`);
    console.log(`📝 TODO endpoints: http://localhost:${port}/api/todos`);
    console.log(`🏷️  Category endpoints: http://localhost:${port}/api/categories`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
