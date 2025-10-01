const todoService = require('../services/todoService');

async function categoryRoutes(fastify, options) {
  // Get all categories
  fastify.get('/categories', async (request, reply) => {
    try {
      const categories = await todoService.getCategories();
      reply.send(categories);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Get single category
  fastify.get('/categories/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const category = await todoService.getCategoryById(parseInt(id));
      reply.send(category);
    } catch (error) {
      if (error.message === 'Category not found') {
        reply.code(404).send({ error: error.message });
      } else {
        reply.code(500).send({ error: error.message });
      }
    }
  });

  // Create new category
  fastify.post('/categories', {
    schema: {
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', maxLength: 50 },
          description: { type: 'string', maxLength: 200 },
          color: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' }
        },
        required: ['name']
      }
    }
  }, async (request, reply) => {
    try {
      const { name, description, color } = request.body;
      
      const categoryData = {
        name: name.trim(),
        description: description?.trim() || '',
        color: color || '#667eea'
      };

      // Validate name length
      if (categoryData.name.length > 50) {
        return reply.code(400).send({ error: 'Category name must be 50 characters or less' });
      }

      const category = await todoService.createCategory(categoryData);
      reply.code(201).send(category);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
  });

  // Update category
  fastify.put('/categories/:id', {
    schema: {
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', maxLength: 50 },
          description: { type: 'string', maxLength: 200 },
          color: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' }
        },
        required: ['name']
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const { name, description, color } = request.body;
      
      const categoryData = {
        name: name.trim(),
        description: description?.trim() || '',
        color: color || '#667eea'
      };

      // Validate name length
      if (categoryData.name.length > 50) {
        return reply.code(400).send({ error: 'Category name must be 50 characters or less' });
      }

      const category = await todoService.updateCategory(parseInt(id), categoryData);
      reply.send(category);
    } catch (error) {
      if (error.message === 'Category not found') {
        reply.code(404).send({ error: error.message });
      } else {
        reply.code(500).send({ error: error.message });
      }
    }
  });

  // Delete category
  fastify.delete('/categories/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      await todoService.deleteCategory(parseInt(id));
      reply.code(204).send();
    } catch (error) {
      if (error.message === 'Category not found') {
        reply.code(404).send({ error: error.message });
      } else if (error.message.includes('cannot be deleted')) {
        reply.code(400).send({ error: error.message });
      } else {
        reply.code(500).send({ error: error.message });
      }
    }
  });
}

module.exports = categoryRoutes;
