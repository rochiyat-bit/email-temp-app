import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../index';

interface TemporaryEmailAttributes {
  id: string;
  emailAddress: string;
  displayName: string;
  createdAt: Date;
  expiresAt: Date;
  lastAccessedAt: Date;
  isActive: boolean;
  accessToken: string;
  ipAddress: string;
  userAgent: string;
  totalEmailsReceived: number;
}

interface TemporaryEmailCreationAttributes
  extends Optional<TemporaryEmailAttributes, 'id' | 'createdAt' | 'lastAccessedAt' | 'totalEmailsReceived'> {}

class TemporaryEmail
  extends Model<TemporaryEmailAttributes, TemporaryEmailCreationAttributes>
  implements TemporaryEmailAttributes
{
  declare id: string;
  declare emailAddress: string;
  declare displayName: string;
  declare createdAt: Date;
  declare expiresAt: Date;
  declare lastAccessedAt: Date;
  declare isActive: boolean;
  declare accessToken: string;
  declare ipAddress: string;
  declare userAgent: string;
  declare totalEmailsReceived: number;
}

TemporaryEmail.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    emailAddress: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    displayName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    lastAccessedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    accessToken: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    totalEmailsReceived: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: 'temporary_emails',
    timestamps: false,
    indexes: [
      { fields: ['emailAddress'], unique: true },
      { fields: ['accessToken'], unique: true },
      { fields: ['expiresAt'] },
      { fields: ['createdAt'] },
      { fields: ['ipAddress'] },
    ],
  }
);

export default TemporaryEmail;
