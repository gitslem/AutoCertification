// db/connection.ts

import mongoose from 'mongoose';

const Connection = async (username: string, password: string): Promise<void> => {
    const URL = `mongodb+srv://${username}:${password}@cluster0.m9kkcg0.mongodb.net/autocertify?retryWrites=true&w=majority`;

    try {
        await mongoose.connect(URL);
        console.log("Database connection established");
    } catch (err) {
        console.error("Error while connecting to database", err);
    }
};

export default Connection;
