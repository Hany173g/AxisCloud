import type { Request, Response, NextFunction } from 'express';









export default function forceHttpsMiddleware(req: Request, res: Response, next: NextFunction) {
    if (!req.secure) {
        return res.redirect('https://' + req.headers.host + req.url);
    }
    next();
}
