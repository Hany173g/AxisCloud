import type { ITokenDocument } from "../models/token.model.js"

export interface TokenType extends ITokenDocument {
    createdAt: Date,
    updatedAt: Date
}
