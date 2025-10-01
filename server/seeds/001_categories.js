exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('categories').del()
    .then(function () {
      // Inserts seed entries
      return knex('categories').insert([
        {
          name_tr: 'Genel',
          name_en: 'General'
        },
        {
          name_tr: 'İngilizce Kursu',
          name_en: 'English Course'
        },
        {
          name_tr: 'Faturalar',
          name_en: 'Bills'
        },
        {
          name_tr: 'Sağlık',
          name_en: 'Health'
        },
        {
          name_tr: 'Alışveriş',
          name_en: 'Shopping'
        }
      ]);
    });
};
