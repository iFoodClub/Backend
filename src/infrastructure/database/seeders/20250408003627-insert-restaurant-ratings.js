'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('restaurant_rating', [
      // Avaliações para Sabores do Chef (ID: 1)
      {
        id: 1,
        restaurantId: 1,
        userId: 10,
        rating: 5,
        description: 'Excelente restaurante! Comida deliciosa e atendimento impecável. Recomendo muito!',
      },
      {
        id: 2,
        restaurantId: 1,
        userId: 11,
        rating: 4,
        description: 'Muito bom restaurante, pratos bem preparados e ambiente agradável.',
      },
      
      // Avaliações para Trattoria Italiana (ID: 2)
      {
        id: 3,
        restaurantId: 2,
        userId: 12,
        rating: 5,
        description: 'Autêntica culinária italiana! Massas frescas e molhos caseiros incríveis.',
      },
      {
        id: 4,
        restaurantId: 2,
        userId: 13,
        rating: 4,
        description: 'Ótima experiência gastronômica italiana. Pizza e risotos excelentes.',
      },
      
      // Avaliações para Cantina Mexicana (ID: 3)
      {
        id: 5,
        restaurantId: 3,
        userId: 14,
        rating: 4,
        description: 'Comida mexicana autêntica e saborosa. Tacos e guacamole perfeitos!',
      },
      {
        id: 6,
        restaurantId: 3,
        userId: 15,
        rating: 5,
        description: 'Melhor restaurante mexicano da região! Temperos e sabores incríveis.',
      },
      
      // Avaliações para Sushi Palace (ID: 4)
      {
        id: 7,
        restaurantId: 4,
        userId: 10,
        rating: 5,
        description: 'Sushi de primeira qualidade! Peixe fresco e preparo perfeito.',
      },
      {
        id: 8,
        restaurantId: 4,
        userId: 11,
        rating: 4,
        description: 'Ótimo restaurante japonês. Sushi e sashimi muito bons.',
      },
      
      // Avaliações para Green Vegan (ID: 5)
      {
        id: 9,
        restaurantId: 5,
        userId: 12,
        rating: 4,
        description: 'Excelente opção vegana! Pratos criativos e saborosos.',
      },
      {
        id: 10,
        restaurantId: 5,
        userId: 13,
        rating: 3,
        description: 'Bom restaurante vegano, mas poderia ter mais variedade nos pratos.',
      },
      
      // Avaliações para Texas BBQ (ID: 6)
      {
        id: 11,
        restaurantId: 6,
        userId: 14,
        rating: 5,
        description: 'Churrasco perfeito! Carnes suculentas e temperadas na medida certa.',
      },
      {
        id: 12,
        restaurantId: 6,
        userId: 15,
        rating: 4,
        description: 'Muito bom churrasco americano. Ambiente descontraído e comida saborosa.',
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('restaurant_rating', null, {});
  }
}; 