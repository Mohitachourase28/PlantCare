import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

console.log("Cloud Name:", process.env.CLOUDINARY_NAME);
console.log("API Key:", process.env.CLOUDINARY_API_KEY);
console.log("API Secret:", process.env.CLOUDINARY_API_SECRET ? "Loaded ✅" : "Missing ❌");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
// Check connection
const checkCloudinary = async () => {
  try {
    const result = await cloudinary.api.ping();
    console.log("✅ Cloudinary connected:", result);
  } catch (error) {
    console.error("❌ Cloudinary connection failed:", error.message);
  }
};

checkCloudinary();
export default cloudinary;
