const knex = require('../config/database');
const trelloService = require('./trelloService');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

class TodoService {
  // Create a new todo
  async createTodo(todoData, imageFile) {
    const trx = await knex.transaction();
    
    try {
      let imagePath = null;
      
      // Handle image upload if provided
      if (imageFile) {
        imagePath = await this._processImage(imageFile);
      }

      // Create todo in database
      const [todoId] = await trx('todos').insert({
        title: todoData.title,
        description: todoData.description,
        category_id: todoData.category_id,
        importance: todoData.importance,
        status: 'Aktif',
        image_path: imagePath
      });

      // Get the created todo
      const todo = await trx('todos')
        .select('todos.*', 'categories.name_tr as category_name_tr', 'categories.name_en as category_name_en')
        .join('categories', 'todos.category_id', 'categories.id')
        .where('todos.id', todoId)
        .first();

      // Create Trello card (disabled for now)
      let trelloCardId = null;
      try {
        trelloCardId = await trelloService.createCard(todo);
        
        // Update todo with Trello card ID
        if (trelloCardId) {
          await trx('todos')
            .where('id', todoId)
            .update({ trello_card_id: trelloCardId });
        }
      } catch (error) {
        console.log('Trello card creation failed, continuing without it:', error.message);
        // Continue without Trello integration
      }

      await trx.commit();
      
      // Return updated todo
      return {
        ...todo,
        trello_card_id: trelloCardId
      };
    } catch (error) {
      await trx.rollback();
      
      // Clean up uploaded image if todo creation failed
      if (imagePath) {
        await this._deleteImage(imagePath);
      }
      
      throw error;
    }
  }

  // Get todos with pagination and filters
  async getTodos(filters = {}, page = 1, limit = 5) {
    const offset = (page - 1) * limit;
    
    let query = knex('todos')
      .select('todos.*', 'categories.name_tr as category_name_tr', 'categories.name_en as category_name_en')
      .join('categories', 'todos.category_id', 'categories.id');

    // Apply filters
    if (filters.startDate) {
      query = query.where('todos.created_at', '>=', filters.startDate);
    }
    
    if (filters.endDate) {
      query = query.where('todos.created_at', '<=', filters.endDate);
    }
    
    if (filters.status) {
      query = query.where('todos.status', filters.status);
    }
    
    if (filters.category_id) {
      query = query.where('todos.category_id', filters.category_id);
    }
    
    if (filters.importance) {
      query = query.where('todos.importance', filters.importance);
    }

    // Get total count for pagination
    const countQuery = query.clone();
    const [{ count }] = await countQuery.count('* as count');
    
    // Get paginated results
    const todos = await query
      .orderBy('todos.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return {
      todos,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: limit
      }
    };
  }

  // Get single todo by ID
  async getTodoById(id) {
    const todo = await knex('todos')
      .select('todos.*', 'categories.name_tr as category_name_tr', 'categories.name_en as category_name_en')
      .join('categories', 'todos.category_id', 'categories.id')
      .where('todos.id', id)
      .first();

    if (!todo) {
      throw new Error('Todo not found');
    }

    return todo;
  }

  // Update todo
  async updateTodo(id, todoData, imageFile, shouldRemoveImage = false) {
    const trx = await knex.transaction();
    
    try {
      const existingTodo = await trx('todos').where('id', id).first();
      if (!existingTodo) {
        throw new Error('Todo not found');
      }

      if (existingTodo.status === 'Tamamlandı' && todoData.status === 'Aktif') {
        throw new Error('Completed todos cannot be reactivated');
      }

      let imagePath = existingTodo.image_path;
      
      // Handle new image upload if provided
      if (imageFile) {
        // Delete old image if exists
        if (existingTodo.image_path) {
          await this._deleteImage(existingTodo.image_path);
        }
        
        imagePath = await this._processImage(imageFile);
      } else if (shouldRemoveImage) {
        // User explicitly wants to remove the existing image
        if (existingTodo.image_path) {
          console.log('🗑️ Removing existing image:', existingTodo.image_path);
          await this._deleteImage(existingTodo.image_path);
          imagePath = null; // Set to null to remove from database
        }
      } else {
        // Keep existing image
        imagePath = existingTodo.image_path;
      }

      // Update todo in database
      await trx('todos')
        .where('id', id)
        .update({
          title: todoData.title,
          description: todoData.description,
          category_id: todoData.category_id,
          importance: todoData.importance,
          status: todoData.status,
          image_path: imagePath,
          updated_at: knex.fn.now()
        });

      // Get updated todo
      const updatedTodo = await trx('todos')
        .select('todos.*', 'categories.name_tr as category_name_tr', 'categories.name_en as category_name_en')
        .join('categories', 'todos.category_id', 'categories.id')
        .where('todos.id', id)
        .first();

      // Update Trello card (non-blocking)
      try {
        await trelloService.updateCard(updatedTodo);
        
        // Move to completed list if status changed to completed
        if (updatedTodo.status === 'Tamamlandı') {
          await trelloService.moveToCompletedList(updatedTodo);
        }
      } catch (error) {
        console.log('Trello integration failed, continuing with todo update:', error.message);
        // Continue without Trello integration
      }

      await trx.commit();
      return updatedTodo;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  // Delete todo
  async deleteTodo(id) {
    const trx = await knex.transaction();
    
    try {
      const todo = await trx('todos').where('id', id).first();
      if (!todo) {
        throw new Error('Todo not found');
      }

      // Delete Trello card
      if (todo.trello_card_id) {
        await trelloService.deleteCard(todo.trello_card_id);
      }

      // Delete image file if exists
      if (todo.image_path) {
        await this._deleteImage(todo.image_path);
      }

      // Delete todo from database
      await trx('todos').where('id', id).del();

      await trx.commit();
      return true;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  // Update todo status
  async updateStatus(id, status) {
    const trx = await knex.transaction();
    
    try {
      const todo = await trx('todos').where('id', id).first();
      if (!todo) {
        throw new Error('Todo not found');
      }

      if (todo.status === 'Tamamlandı' && status === 'Aktif') {
        throw new Error('Completed todos cannot be reactivated');
      }

      await trx('todos')
        .where('id', id)
        .update({ 
          status,
          updated_at: knex.fn.now()
        });

      const updatedTodo = await trx('todos')
        .select('todos.*', 'categories.name_tr as category_name_tr', 'categories.name_en as category_name_en')
        .join('categories', 'todos.category_id', 'categories.id')
        .where('todos.id', id)
        .first();

      // Update Trello card
      await trelloService.updateCard(updatedTodo);
      
      // Move to completed list if status is completed
      if (status === 'Tamamlandı') {
        await trelloService.moveToCompletedList(updatedTodo);
      }

      await trx.commit();
      return updatedTodo;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  // Update todo importance
  async updateImportance(id, importance) {
    const trx = await knex.transaction();
    
    try {
      const todo = await trx('todos').where('id', id).first();
      if (!todo) {
        throw new Error('Todo not found');
      }

      await trx('todos')
        .where('id', id)
        .update({ 
          importance,
          updated_at: knex.fn.now()
        });

      const updatedTodo = await trx('todos')
        .select('todos.*', 'categories.name_tr as category_name_tr', 'categories.name_en as category_name_en')
        .join('categories', 'todos.category_id', 'categories.id')
        .where('todos.id', id)
        .first();

      // Update Trello card
      await trelloService.updateCard(updatedTodo);

      await trx.commit();
      return updatedTodo;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  // Get all categories
  async getCategories() {
    return await knex('categories').select('*').orderBy('id');
  }

  // Get category by ID
  async getCategoryById(id) {
    const category = await knex('categories').where('id', id).first();
    if (!category) {
      throw new Error('Category not found');
    }
    return category;
  }

  // Create new category
  async createCategory(categoryData) {
    const [categoryId] = await knex('categories').insert({
      name_tr: categoryData.name,
      name_en: categoryData.name,
      description_tr: categoryData.description,
      description_en: categoryData.description,
      color: categoryData.color,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    });

    return await this.getCategoryById(categoryId);
  }

  // Update category
  async updateCategory(id, categoryData) {
    const category = await knex('categories').where('id', id).first();
    if (!category) {
      throw new Error('Category not found');
    }

    await knex('categories')
      .where('id', id)
      .update({
        name_tr: categoryData.name,
        name_en: categoryData.name,
        description_tr: categoryData.description,
        description_en: categoryData.description,
        color: categoryData.color,
        updated_at: knex.fn.now()
      });

    return await this.getCategoryById(id);
  }

  // Delete category
  async deleteCategory(id) {
    const category = await knex('categories').where('id', id).first();
    if (!category) {
      throw new Error('Category not found');
    }

    // Check if category is being used by any todos
    const todoCount = await knex('todos').where('category_id', id).count('* as count').first();
    if (parseInt(todoCount.count) > 0) {
      throw new Error('Category cannot be deleted because it is being used by existing todos');
    }

    await knex('categories').where('id', id).del();
    return { message: 'Category deleted successfully' };
  }

  // Process uploaded image
  async _processImage(imageFile) {
    try {
      const uploadDir = process.env.UPLOAD_PATH || './uploads';
      
      // Generate unique filename with original extension
      const originalExt = path.extname(imageFile.filename || 'image.jpg');
      const fileName = `${uuidv4()}${originalExt}`;
      const filePath = path.join(uploadDir, fileName);

      console.log('📸 Processing image:', {
        originalName: imageFile.filename,
        newName: fileName,
        mimetype: imageFile.mimetype,
        size: imageFile.size,
        uploadDir: uploadDir,
        hasBuffer: !!imageFile.buffer,
        hasData: !!imageFile.data,
        bufferType: imageFile.buffer ? typeof imageFile.buffer : 'undefined',
        dataType: imageFile.data ? typeof imageFile.data : 'undefined'
      });

      // Ensure upload directory exists
      await fs.mkdir(uploadDir, { recursive: true });

      // Process image with sharp - try different data sources
      let imageBuffer = null;
      
      if (imageFile._buf) {
        // Fastify multipart stores data in _buf property
        imageBuffer = imageFile._buf;
        console.log('✅ Using imageFile._buf');
      } else if (imageFile.buffer) {
        imageBuffer = imageFile.buffer;
        console.log('✅ Using imageFile.buffer');
      } else if (imageFile.data) {
        imageBuffer = imageFile.data;
        console.log('✅ Using imageFile.data');
      } else if (imageFile.toBuffer) {
        // If it's a stream, convert to buffer
        imageBuffer = await imageFile.toBuffer();
        console.log('✅ Converted stream to buffer');
      } else {
        console.error('❌ No valid image data found:', {
          keys: Object.keys(imageFile),
          types: Object.fromEntries(
            Object.entries(imageFile).map(([k, v]) => [k, typeof v])
          )
        });
        throw new Error('No image data received - missing _buf, buffer, data, or toBuffer method');
      }
      
      if (!imageBuffer) {
        throw new Error('Image buffer is null or undefined');
      }

      console.log('📸 Image buffer details:', {
        length: imageBuffer.length,
        type: typeof imageBuffer,
        isBuffer: Buffer.isBuffer(imageBuffer)
      });

      await sharp(imageBuffer)
        .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toFile(filePath);

      console.log('✅ Image processed successfully:', filePath);
      return fileName;
    } catch (error) {
      console.error('❌ Error processing image:', error);
      throw new Error(`Image processing failed: ${error.message}`);
    }
  }

  // Delete image file
  async _deleteImage(imagePath) {
    try {
      const uploadDir = process.env.UPLOAD_PATH || './uploads';
      const fullPath = path.join(uploadDir, imagePath);
      await fs.unlink(fullPath);
    } catch (error) {
      console.error('Error deleting image:', error.message);
    }
  }
}

module.exports = new TodoService();
