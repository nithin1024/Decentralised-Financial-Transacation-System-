import mongoose, { Schema } from "mongoose";

export type UserRole = "USER" | "ADMIN";

export type UserDoc = {
  fullName?: string;
  email?: string;
  passwordHash?: string;
  walletAddress: string;
  role: UserRole;
  createdAt: Date;
  lastLoginAt?: Date;
  frozen: boolean;
  trustScore: number;
};

const UserSchema = new Schema<UserDoc>(
  {
    fullName: { type: String, required: false },
    email: { type: String, required: false, unique: true, sparse: true, index: true },
    passwordHash: { type: String, required: false },
    walletAddress: { type: String, required: true, unique: true, index: true },
    role: { type: String, required: true, enum: ["USER", "ADMIN"], default: "USER" },
    frozen: { type: Boolean, required: true, default: false },
    trustScore: { type: Number, required: true, default: 0.85 },
    lastLoginAt: { type: Date, required: false }
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

export const UserModel = mongoose.model<UserDoc>("User", UserSchema);

