// const Joi = require('joi'); //npm i joi
const BaseJoi = require('joi'); //npm i joi
const sanitizeHtml = require('sanitize-html'); //npm i sanitize-html

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {//define the name of the function
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if(clean !== value) return helpers.error('string.excapeHTML', {value})
                return clean;
            }
        }
    }
});// extension that check for potencials malisious scripts

const Joi = BaseJoi.extend(extension) //add the extension to base Joi

module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required().escapeHTML(),//add the extension to every instanse that let the user intro a string
        price: Joi.number().required().min(0),
        // image: Joi.string().required(),
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML(),
    }).required(),
    deleteImages: Joi.array()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required().escapeHTML()
    }).required()
})