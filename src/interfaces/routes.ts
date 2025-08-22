import { Express } from 'express';
import fs from 'fs';
import path from 'path';

export const registerRoutes = (app: Express) => {
  const routesPath = path.join(__dirname, 'routes');
  fs.readdirSync(routesPath).forEach((file) => {
    if (file.endsWith('.ts') || file.endsWith('.js')) {
      const routeName = file.replace(/\.(ts|js)$/, '');
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const router = require(path.join(routesPath, file)).default;
      app.use(`/${routeName}`, router);
    }
  });
};