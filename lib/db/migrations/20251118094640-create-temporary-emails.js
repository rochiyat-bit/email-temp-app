'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('temporary_emails', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      emailAddress: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        field: 'email_address',
      },
      displayName: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'display_name',
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        field: 'created_at',
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'expires_at',
      },
      lastAccessedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        field: 'last_accessed_at',
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        field: 'is_active',
      },
      accessToken: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        field: 'access_token',
      },
      ipAddress: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'ip_address',
      },
      userAgent: {
        type: Sequelize.TEXT,
        allowNull: false,
        field: 'user_agent',
      },
      totalEmailsReceived: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        field: 'total_emails_received',
      },
    });

    // Add indexes
    await queryInterface.addIndex('temporary_emails', ['email_address'], {
      unique: true,
      name: 'temporary_emails_email_address',
    });
    await queryInterface.addIndex('temporary_emails', ['access_token'], {
      unique: true,
      name: 'temporary_emails_access_token',
    });
    await queryInterface.addIndex('temporary_emails', ['expires_at'], {
      name: 'temporary_emails_expires_at',
    });
    await queryInterface.addIndex('temporary_emails', ['created_at'], {
      name: 'temporary_emails_created_at',
    });
    await queryInterface.addIndex('temporary_emails', ['ip_address'], {
      name: 'temporary_emails_ip_address',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('temporary_emails');
  },
};
