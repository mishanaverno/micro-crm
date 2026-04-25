import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeormConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USER || 'crm_user',
  password: process.env.DATABASE_PASSWORD || 'crm_password',
  database: process.env.DATABASE_NAME || 'crm_db',
  entities: [__dirname + '/../**/*.entity.js'],
  synchronize: false,
  logging: process.env.NODE_ENV !== 'production',
};
