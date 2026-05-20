const Joi = require("joi");

// Validation function for note creation and update
const noteValidation = (data) => {
  const schema = Joi.object({
    title: Joi.string().required(),
    content: Joi.string().required(),
    category: Joi.string(),
    tags: Joi.array().items(Joi.string()),
  });

  return schema.validate(data);
};

module.exports = noteValidation;