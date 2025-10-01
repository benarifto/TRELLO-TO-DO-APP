exports.up = function(knex) {
  return knex.schema.createTable('todos', function(table) {
    table.increments('id').primary();
    table.string('title', 100).notNullable();
    table.text('description');
    table.integer('category_id').unsigned().references('id').inTable('categories').onDelete('CASCADE');
    table.enum('importance', ['Yüksek', 'Orta', 'Düşük']).defaultTo('Orta');
    table.enum('status', ['Aktif', 'Tamamlandı']).defaultTo('Aktif');
    table.string('image_path');
    table.string('trello_card_id');
    table.timestamps(true, true);
    
    // Indexes for better performance
    table.index(['category_id']);
    table.index(['status']);
    table.index(['importance']);
    table.index(['created_at']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('todos');
};
