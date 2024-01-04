import Joi from 'joi';

export const configModuleValidationSchema = Joi.object({
  SERVER_PORT: Joi.number().required().default(3000),
  MYSQL_HOST: Joi.string().required(),
  MYSQL_PORT: Joi.number().required().default(3306),
  MYSQL_USERNAME: Joi.string().required(),
  MYSQL_PASSWORD: Joi.string().required(),
  MYSQL_DATABASE: Joi.string().required(),
  DB_SYNC: Joi.boolean().required().default(true),
  PASSWORD_HASH_ROUND: Joi.number().required().default(10),
  JWT_SECRET: Joi.string().required(),
});
