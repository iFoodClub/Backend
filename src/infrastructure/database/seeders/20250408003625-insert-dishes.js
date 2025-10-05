'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('dish', [
      // Restaurant 1 dishes
      {
        id: 1,
        restaurantId: 1,
        name: 'Spaghetti Carbonara',
        description: 'A classic Italian pasta dish made with eggs, cheese, pancetta, and pepper.',
        price: 12.99,
        image: 'https://cdn.urbano.com.br/uploads/espaguete-a-carbonara-800.jpg',
      },
      {
        id: 2,
        restaurantId: 1,
        name: 'Margherita Pizza',
        description: 'Traditional pizza with tomato sauce, fresh mozzarella, basil, and olive oil.',
        price: 14.99,
        image: 'https://ooni.com/cdn/shop/articles/20220211142347-margherita-9920_ba86be55-674e-4f35-8094-2067ab41a671.jpg?crop=center&height=800&v=1737104576&width=800',
      },
      {
        id: 3,
        restaurantId: 1,
        name: 'Tiramisu',
        description: 'Classic Italian dessert with layers of coffee-soaked ladyfingers and mascarpone cream.',
        price: 7.99,
        image: 'https://receitasde.com.br/wp-content/uploads/2024/09/Tiramisu.jpg',
      },
      
      // Restaurant 2 dishes
      {
        id: 4,
        restaurantId: 2,
        name: 'Lasagna Bolognese',
        description: 'Layers of pasta with rich meat sauce and béchamel.',
        price: 15.99,
        image: 'https://asimplepalate.com/wp-content/uploads/2024/05/Lasagna-Bolognese-scaled.jpg',
      },
      {
        id: 5,
        restaurantId: 2,
        name: 'Risotto ai Funghi',
        description: 'Creamy risotto with wild mushrooms and parmesan.',
        price: 13.99,
        image: 'https://static.tecnichenuove.it/cucinanaturale/2021/02/risotto-funghi-nocciole-rosmarino.jpg',
      },
      
      // Restaurant 3 dishes
      {
        id: 6,
        restaurantId: 3,
        name: 'Tacos al Pastor',
        description: 'Marinated pork tacos with pineapple and cilantro.',
        price: 10.99,
        image: 'https://iamafoodblog.b-cdn.net/wp-content/uploads/2021/05/al-pastor-3507w-1024x683.jpg',
      },
      {
        id: 7,
        restaurantId: 3,
        name: 'Enchiladas Verdes',
        description: 'Corn tortillas rolled around chicken and covered with green salsa.',
        price: 11.99,
        image: 'https://www.maricruzavalos.com/wp-content/uploads/2020/06/enchiladas-suizas-recipe.jpg',
      },
      
      // Restaurant 4 dishes
      {
        id: 8,
        restaurantId: 4,
        name: 'Sushi Combo',
        description: 'Assorted sushi pieces with miso soup.',
        price: 18.99,
        image: 'https://static.wixstatic.com/media/1d0b6f_1079e86f23094136ad88e2f485df8fc0~mv2.jpg/v1/crop/x_100,y_0,w_1849,h_1365/fill/w_594,h_462,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/IMG_0239.jpg',
      },
      {
        id: 9,
        restaurantId: 4,
        name: 'Ramen Tonkotsu',
        description: 'Pork bone broth ramen with noodles and toppings.',
        price: 14.99,
        image: 'https://www.seriouseats.com/thmb/IBikLAGkkP2QVaF3vLIk_LeNqHM=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/rich-and-creamy-tonkotsu-ramen-broth-from-scratch-recipe-Diana-Chistruga-hero-6d318fadcca64cc9ac3e1c40fc7682fb.JPG',
      },
      
      // Restaurant 5 dishes
      {
        id: 10,
        restaurantId: 5,
        name: 'Vegan Burger',
        description: 'Plant-based burger with all the fixings.',
        price: 11.99,
        image: 'https://minimalistbaker.com/wp-content/uploads/2021/04/Best-Vegan-Burger-SQUARE-500x500.jpg',
      },
      {
        id: 11,
        restaurantId: 5,
        name: 'Quinoa Salad',
        description: 'Fresh salad with quinoa, vegetables and tahini dressing.',
        price: 9.99,
        image: 'https://shaneandsimple.com/wp-content/uploads/2024/04/med-quinoa-salad-process-1-ingredients.jpeg',
      },
      
      // Restaurant 6 dishes
      {
        id: 12,
        restaurantId: 6,
        name: 'BBQ Ribs',
        description: 'Slow-cooked ribs with house BBQ sauce.',
        price: 19.99,
        image: 'https://www.allrecipes.com/thmb/I2ENWJQG1mb2b5OSXPqQudzlzJw=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/220987-Baked-BBQ-Baby-Back-Ribs-mfs-041-77a42b0ce0f0424e9aeec2b22664f1aa.jpg',
      },
      {
        id: 13,
        restaurantId: 6,
        name: 'Pulled Pork Sandwich',
        description: 'Tender pulled pork on a brioche bun with coleslaw.',
        price: 12.99,
        image: 'https://saltpepperskillet.com/wp-content/uploads/pulled-pork-sandwiches-on-butcher-paper-horizontal.jpg',
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('dish', null, {});
  }
};