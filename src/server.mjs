// Dependencies
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import https from 'https';
import fs from 'fs';

// Core
import jwt from 'jsonwebtoken';
import config from './config.mjs';
import routes from './controllers/routes.mjs';

const SECRET_KEY = 'efrei';

const Server = class Server {
  constructor() {
    this.app = express();
    this.config = config[process.argv[2]] || config.development;

    this.httpsOptions = {
      key: fs.readFileSync('./ssl/key.pem'),
      cert: fs.readFileSync('./ssl/cert.pem')
    };
  }

  async dbConnect() {
    try {
      const host = this.config.mongodb;

      this.connect = await mongoose.createConnection(host, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });

      const close = () => {
        this.connect.close((error) => {
          if (error) {
            console.error('[ERROR] api dbConnect() close() -> mongodb error', error);
          } else {
            console.log('[CLOSE] api dbConnect() -> mongodb closed');
          }
        });
      };

      this.connect.on('error', (err) => {
        setTimeout(() => {
          console.log('[ERROR] api dbConnect() -> mongodb error');
          this.connect = this.dbConnect(host);
        }, 5000);

        console.error(`[ERROR] api dbConnect() -> ${err}`);
      });

      this.connect.on('disconnected', () => {
        setTimeout(() => {
          console.log('[DISCONNECTED] api dbConnect() -> mongodb disconnected');
          this.connect = this.dbConnect(host);
        }, 5000);
      });

      process.on('SIGINT', () => {
        close();
        console.log('[API END PROCESS] api dbConnect() -> close mongodb connection');
        process.exit(0);
      });
    } catch (err) {
      console.error(`[ERROR] api dbConnect() -> ${err}`);
    }
  }

  middleware() {
    this.app.use(compression());
    const allowedOrigins = ['http://localhost:3000'];
    this.app.use(cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true
    }));
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(bodyParser.json());

    const limiter = rateLimit({
      windowMs: 60 * 60 * 1000, // 1 heure
      max: 100,
      message: {
        code: 429,
        message: 'Too many requests, try again later.'
      }
    });
    this.app.use(limiter);
  }

  routes() {
    // new routes.Users(this.app, this.connect);
    new routes.Auth(this.app);
    new routes.Albums(this.app, this.connect, this.authToken);
    new routes.Photos(this.app, this.connect);

    this.app.use((req, res) => {
      res.status(404).json({
        code: 404,
        message: 'Not Found'
      });
    });
  }

  security() {
    this.app.use(helmet());
    this.app.disable('x-powered-by');
  }

  authToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        code: 401,
        message: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      req.auth = decoded; // Stocke les infos du token pour les routes
      next();
    } catch (err) {
      return res.status(401).json({
        code: 401,
        message: 'Invalid or expired token.'
      });
    }
  };

  async run() {
    try {
      await this.dbConnect();
      this.security();
      this.middleware();
      this.routes();
      https.createServer(this.httpsOptions, this.app)
        .listen(this.config.port, () => {
          console.log(`[HTTPS] Server running on https://localhost:${this.config.port}`);
        });
    } catch (err) {
      console.error(`[ERROR] Server -> ${err}`);
    }
  }
};

export default Server;
