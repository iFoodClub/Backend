'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('restaurant', [
      {
        id: 1,
        userId: 1,
        name: 'Sabores do Chef',
        cnpj: '12.345.678/0001-90',
        cep: '12345-678',
        rua: 'Rua das Flores',
        cidade: 'São Paulo',
        estado: 'SP',
        number: '123',
        complemento: 'Sala 101',
        image: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1b/d9/aa/99/nova-unidade-do-sabores.jpg?w=900&h=-1&s=1',
      },
      {
        id: 2,
        userId: 2,
        name: 'Trattoria Italiana',
        cnpj: '23.456.789/0001-01',
        cep: '23456-789',
        rua: 'Avenida Paulista',
        cidade: 'São Paulo',
        estado: 'SP',
        number: '456',
        complemento: 'Loja 2',
        image: 'https://resize.casapino.com.br/?u=https://cms-bomgourmet.s3.amazonaws.com/bomgourmet/2019/01/201901/osteria-trattoria-ristorante-italia-18ceab70.jpg&w=480',
      },
      {
        id: 3,
        userId: 3,
        name: 'Cantina Mexicana',
        cnpj: '34.567.890/0001-12',
        cep: '34567-890',
        rua: 'Rua Augusta',
        cidade: 'São Paulo',
        estado: 'SP',
        number: '789',
        complemento: 'Térreo',
        image: 'https://s3-media0.fl.yelpcdn.com/bphoto/x3K3E8xCcUuQkLjRvilM6Q/o.jpg',
      },
      {
        id: 4,
        userId: 4,
        name: 'Sushi Palace',
        cnpj: '45.678.901/0001-23',
        cep: '45678-901',
        rua: 'Rua Oscar Freire',
        cidade: 'São Paulo',
        estado: 'SP',
        number: '101',
        complemento: 'Sala 205',
        image: 'https://images.adsttc.com/media/images/5bf3/5d1c/08a5/e509/1100/014e/newsletter/FEATURE_IMAGE.jpg?1542675707',
      },
      {
        id: 5,
        userId: 5,
        name: 'Green Vegan',
        cnpj: '56.789.012/0001-34',
        cep: '56789-012',
        rua: 'Rua dos Pinheiros',
        cidade: 'São Paulo',
        estado: 'SP',
        number: '202',
        complemento: 'Loja 15',
        image: 'https://simonde.com.br/wp-content/uploads/2019/11/restaurante-teva-vegetal-vegano-vegetariano-organico-sao-paulo-pinheiros-1200-5.jpg.webp',
      },
      {
        id: 6,
        userId: 6,
        name: 'Texas BBQ',
        cnpj: '67.890.123/0001-45',
        cep: '67890-123',
        rua: 'Rua da Consolação',
        cidade: 'São Paulo',
        estado: 'SP',
        number: '303',
        complemento: 'Sala 401',
        image: 'https://www.dbresciachurrascaria.com.br/wp-content/uploads/2022/09/MG_4433.jpg',
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('restaurant', null, {});
  }
};