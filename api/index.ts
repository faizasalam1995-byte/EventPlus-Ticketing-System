import app, { ensureInitialized } from '../server/index';

export default async function handler(req: any, res: any) {
  await ensureInitialized();

  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }

  return app(req, res);
}
