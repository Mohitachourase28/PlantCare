import { connect } from "mongoose";

const connectDB = async () => {
  try {
    await connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB Atlas Connected ✅");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

export default connectDB;
