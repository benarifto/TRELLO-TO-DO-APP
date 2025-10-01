const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

class TrelloService {
  constructor() {
    this.baseUrl = 'https://api.trello.com/1';
    this.key = process.env.TRELLO_KEY;
    this.token = process.env.TRELLO_TOKEN;
    this.boardId = process.env.TRELLO_BOARD_ID;
    this.listId = process.env.TRELLO_LIST_ID;
  }

  // Create a new Trello card
  async createCard(todo) {
    if (!this.isConfigured()) {
      console.log('Trello not configured, skipping card creation');
      return null;
    }

    try {
      const response = await axios.post(`${this.baseUrl}/cards`, {
        name: todo.title,
        desc: todo.description || '',
        idList: this.listId,
        pos: 'top',
        labels: this._getImportanceLabel(todo.importance)
      }, {
        params: {
          key: this.key,
          token: this.token
        }
      });

      const cardId = response.data.id;
      
      // Upload image if provided
      if (todo.image_path) {
        try {
          await this.uploadImageToCard(cardId, todo.image_path);
          console.log('✅ Image uploaded to Trello card successfully');
        } catch (imageError) {
          console.error('❌ Failed to upload image to Trello card:', imageError.message);
          // Continue without image - don't fail the whole card creation
        }
      }
      
      return cardId;
    } catch (error) {
      console.error('Error creating Trello card:', error.message);
      console.error('Trello API Error Response:', error.response?.data);
      console.error('Trello Config:', {
        key: this.key ? '✅ Set' : '❌ Missing',
        token: this.token ? '✅ Set' : '❌ Missing',
        boardId: this.boardId ? '✅ Set' : '❌ Missing',
        listId: this.listId ? '✅ Set' : '❌ Missing'
      });
      throw new Error('Failed to create Trello card');
    }
  }

  // Update an existing Trello card
  async updateCard(todo) {
    if (!this.isConfigured()) {
      console.log('Trello not configured, skipping card update');
      return true;
    }

    try {
      if (!todo.trello_card_id) {
        console.log('No Trello card ID found, skipping update');
        return true;
      }

      await axios.put(`${this.baseUrl}/cards/${todo.trello_card_id}`, {
        name: todo.title,
        desc: todo.description || '',
        labels: this._getImportanceLabel(todo.importance)
      }, {
        params: {
          key: this.key,
          token: this.token
        }
      });

      console.log('Trello card updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating Trello card:', error.message);
      // Don't throw error as this is not critical for todo update
      console.log('Continuing with todo update despite Trello error');
      return true;
    }
  }

  // Delete a Trello card
  async deleteCard(trelloCardId) {
    if (!this.isConfigured()) {
      console.log('Trello not configured, skipping card deletion');
      return true;
    }

    try {
      if (!trelloCardId) {
        return true; // No card to delete
      }

      await axios.delete(`${this.baseUrl}/cards/${trelloCardId}`, {
        params: {
          key: this.key,
          token: this.token
        }
      });

      return true;
    } catch (error) {
      console.error('Error deleting Trello card:', error.message);
      throw new Error('Failed to delete Trello card');
    }
  }

  // Move card to completed list if status is completed
  async moveToCompletedList(todo) {
    if (!this.isConfigured()) {
      console.log('Trello not configured, skipping card move');
      return true;
    }

    try {
      if (!todo.trello_card_id || todo.status !== 'Tamamlandı') {
        return true;
      }

      // Get the completed list ID (assuming it's the second list on the board)
      const lists = await this._getBoardLists();
      const completedList = lists.find(list => 
        list.name.toLowerCase().includes('completed') || 
        list.name.toLowerCase().includes('tamamlandı')
      );

      if (completedList) {
        await axios.put(`${this.baseUrl}/cards/${todo.trello_card_id}`, {
          idList: completedList.id
        }, {
          params: {
            key: this.key,
            token: this.token
          }
        });
      }

      return true;
    } catch (error) {
      console.error('Error moving card to completed list:', error.message);
      // Don't throw error as this is not critical
      return true;
    }
  }

  // Get board lists
  async _getBoardLists() {
    try {
      const response = await axios.get(`${this.baseUrl}/boards/${this.boardId}/lists`, {
        params: {
          key: this.key,
          token: this.token
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting board lists:', error.message);
      return [];
    }
  }

  // Upload image to Trello card as attachment
  async uploadImageToCard(cardId, imagePath) {
    if (!this.isConfigured()) {
      console.log('Trello not configured, skipping image upload');
      return false;
    }

    try {
      const uploadDir = process.env.UPLOAD_PATH || './uploads';
      const fullImagePath = path.join(uploadDir, imagePath);
      
      // Check if file exists
      if (!fs.existsSync(fullImagePath)) {
        throw new Error(`Image file not found: ${fullImagePath}`);
      }

      // Create form data for file upload
      const formData = new FormData();
      formData.append('key', this.key);
      formData.append('token', this.token);
      formData.append('file', fs.createReadStream(fullImagePath));
      formData.append('name', path.basename(imagePath));

      console.log('📤 Uploading image to Trello card:', {
        cardId,
        imagePath,
        fullPath: fullImagePath
      });

      const response = await axios.post(
        `${this.baseUrl}/cards/${cardId}/attachments`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        }
      );

      console.log('✅ Image uploaded to Trello successfully:', response.data.id);
      return response.data.id;
    } catch (error) {
      console.error('❌ Error uploading image to Trello:', error.message);
      if (error.response) {
        console.error('📝 Trello API Error:', error.response.data);
      }
      throw error;
    }
  }

  // Get importance label color
  _getImportanceLabel(importance) {
    const labels = {
      'Yüksek': 'red',
      'Orta': 'yellow',
      'Düşük': 'green'
    };
    return labels[importance] || 'yellow';
  }

  // Validate Trello configuration
  validateConfig() {
    if (!this.key || !this.token || !this.boardId || !this.listId) {
      console.warn('Trello configuration is incomplete. Trello integration will be disabled.');
      return false;
    }
    return true;
  }

  // Check if Trello is configured
  isConfigured() {
    return !!(this.key && this.token && this.boardId && this.listId);
  }
}

module.exports = new TrelloService();
