import { validationResult } from 'express-validator';
import { ApiResponse } from '../utils/ApiResponse.js';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return ApiResponse.error(res, 'Validation failed', 422, errors.array());
  }
  next();
};