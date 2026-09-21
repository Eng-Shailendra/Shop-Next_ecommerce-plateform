import dotenv from "dotenv";
dotenv.config({ quiet: true });
import { connectDB } from "./src/config/databse.js";
import redisClient from "./src/config/redis.js";
import app from "./src/app.js";
import dns from 'node:dns'


const PORT = process.env.PORT || 8080;

dns.setServers([
    "1.1.1.1",
    "8.8.8.8"
])
//! Database 

connectDB();
await redisClient.connect();

app.listen(PORT, (err) => {
    if (err)
        console.log(err);
    console.log("Server start successfully 🚀");
});




