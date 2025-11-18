'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'email_domains',
      [
        {
          id: uuidv4(),
          domain: 'tempmail.example.com',
          is_active: true,
          max_emails_per_day: 1000,
          description: 'Primary temporary email domain',
          created_at: new Date(),
        },
        {
          id: uuidv4(),
          domain: 'disposable.example.com',
          is_active: true,
          max_emails_per_day: 1000,
          description: 'Secondary temporary email domain',
          created_at: new Date(),
        },
        {
          id: uuidv4(),
          domain: 'throwaway.example.com',
          is_active: true,
          max_emails_per_day: 500,
          description: 'Tertiary temporary email domain',
          created_at: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('email_domains', null, {});
  },
};
