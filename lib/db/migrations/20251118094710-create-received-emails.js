'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('received_emails', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      temporaryEmailId: {
        type: Sequelize.UUID,
        allowNull: false,
        field: 'temporary_email_id',
        references: {
          model: 'temporary_emails',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      fromAddress: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'from_address',
      },
      fromName: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'from_name',
      },
      subject: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      textBody: {
        type: Sequelize.TEXT,
        allowNull: false,
        field: 'text_body',
      },
      htmlBody: {
        type: Sequelize.TEXT,
        allowNull: false,
        field: 'html_body',
      },
      receivedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        field: 'received_at',
      },
      hasAttachments: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        field: 'has_attachments',
      },
      isRead: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        field: 'is_read',
      },
      size: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      headers: {
        type: Sequelize.JSONB,
        allowNull: false,
      },
      spamScore: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
        field: 'spam_score',
      },
    });

    // Add indexes
    await queryInterface.addIndex('received_emails', ['temporary_email_id'], {
      name: 'received_emails_temporary_email_id',
    });
    await queryInterface.addIndex('received_emails', ['received_at'], {
      name: 'received_emails_received_at',
    });
    await queryInterface.addIndex('received_emails', ['from_address'], {
      name: 'received_emails_from_address',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('received_emails');
  },
};
