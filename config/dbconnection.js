import mongoose from "mongoose";

export const connectToDb = async () => {
    try {
        await mongoose.connect(process.env.DB_URL)
    } catch (err) {
        console.log("Error connecting to the database.")
    }
}