import { createHash } from "crypto";
import {
    IRefreshTokenRepository,
    RefreshTokenEntity,
    RefreshTokenToSaveEntity,
} from "../models/IRefreshTokenRepository";
import RefreshTokenModel from "./models/RefreshTokenModel";

export class RefreshTokenRepoPostgreSql implements IRefreshTokenRepository {
    /**
     * Hash a refresh token using SHA256
     * Security best practice: store hash instead of raw token
     */
    private hashToken(token: string): string {
        return createHash("sha256").update(token).digest("hex");
    }

    /**
     * Save a new refresh token to the database
     */
    async save(token: RefreshTokenToSaveEntity): Promise<RefreshTokenEntity> {

        const tokenHash = this.hashToken(token.token);
        const savedToken = await RefreshTokenModel.create({
            tokenHash,
            userId: token.userId,
            expiresAt: token.expiresAt,
            createdAt: token.createdAt,
        });

        if (!savedToken.dataValues)
            throw new Error("Failed to save refresh token");

        return {
            id: savedToken.dataValues.id!.toString(),
            userId: savedToken.dataValues.userId,
            token: token.token, // Return original token (not hash)
            expiresAt: savedToken.dataValues.expiresAt!,
            createdAt: savedToken.dataValues.createdAt!,
            revokedAt: null,
        };
    }

    /**
     * Find a refresh token by its value
     * Returns null if token not found or is revoked/expired
     */
    async findByToken(token: string): Promise<RefreshTokenEntity | null> {
        const tokenHash = this.hashToken(token);

        const refreshToken = await RefreshTokenModel.findOne({
            where: { tokenHash },
        });

        if (!refreshToken || !refreshToken.dataValues) {
            return null;
        }

        return {
            id: refreshToken.dataValues.id!.toString(),
            userId: refreshToken.dataValues.userId,
            token, // Return the token that was passed in
            expiresAt: refreshToken.dataValues.expiresAt!,
            createdAt: refreshToken.dataValues.createdAt!,
            revokedAt: refreshToken.dataValues.revokedAt || null,
        };
    }

    /**
     * Revoke a refresh token by marking it as revoked
     * Used for token rotation
     */
    async revokeByToken(token: string): Promise<void> {
        const tokenHash = this.hashToken(token);

        await RefreshTokenModel.update(
            {
                isRevoked: true,
                revokedAt: new Date(),
            },
            {
                where: { tokenHash },
            },
        );
    }

    /**
     * Revoke all refresh tokens for a user
     * Used for logout or security purposes
     */
    async revokeAllByUserId(userId: string): Promise<void> {
        await RefreshTokenModel.update(
            {
                isRevoked: true,
                revokedAt: new Date(),
            },
            {
                where: { userId },
            },
        );
    }
}

// singleton instance
export const RefreshTokenRepoPostgreSqlImp = new RefreshTokenRepoPostgreSql();
