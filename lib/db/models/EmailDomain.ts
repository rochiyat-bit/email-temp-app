import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../index';

interface EmailDomainAttributes {
  id: string;
  domain: string;
  isActive: boolean;
  maxEmailsPerDay: number;
  description: string;
  createdAt: Date;
}

interface EmailDomainCreationAttributes
  extends Optional<EmailDomainAttributes, 'id' | 'isActive' | 'maxEmailsPerDay' | 'createdAt'> {}

class EmailDomain
  extends Model<EmailDomainAttributes, EmailDomainCreationAttributes>
  implements EmailDomainAttributes
{
  declare id: string;
  declare domain: string;
  declare isActive: boolean;
  declare maxEmailsPerDay: number;
  declare description: string;
  declare createdAt: Date;
}

EmailDomain.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    domain: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    maxEmailsPerDay: {
      type: DataTypes.INTEGER,
      defaultValue: 100,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'email_domains',
    timestamps: false,
    indexes: [{ fields: ['domain'], unique: true }],
  }
);

export default EmailDomain;
