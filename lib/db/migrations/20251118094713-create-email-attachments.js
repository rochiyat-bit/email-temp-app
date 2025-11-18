'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('email_attachments', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      receivedEmailId: {
        type: Sequelize.UUID,
        allowNull: false,
        field: 'received_email_id',
        references: {
          model: 'received_emails',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      filename: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      contentType: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'content_type',
      },
      size: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      content: {
        type: Sequelize.BLOB,
        allowNull: false,
      },
      downloadCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        field: 'download_count',
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        field: 'created_at',
      },
    });

    // Add index
    await queryInterface.addIndex('email_attachments', ['received_email_id'], {
      name: 'email_attachments_received_email_id',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('email_attachments');
  },
};
