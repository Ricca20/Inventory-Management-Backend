import { Product } from "../models/product.model.js";

// Add product
export const addProduct = async (req, res) => {
    try {
        // Validate request body
        if (!req.body.name || !req.body.type || !req.body.quantity || !req.body.price) {
            return res.status(400).send({ message: "Send all required fields" });
        }

        // Create new product
        const newProduct = {
            name: req.body.name,
            type: req.body.type,
            quantity: req.body.quantity,
            price: req.body.price,
        };

        const product = await Product.create(newProduct);
        return res.status(201).send(product);
    } catch (error) {
        console.error(error);
        response.status(500).send({ message: error.message });
    }
};
