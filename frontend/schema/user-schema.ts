// schema/user-schema.ts

import { Schema, model, models, Document } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    userType: 'regular' | 'premium' | 'manufacturer' | 'logistics' | 'dealer' | 'insurance' | 'admin';
}

const UserSchema = new Schema<IUser>(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true },
        userType: {
            type: String,
            enum: ['regular', 'premium', 'manufacturer', 'logistics', 'dealer', 'insurance', 'admin'],
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const User = models.User || model<IUser>('User', UserSchema);

export default User;
