import { Request, Response } from 'express';
import * as admin from 'firebase-admin';

import { Injectable, NestMiddleware } from '@nestjs/common';
import fireApp from '../firestore/firbaseConfig';

@Injectable()
export class PreAuthMiddleware implements NestMiddleware {
  readonly fireAppAuth: admin.auth.Auth;
  constructor() {
    this.fireAppAuth = fireApp.auth();
  }

  use(req: Request, res: Response, next: () => void) {
    const token = req.headers.authorization;
    if (token != null && token != '') {
      this.fireAppAuth
        .verifyIdToken(token.replace('Bearer ', ''))
        .then(async (decodedToken) => {
          req['user'] = {
            email: decodedToken.email,
            id: decodedToken.user_id,
          };
          next();
        })
        .catch(() => {
          PreAuthMiddleware.accessDenied(req.url, res);
        });
    } else {
      PreAuthMiddleware.accessDenied(req.url, res);
    }
  }

  private static accessDenied(url: string, res: Response) {
    res.status(403).json({
      statusCode: 403,
      timestamp: new Date().toISOString(),
      path: url,
      message: 'access denied',
    });
  }
}
