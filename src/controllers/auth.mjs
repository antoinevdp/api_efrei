import jwt from 'jsonwebtoken';

const SECRET_KEY = 'efrei';

const Auth = class Auth {
  constructor(app) {
    this.app = app;
    this.run();
  }

  login() {
    // eslint-disable-next-line consistent-return
    this.app.post('/auth', (req, res) => {
      try {
        const { name, role } = req.body;

        if (!name || !role) {
          return res.status(400).json({ error: 'Missing name or role' });
        }

        // Génération du token
        const token = jwt.sign({ name, role }, SECRET_KEY, { expiresIn: '1h' });

        res.status(200).json({ token });
      } catch (err) {
        console.error(`[ERROR] jwt -> ${err}`);
        res.status(500).json({
          code: 500,
          message: 'Internal Server Error'
        });
      }
    });
  }

  run() {
    this.login();
  }
};

export default Auth;
