import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../index';
import ReceivedEmail from './ReceivedEmail';

interface EmailAttachmentAttributes {
  id: string;
  receivedEmailId: string;
  filename: string;
  contentType: string;
  size: number;
  content: Buffer;
  downloadCount: number;
  createdAt: Date;
}

interface EmailAttachmentCreationAttributes
  extends Optional<EmailAttachmentAttributes, 'id' | 'downloadCount' | 'createdAt'> {}

class EmailAttachment
  extends Model<EmailAttachmentAttributes, EmailAttachmentCreationAttributes>
  implements EmailAttachmentAttributes
{
  declare id: string;
  declare receivedEmailId: string;
  declare filename: string;
  declare contentType: string;
  declare size: number;
  declare content: Buffer;
  declare downloadCount: number;
  declare createdAt: Date;
}

EmailAttachment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    receivedEmailId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'received_emails',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    filename: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contentType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    content: {
      type: DataTypes.BLOB,
      allowNull: false,
    },
    downloadCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'email_attachments',
    timestamps: false,
    indexes: [{ fields: ['receivedEmailId'] }],
  }
);

// Associations
EmailAttachment.belongsTo(ReceivedEmail, {
  foreignKey: 'receivedEmailId',
  as: 'receivedEmail',
});

ReceivedEmail.hasMany(EmailAttachment, {
  foreignKey: 'receivedEmailId',
  as: 'attachments',
});

export default EmailAttachment;
