import redisClient from "../config/redis.js";

export const getCache = async (key) => {
    try {
        const data = await redisClient.get(key);
        if (!data) {
            return null;
        }
        return JSON.parse(data);

    } catch (err) {
        console.error(`Redis GET error for key ${key}:`, err);
        return null;
    }
};

export const setCache = async (key, data, ttl = 60) => {
    try {
        await redisClient.set(key, JSON.stringify(data), {
            Ex: ttl,
        })
        return true;
    } catch (err) {
        console.log(`Redis Set error for key ${key} : `, err);
        return false;
    }
}

export const deleteCache = async (key) => {
    try {
        await redisClient.del(key);
        return true;
    } catch (err) {
        console.log(`Redis DELETE error for key ${key}:`, err)
        return false;
    }
}

export const deleteProductListCache = async () => {
    try {
        const keys = await redisClient.keys("shopnext:v2:products:*");

        if (keys.length > 0) {
            await redisClient.del(keys);
        }

        return true;
    } catch (error) {
        console.error("Redis product list cache delete error:", error);
        return false;
    }
};