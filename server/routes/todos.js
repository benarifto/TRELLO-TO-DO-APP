const todoService = require('../services/todoService');

async function todoRoutes(fastify, options) {
  // Create todo
  fastify.post('/todos', async (request, reply) => {
    try {
      console.log('📝 Creating todo - Request received');
      
      // Parse request body (FormData will be parsed by multipart plugin)
      console.log('📝 Request body:', request.body);
      console.log('📝 Request headers:', request.headers);
      
      // Check if we have form data
      if (!request.body || typeof request.body !== 'object') {
        console.error('❌ No form data received');
        return reply.code(400).send({ error: 'No form data received' });
      }
      
      const todoData = {
        title: request.body.title?.value || '',
        description: request.body.description?.value || '',
        category_id: parseInt(request.body.category_id?.value) || 0,
        importance: request.body.importance?.value || 'Orta'
      };
      
      console.log('📝 Todo data prepared:', todoData);

      // Validate required fields
      if (!todoData.title || todoData.title.trim() === '') {
        return reply.code(400).send({ error: 'Title is required' });
      }
      
      if (todoData.title.length > 100) {
        return reply.code(400).send({ error: 'Title must be 100 characters or less' });
      }
      
      if (!todoData.category_id || todoData.category_id <= 0) {
        return reply.code(400).send({ error: 'Valid category is required' });
      }

      // Handle image if provided
      let imageFile = null;
      if (request.body.image) {
        console.log('📝 Image received:', {
          filename: request.body.image.filename,
          mimetype: request.body.image.mimetype,
          size: request.body.image.size,
          hasBuffer: !!request.body.image.buffer,
          hasData: !!request.body.image.data,
          keys: Object.keys(request.body.image)
        });
        
        // Validate image
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 5242880; // 5MB
        
        if (!allowedTypes.includes(request.body.image.mimetype)) {
          return reply.code(400).send({ 
            error: 'Only PNG, JPG, and JPEG images are allowed' 
          });
        }
        
        if (request.body.image.size > maxSize) {
          return reply.code(400).send({ 
            error: `Image size must be ${Math.round(maxSize / (1024 * 1024))}MB or less` 
          });
        }
        
        // Ensure image has data
        if (!request.body.image._buf && !request.body.image.buffer && !request.body.image.data) {
          console.error('❌ Image object missing _buf/buffer/data:', request.body.image);
          return reply.code(400).send({ 
            error: 'Invalid image data received' 
          });
        }
        
        imageFile = request.body.image;
      }

      console.log('📝 Calling todoService.createTodo...');
      const todo = await todoService.createTodo(todoData, imageFile);
      console.log('📝 Todo created successfully:', todo);
      
      reply.code(201).send(todo);
    } catch (error) {
      console.error('❌ Error in create todo endpoint:', error);
      reply.code(500).send({ error: error.message });
    }
  });

  // Get todos with pagination and filters
  fastify.get('/todos', async (request, reply) => {
    try {
      const { page = 1, limit = 5, startDate, endDate, status, category_id, importance } = request.query;
      
      const filters = {
        startDate,
        endDate,
        status,
        category_id: category_id ? parseInt(category_id) : undefined,
        importance
      };

      const result = await todoService.getTodos(filters, parseInt(page), parseInt(limit));
      reply.send(result);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Get single todo
  fastify.get('/todos/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const todo = await todoService.getTodoById(parseInt(id));
      reply.send(todo);
    } catch (error) {
      if (error.message === 'Todo not found') {
        reply.code(404).send({ error: error.message });
      } else {
        reply.code(500).send({ error: error.message });
      }
    }
  });

    // Update todo
  fastify.put('/todos/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      
      console.log('📝 Updating todo - Request received');
      console.log('📝 Request body:', request.body);
      
      // Check if we have form data
      if (!request.body || typeof request.body !== 'object') {
        console.error('❌ No form data received for update');
        return reply.code(400).send({ error: 'No form data received' });
      }
      
      const todoData = {
        title: request.body.title?.value || '',
        description: request.body.description?.value || '',
        category_id: parseInt(request.body.category_id?.value) || 0,
        importance: request.body.importance?.value || 'Orta',
        status: request.body.status?.value || 'Aktif'
      };

      console.log('📝 Todo data prepared for update:', todoData);

      // Validate required fields
      if (!todoData.title || todoData.title.trim() === '') {
        return reply.code(400).send({ error: 'Title is required' });
      }
      
      if (todoData.title.length > 100) {
        return reply.code(400).send({ error: 'Title must be 100 characters or less' });
      }
      
      if (!todoData.category_id || todoData.category_id <= 0) {
        return reply.code(400).send({ error: 'Valid category is required' });
      }

      // Handle image if provided
      let imageFile = null;
      let shouldRemoveImage = false;
      
      if (request.body.image) {
        console.log('📝 Image received for update:', {
          filename: request.body.image.filename,
          mimetype: request.body.image.mimetype,
          size: request.body.image.size,
          hasBuffer: !!request.body.image.buffer,
          hasData: !!request.body.image.data,
          hasBuf: !!request.body.image._buf,
          keys: Object.keys(request.body.image)
        });
        
        // Validate image
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 5242880; // 5MB
        
        if (!allowedTypes.includes(request.body.image.mimetype)) {
          return reply.code(400).send({ 
            error: 'Only PNG, JPG, and JPEG images are allowed' 
          });
        }
        
        if (request.body.image.size > maxSize) {
          return reply.code(400).send({ 
            error: `Image size must be ${Math.round(maxSize / (1024 * 1024))}MB or less` 
          });
        }
        
        // Ensure image has data
        if (!request.body.image._buf && !request.body.image.buffer && !request.body.image.data) {
          console.error('❌ Image object missing _buf/buffer/data for update:', request.body.image);
          return reply.code(400).send({ 
            error: 'Invalid image data received' 
          });
        }
        
        imageFile = request.body.image;
             } else {
         // Check if user wants to remove existing image
         // Check for explicit removeImage flag first
         if (request.body.removeImage === 'true') {
           console.log('🗑️ Explicit image removal flag detected');
           shouldRemoveImage = true;
         } else {
           // Check if image field was explicitly sent as empty
           console.log('📝 No new image provided, checking if user wants to remove existing image');
           console.log('📝 Request body keys:', Object.keys(request.body));
           
           // If image field exists but is empty/null, user wants to remove it
           if (request.body.image === null || request.body.image === undefined || 
               (typeof request.body.image === 'string' && request.body.image.trim() === '')) {
             console.log('🗑️ User wants to remove existing image');
             shouldRemoveImage = true;
           }
         }
       }

      console.log('📝 Calling todoService.updateTodo...');
      const todo = await todoService.updateTodo(parseInt(id), todoData, imageFile, shouldRemoveImage);
      console.log('📝 Todo updated successfully:', todo);
      
      reply.send(todo);
    } catch (error) {
      console.error('❌ Error in update todo endpoint:', error);
      if (error.message === 'Todo not found') {
        reply.code(404).send({ error: error.message });
      } else if (error.message.includes('cannot be reactivated')) {
        reply.code(400).send({ error: error.message });
      } else {
        reply.code(500).send({ error: error.message });
      }
    }
  });

  // Delete todo
  fastify.delete('/todos/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      await todoService.deleteTodo(parseInt(id));
      reply.code(204).send();
    } catch (error) {
      if (error.message === 'Todo not found') {
        reply.code(404).send({ error: error.message });
      } else {
        reply.code(500).send({ error: error.message });
      }
    }
  });

  // Update todo status
  fastify.patch('/todos/:id/status', {
    schema: {
      body: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['Aktif', 'Tamamlandı'] }
        },
        required: ['status']
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const { status } = request.body;
      
      const todo = await todoService.updateStatus(parseInt(id), status);
      reply.send(todo);
    } catch (error) {
      if (error.message === 'Todo not found') {
        reply.code(404).send({ error: error.message });
      } else if (error.message.includes('cannot be reactivated')) {
        reply.code(400).send({ error: error.message });
      } else {
        reply.code(500).send({ error: error.message });
      }
    }
  });

  // Update todo importance
  fastify.patch('/todos/:id/importance', {
    schema: {
      body: {
        type: 'object',
        properties: {
          importance: { type: 'string', enum: ['Yüksek', 'Orta', 'Düşük'] }
        },
        required: ['importance']
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const { importance } = request.body;
      
      const todo = await todoService.updateImportance(parseInt(id), importance);
      reply.send(todo);
    } catch (error) {
      if (error.message === 'Todo not found') {
        reply.code(404).send({ error: error.message });
      } else {
        reply.code(500).send({ error: error.message });
      }
    }
  });

}

module.exports = todoRoutes;
