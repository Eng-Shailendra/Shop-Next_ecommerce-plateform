import cloudinary from "../../config/cloudinary.js";
import { Product } from "../../models/product-model.js";
import { deleteProductListCache, getCache, setCache } from "../../services/cache-service.js";


/**
 * First cheack  redis -->❌-mongodb-->redis--->response 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
export const getProducts = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);

        const skip = (page - 1) * limit;

        const cacheKey = `shopnext:v2:products:page:${page}:limit:${limit}`;

        // 1. Check Redis cache
        const cachedData = await getCache(cacheKey);

        if (cachedData) {
            return res.status(200).json({
                success: true,
                source: "cache",
                ...cachedData
            });
        }

        // 2. Fetch from MongoDB
        const [products, total] = await Promise.all([
            Product.find({})
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),

            Product.countDocuments({})
        ]);

        const totalPages = Math.ceil(total / limit);

        const responseData = {
            data: products,
            pagination: {
                page,
                limit,
                total,
                totalPages
            }
        };

        // 3. Store result in Redis for 60 seconds
        await setCache(cacheKey, responseData, 60);

        // 4. Return response
        return res.status(200).json({
            success: true,
            source: "database",
            ...responseData
        });

    } catch (error) {
        console.error("V2 getProducts error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

/**
 * Product cheack by id it match the id form first cheack  redis -->❌-mongodb-->redis--->response 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Product id not found"
            });
        }

        const cacheKey = `shopnext:v2:product:${id}`;

        // 1. Check Redis
        const cachedProduct = await getCache(cacheKey);

        if (cachedProduct) {
            return res.status(200).json({
                success: true,
                source: "cache",
                data: cachedProduct
            });
        }

        // 2. Fetch from MongoDB
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // 3. Store in Redis for 120 seconds
        await setCache(cacheKey, product, 120);

        // 4. Return response
        return res.status(200).json({
            success: true,
            source: "database",
            data: product
        });

    } catch (error) {
        console.error("V2 getProductById error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


export const createProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            category,
            stock
        } = req.body;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Image is not uploaded"
            });
        }

        const imageurl = await cloudinary.uploader.upload(req.file.path);

        if (!name || !description || !price || !category || !stock) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const product = new Product({
            name,
            description,
            price,
            category,
            admin: req.user._id,
            imageUrls: [
                {
                    url: imageurl.secure_url
                }
            ],
            stock
        });

        await product.save();

        // Invalidate product list cache
        await deleteProductListCache();

        return res.status(201).json({
            success: true,
            message: "Product added successfully",
            data: product
        });

    } catch (error) {
        console.error("V2 createProduct error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};