'use strict';

const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const saltRounds = 10;
    const hashedPasswordRestarant = await bcrypt.hash('restaurante123', saltRounds);
    const hashedPasswordCompany = await bcrypt.hash('empresa123', saltRounds);
    const hashedPasswordEmployee = await bcrypt.hash('funcionario123', saltRounds);
    


    return queryInterface.bulkInsert('user', [
      // Restaurants (6)
      {
        id: 1,
        email: 'admin@tech.com',
        password: hashedPasswordRestarant,
        user_type: 'restaurant',
        profile_image:'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1b/d9/aa/99/nova-unidade-do-sabores.jpg?w=900&h=-1&s=1'
      },
      {
        id: 2,
        email: 'italian@restaurant.com',
        password: hashedPasswordRestarant,
        user_type: 'restaurant',
        profile_image:'https://resize.casapino.com.br/?u=https://cms-bomgourmet.s3.amazonaws.com/bomgourmet/2019/01/201901/osteria-trattoria-ristorante-italia-18ceab70.jpg&w=480'
      },
      {
        id: 3,
        email: 'mexican@restaurant.com',
        password: hashedPasswordRestarant,
        user_type: 'restaurant',
        profile_image:'https://s3-media0.fl.yelpcdn.com/bphoto/x3K3E8xCcUuQkLjRvilM6Q/o.jpg'
      },
      {
        id: 4,
        email: 'japanese@restaurant.com',
        password: hashedPasswordRestarant,
        user_type: 'restaurant',
        profile_image:'https://www.archdaily.com.br/br/906125/takeshi-temakeria-and-sushi-bar-studio-bloco-arquitetura'
      },
      {
        id: 5,
        email: 'vegan@restaurant.com',
        password: hashedPasswordRestarant,
        user_type: 'restaurant',
        profile_image:'https://images.adsttc.com/media/images/5bf3/5d1c/08a5/e509/1100/014e/newsletter/FEATURE_IMAGE.jpg?1542675707'
      },
      {
        id: 6,
        email: 'bbq@restaurant.com',
        password: hashedPasswordRestarant,
        user_type: 'restaurant',
        profile_image:'https://www.dbresciachurrascaria.com.br/wp-content/uploads/2022/09/MG_4347.jpg'
      },
      
      // Companies (3)
      {
        id: 7,
        email: 'company@tech.com',
        password: hashedPasswordCompany,
        user_type: 'company',
        profile_image:'https://img.freepik.com/vetores-gratis/logotipo-abstrato-em-forma-de-chama_1043-44.jpg?ga=GA1.1.269589911.1750534321&semt=ais_hybrid&w=740'
      },
      {
        id: 8,
        email: 'foodlovers@company.com',
        password: hashedPasswordCompany,
        user_type: 'company',
        profile_image:'https://img.freepik.com/vetores-gratis/logotipo-abstrato-feito-com-quadrados-arredondados_1043-52.jpg?ga=GA1.1.269589911.1750534321&semt=ais_hybrid&w=740'
      },
      {
        id: 9,
        email: 'gourmet@company.com',
        password: hashedPasswordCompany,
        user_type: 'company',
        profile_image:'https://img.freepik.com/vetores-premium/logotipo-de-negocios-design-profissional-de-marca-corporativa-logotipo-de-empresa-moderna_591968-323.jpg?ga=GA1.1.269589911.1750534321&semt=ais_hybrid&w=740'
      },
      
      // Employees (6)
      {
        id: 10,
        email: 'employee@tech.com',
        password: hashedPasswordEmployee,
        user_type: 'employee',
        profile_image:'https://plus.unsplash.com/premium_photo-1689568126014-06fea9d5d341?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
      },
      {
        id: 11,
        email: 'maria@employee.com',
        password: hashedPasswordEmployee,
        user_type: 'employee',
        profile_image:'https://media.gettyimages.com/id/1437816897/pt/foto/business-woman-manager-or-human-resources-portrait-for-career-success-company-we-are-hiring-or.jpg?s=612x612&w=0&k=20&c=OsiL-G3rU8NzppNGl3Yh9exwYzoSfCrRb9gxawy1VR4='
      },
      {
        id: 12,
        email: 'carlos@employee.com',
        password: hashedPasswordEmployee,
        user_type: 'employee',
        profile_image:'https://plus.unsplash.com/premium_photo-1689977968861-9c91dbb16049?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cGVzc29hJTIwc29ycmluZG98ZW58MHx8MHx8fDA%3D'
      },
      {
        id: 13,
        email: 'ana@employee.com',
        password: hashedPasswordEmployee,
        user_type: 'employee',
        profile_image:'https://media.gettyimages.com/id/1487465664/pt/foto/portrait-employee-and-asian-woman-with-happiness-selfie-and-confident-entrepreneur-with.jpg?s=612x612&w=0&k=20&c=kQw3fH-glSiyK7963vnebaAm59nLl6CIx8Ov_yNEKV8='
      },
      {
        id: 14,
        email: 'pedro@employee.com',
        password: hashedPasswordEmployee,
        user_type: 'employee',
        profile_image:'https://media.istockphoto.com/id/2192499195/pt/foto/studio-portrait-of-happy-multiracial-mid-adult-man-wearing-brown-shirt-toothy-smile.webp?a=1&b=1&s=612x612&w=0&k=20&c=JnxZiI5qV47Jl7_DscjBnFBEdtNlWYVmgSczJcf0C_I='
      },
      {
        id: 15,
        email: 'lucia@employee.com',
        password: hashedPasswordEmployee,
        user_type: 'employee',
        profile_image:'https://media.gettyimages.com/id/1305462732/pt/foto/headshot-studio-portrait-of-a-woman-in-profile-looking-at-the-camera.jpg?s=612x612&w=0&k=20&c=X7uJWxc-eqzPg762gKSAKR0Isxn_xLYSyZ0VxCfD8Qo='
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('user', null, {});
  }
};