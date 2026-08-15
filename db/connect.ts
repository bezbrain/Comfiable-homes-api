import dns from "dns";
import mongoose from "mongoose";

const connectDB = (url: string) => {
  // Windows/local DNS often refuses MongoDB Atlas SRV lookups (querySrv ECONNREFUSED).
  if (url.startsWith("mongodb+srv://")) {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
  }

  return mongoose.connect(url, { family: 4 });
};

export const disconnectDB = () => mongoose.disconnect();

export default connectDB;
