import mongoose from "mongoose";

const connectDB = async () => {
    mongoose.connection.on("connected", () => {
        console.log("Mongoose DB is connected");
    })
    console.log("mongodb_uri: ", process.env.MONGODB_URI);
    await mongoose.connect(`${process.env.MONGODB_URI}/DeShip`);
};

export default connectDB;
