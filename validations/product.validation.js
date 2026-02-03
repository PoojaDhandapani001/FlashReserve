const Joi = require('joi');

exports.createProductSchema = Joi.object({
  name: Joi.string().min(2).required(),
  price: Joi.number().min(0).required(),
  stockQuantity: Joi.number().integer().min(1).required()
});
