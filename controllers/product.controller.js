const Product = require('../models/Product');
const { createProductSchema } = require('../validations/product.validation');

exports.createProduct = async (req, res) => {
  const { error } = createProductSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { name, stockQuantity, price } = req.body;

  const product = await Product.create({
    name,
    stockQuantity,
    price
  });

  res.status(201).json(product);
};

exports.listProducts = async (req, res) => {
  const products = await Product.find();
  res.json(products);
};
