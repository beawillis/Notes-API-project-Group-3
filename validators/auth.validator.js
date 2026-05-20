const Joi = require("joi"); // Import Joi for data validation

// Validation function for user registration
const registerValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid("User", "Editor", "Admin").optional(),
  });

  return schema.validate(data);
};
// Validation function for user login
const loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });

  return schema.validate(data);
};

module.exports = {
  registerValidation,
  loginValidation,
};