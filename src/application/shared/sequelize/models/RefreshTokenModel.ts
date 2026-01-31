import { DataTypes, Model } from "sequelize";
import SequelizeSingleton from "../index";

interface RefreshTokenAttributes {
  id?: number;
  userId: string;
  tokenHash: string;
  parentId?: number | null;
  isRevoked?: boolean;
  revokedAt?: Date | null;
  replacedByTokenHash?: string | null;
  expiresAt: Date;
  createdAt?: Date;
  createdIp?: string | null;
  userAgent?: string | null;
}

export class RefreshTokenModel
  extends Model<RefreshTokenAttributes>
  implements RefreshTokenAttributes {
  public id!: number;
  public userId!: string;
  public tokenHash!: string;
  public parentId?: number | null;
  public isRevoked!: boolean;
  public revokedAt?: Date | null;
  public replacedByTokenHash?: string | null;
  public expiresAt!: Date;
  public createdAt!: Date;
  public createdIp?: string | null;
  public userAgent?: string | null;
}

RefreshTokenModel.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
      field: "user_id",
    },
    tokenHash: {
      type: DataTypes.STRING(64),
      allowNull: false,
      field: "token_hash",
    },
    parentId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: "refresh_tokens",
        key: "id",
      },
      field: "parent_id",
    },
    isRevoked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "is_revoked",
    },
    revokedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "revoked_at",
    },
    replacedByTokenHash: {
      type: DataTypes.STRING(64),
      allowNull: true,
      field: "replaced_by_token_hash",
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "expires_at",
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "created_at",
    },
    createdIp: {
      type: DataTypes.INET,
      allowNull: true,
      field: "created_ip",
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "user_agent",
    },
  },
  {
    sequelize: SequelizeSingleton.getInstance(),
    tableName: "refresh_tokens",
    timestamps: false,
    underscored: true,
  },
);

export default RefreshTokenModel;
