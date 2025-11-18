import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../index';
import TemporaryEmail from './TemporaryEmail';

interface ReceivedEmailAttributes {
  id: string;
  temporaryEmailId: string;
  fromAddress: string;
  fromName: string;
  subject: string;
  textBody: string;
  htmlBody: string;
  receivedAt: Date;
  hasAttachments: boolean;
  isRead: boolean;
  size: number;
  headers: Record<string, any>;
  spamScore: number;
}

interface ReceivedEmailCreationAttributes
  extends Optional<ReceivedEmailAttributes, 'id' | 'receivedAt' | 'hasAttachments' | 'isRead' | 'spamScore'> {}

class ReceivedEmail
  extends Model<ReceivedEmailAttributes, ReceivedEmailCreationAttributes>
  implements ReceivedEmailAttributes
{
  declare id: string;
  declare temporaryEmailId: string;
  declare fromAddress: string;
  declare fromName: string;
  declare subject: string;
  declare textBody: string;
  declare htmlBody: string;
  declare receivedAt: Date;
  declare hasAttachments: boolean;
  declare isRead: boolean;
  declare size: number;
  declare headers: Record<string, any>;
  declare spamScore: number;
}

ReceivedEmail.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    temporaryEmailId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'temporary_emails',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    fromAddress: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fromName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subject: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    textBody: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    htmlBody: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    receivedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    hasAttachments: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    headers: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    spamScore: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: 'received_emails',
    timestamps: false,
    indexes: [
      { fields: ['temporaryEmailId'] },
      { fields: ['receivedAt'] },
      { fields: ['fromAddress'] },
    ],
  }
);

// Associations
ReceivedEmail.belongsTo(TemporaryEmail, {
  foreignKey: 'temporaryEmailId',
  as: 'temporaryEmail',
});

TemporaryEmail.hasMany(ReceivedEmail, {
  foreignKey: 'temporaryEmailId',
  as: 'receivedEmails',
});

export default ReceivedEmail;
