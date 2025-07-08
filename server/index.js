require('dotenv/config');
const path = require('path');
const express = require('express');
const errorMiddleware = require('./error-middleware');
const { body, validationResult, param } = require('express-validator');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  transports: [new winston.transports.Console()]
});

const app = express();
const publicPath = path.join(__dirname, 'public');

const pg = require('pg');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const ClientError = require('./client-error');

const db = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: process.env.NODE_ENV === 'production'
  }
});

app.use(express.static(publicPath));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/auth/', authLimiter);

if (process.env.NODE_ENV === 'development') {
  app.use(require('./dev-middleware')(publicPath));
}

const jsonMiddleware = express.json();
app.use(jsonMiddleware);
app.use(passport.initialize());
const authorizationMiddleware = require('./authorization-middleware');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, (accessToken, refreshToken, profile, done) => {
  const email = profile.emails && profile.emails[0].value;
  if (!email) return done(new Error('Email required'));
  const findSql = 'select * from "users" where "email" = $1';
  db.query(findSql, [email])
    .then(result => {
      if (result.rows.length) {
        return result.rows[0];
      }
      const insertSql = `
        insert into "users" ("firstName","lastName","email","password")
        values ($1,$2,$3,'')
        returning "userId","email","firstName"`;
      const params = [profile.name.givenName || '', profile.name.familyName || '', email];
      return db.query(insertSql, params).then(r => r.rows[0]);
    })
    .then(user => done(null, user))
    .catch(err => done(err));
}));

passport.use(new TwitterStrategy({
  consumerKey: process.env.TWITTER_CONSUMER_KEY,
  consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
  callbackURL: process.env.TWITTER_CALLBACK_URL,
  includeEmail: true
}, (token, tokenSecret, profile, done) => {
  const email = profile.emails && profile.emails[0].value;
  if (!email) return done(new Error('Email required'));
  const findSql = 'select * from "users" where "email" = $1';
  db.query(findSql, [email])
    .then(result => {
      if (result.rows.length) {
        return result.rows[0];
      }
      const insertSql = `
        insert into "users" ("firstName","lastName","email","password")
        values ($1,$2,$3,'')
        returning "userId","email","firstName"`;
      const params = [profile.displayName || '', '', email];
      return db.query(insertSql, params).then(r => r.rows[0]);
    })
    .then(user => done(null, user))
    .catch(err => done(err));
}));

app.post('/api/auth/sign-up',
  [
    body('firstName').trim().notEmpty(),
    body('lastName').trim().notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 8 })
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ClientError(400, 'invalid sign up input');
    }
    const { firstName, lastName, email, password } = req.body;

    const sql = `
    select *
      from "users"
      where "email" = $1
  `;
    const params = [email];
    db.query(sql, params)
      .then(result => {
        const [user] = result.rows;
        if (user) {
        // future dev: throw new ClientError(400, 'email already in use');
          res.status(400).json('');
        } else {
          const verifyToken = require('crypto').randomBytes(20).toString('hex');
          argon2
            .hash(password)
            .then(hashedPassword => {
              const sqlTwo = `
              insert into "users" ("firstName", "lastName", "email", "password", "emailVerificationToken")
              values ($1, $2, $3, $4, $5)
              returning "userId", "email", "createdAt", "firstName"
            `;
              const paramsTwo = [firstName, lastName, email, hashedPassword, verifyToken];
              return db.query(sqlTwo, paramsTwo).then(r => {
                logger.info(`verification token for ${email}: ${verifyToken}`);
                return r;
              });
            })
            .then(result => {
              const { userId, email, firstName } = result.rows[0];
              const payload = { userId, email, firstName };
              const token = jwt.sign(payload, process.env.TOKEN_SECRET, {
                expiresIn: process.env.JWT_EXPIRES_IN
              });
              res.status(201).json({ token, user: payload });
            })
            .catch(err => next(err));
        }
      })
      .catch(err => next(err));
  });

app.post('/api/auth/sign-in',
  [body('email').isEmail(), body('password').notEmpty()],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ClientError(401, 'invalid login');
    }
    const { email, password } = req.body;
    const sql = `
    select *
      from "users"
      where "email" = $1
  `;
    const params = [email];
    db.query(sql, params)
      .then(result => {
        const [user] = result.rows;
        if (!user) {
          throw new ClientError(401, 'invalid login');
        }
        const { userId, firstName } = user;
        return argon2
          .verify(user.password, password)
          .then(isMatching => {
            if (!isMatching) {
              throw new ClientError(401, 'invalid login');
            }
            const payload = { userId, firstName };
            const token = jwt.sign(payload, process.env.TOKEN_SECRET, {
              expiresIn: process.env.JWT_EXPIRES_IN
            });
            res.json({ token, user: payload });
          });
      })
      .catch(err => next(err));
  });

app.get('/api/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/api/auth/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const { userId, email, firstName } = req.user;
    const payload = { userId, email, firstName };
    const token = jwt.sign(payload, process.env.TOKEN_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });
    res.json({ token, user: payload });
  });

app.get('/api/auth/twitter', passport.authenticate('twitter'));
app.get('/api/auth/twitter/callback',
  passport.authenticate('twitter', { session: false }),
  (req, res) => {
    const { userId, email, firstName } = req.user;
    const payload = { userId, email, firstName };
    const token = jwt.sign(payload, process.env.TOKEN_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });
    res.json({ token, user: payload });
  });

app.post('/api/auth/request-password-reset', [body('email').isEmail()], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ClientError(400, 'invalid email');
  }
  const { email } = req.body;
  const token = require('crypto').randomBytes(20).toString('hex');
  const expire = new Date(Date.now() + 3600000);
  const sql = 'update "users" set "passwordResetToken"=$1, "passwordResetExpires"=$2 where "email"=$3 returning *';
  const params = [token, expire, email];
  db.query(sql, params)
    .then(result => {
      if (!result.rows.length) {
        throw new ClientError(404, 'email not found');
      }
      logger.info(`password reset token for ${email}: ${token}`);
      res.sendStatus(204);
    })
    .catch(err => next(err));
});

app.post('/api/auth/reset-password', [body('token').notEmpty(), body('password').isLength({ min: 8 })], (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ClientError(400, 'invalid input');
  }
  const { token, password } = req.body;
  const sql = 'select * from "users" where "passwordResetToken"=$1 and "passwordResetExpires" > now()';
  db.query(sql, [token])
    .then(result => {
      const [user] = result.rows;
      if (!user) {
        throw new ClientError(400, 'invalid token');
      }
      return argon2.hash(password).then(hash => {
        const updateSql = 'update "users" set "password"=$1, "passwordResetToken"=null, "passwordResetExpires"=null where "userId"=$2';
        return db.query(updateSql, [hash, user.userId]).then(() => res.sendStatus(204));
      });
    })
    .catch(err => next(err));
});

app.get('/api/auth/verify-email/:token', (req, res, next) => {
  const { token } = req.params;
  const sql = 'update "users" set "emailVerified"=true, "emailVerificationToken"=null where "emailVerificationToken"=$1 returning *';
  db.query(sql, [token])
    .then(result => {
      if (!result.rows.length) {
        throw new ClientError(400, 'invalid token');
      }
      res.sendStatus(204);
    })
    .catch(err => next(err));
});

app.use(authorizationMiddleware);

app.post('/api/auth/new-card',
  [
    body('newCompany').trim().notEmpty(),
    body('newPosition').trim().notEmpty(),
    body('newDate').notEmpty(),
    body('newStatus').trim().notEmpty()
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ClientError(400, 'invalid job data');
    }
    const { newCompany, newPosition, newDate, newStatus, newNotes } = req.body;
    const sql = `
    insert into "jobList" ("userId", "company", "position", "dateApplied", "status", "notes")
    values ($1, $2, $3, $4, $5, $6)
    returning *
  `;
    const params = [req.user.userId, newCompany, newPosition, newDate, newStatus, newNotes];
    db.query(sql, params)
      .then(result => {
        const [jobId] = result.rows;
        if (!jobId) {
          throw new ClientError(401, 'jobId not returned, job not saved');
        }
        res.json(result);
      })
      .catch(err => next(err));
  });

app.get('/api/auth/saved-card/:searchJobId',
  [param('searchJobId').isInt()],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ClientError(400, 'invalid jobId');
    }
    const searchJobId = Number(req.params.searchJobId);
    const sql = `
    select *
      from "jobList"
     where "jobId" = $1
  `;
    const params = [searchJobId];
    db.query(sql, params)
      .then(result => {
        if (!result.rows) {
          throw new ClientError(401, 'jobId not returned, job not saved');
        }
        const payload = result.rows[0];
        res.json({ payload });
      })
      .catch(err => next(err));
  });

app.post('/api/auth/edit-card',
  [
    body('savedJobId').isInt(),
    body('newCompany').trim().notEmpty(),
    body('newPosition').trim().notEmpty(),
    body('newDate').notEmpty(),
    body('newStatus').trim().notEmpty()
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ClientError(400, 'invalid job data');
    }
    const { savedJobId, newCompany, newPosition, newDate, newStatus, newNotes } = req.body;
    const sql = `
    update "jobList"
    set "company" = $2,
      "position" = $3,
      "dateApplied" = $4,
      "status" = $5,
      "notes" = $6
    where "jobId" = $1
  `;
    const params = [savedJobId, newCompany, newPosition, newDate, newStatus, newNotes];
    db.query(sql, params)
      .then(result => {
        if (!result.rows) {
          throw new ClientError(401, 'jobId not returned, job not saved');
        }
        res.json(result);
      })
      .catch(err => next(err));
  });

app.post('/api/auth/handleCardEvents', (req, res, next) => {
  const { userId, firstName } = req.user;
  const sql = `
      select *
      from "jobList"
      join "users" using ("userId")
      where "userId" = $1
      order by "dateApplied" desc, "jobId" desc
  `;
  const params = [userId];
  db.query(sql, params)
    .then(result => {
      const [user] = result.rows;
      if (!user) {
        const payload = { userId, firstName };
        res.json({ user: payload });
      } else {
        const { firstName } = user;
        const dataArray = result.rows.slice().map(item => {
          delete item.password;
          return item;
        });
        const payload = { userId, firstName, dataArray };
        res.json({ user: payload });
      }
    })
    .catch(err => next(err));
});

app.delete('/api/auth/delete-card/:deleteJobId',
  [param('deleteJobId').isInt()],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ClientError(400, 'invalid jobId');
    }
    const deleteJobId = Number(req.params.deleteJobId);
    const sql = `
    delete from "jobList"
     where "jobId" = $1
     returning *
  `;
    const params = [deleteJobId];
    db.query(sql, params)
      .then(result => {
        if (!result.rows) {
          throw new ClientError(404, 'cannot find jobId to delete');
        }
        res.sendStatus(204);
      })
      .catch(err => next(err));
  });

// below code provided

app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
  logger.info(`app listening on port ${process.env.PORT}`);
});
