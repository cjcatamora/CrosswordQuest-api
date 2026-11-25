const { body, param } = require('express-validator');

const idParam = param('id')
  .isInt({ min: 1 }).withMessage('id must be a positive whole number')
  .toInt();

function questionSetName() {
  return body('name')
    .exists().withMessage('name is required')
    .bail()
    .isString().withMessage('name must be text')
    .bail()
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage('name must be 1 to 100 characters long');
}

const createRules = [questionSetName()];
const updateRules = [idParam, questionSetName()];

module.exports = { idParam, createRules, updateRules };
