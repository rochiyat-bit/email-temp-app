'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('email_domains', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      domain: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        field: 'is_active',
      },
      maxEmailsPerDay: {
        type: Sequelize.INTEGER,
        defaultValue: 100,
        field: 'max_emails_per_day',
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        field: 'created_at',
      },
    });

    // Add index
    await queryInterface.addIndex('email_domains', ['domain'], {
      unique: true,
      name: 'email_domains_domain',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('email_domains');
  },
};
