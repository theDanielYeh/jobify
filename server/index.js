require('dotenv/config');
const path = require('path');
const express = require('express');
const errorMiddleware = require('./error-middleware');

const app = express();
const publicPath = path.join(__dirname, 'public');

const pg = require('pg');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const ClientError = require('./client-error');

const db = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

if (process.env.NODE_ENV === 'development') {
  app.use(require('./dev-middleware')(publicPath));
}

app.use(express.static(publicPath));
const jsonMiddleware = express.json();
app.use(jsonMiddleware);
const authorizationMiddleware = require('./authorization-middleware');

app.post('/api/auth/sign-up', (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName || !email || !password) {
    throw new ClientError(400, 'all fields are required');
  }
  argon2
    .hash(password)
    .then(hashedPassword => {
      const sql = `
        insert into "users" ("firstName", "lastName", "email", "password")
        values ($1, $2, $3, $4)
        returning "userId", "email", "createdAt", "firstName"
      `;
      const params = [firstName, lastName, email, hashedPassword];
      return db.query(sql, params);
    })
    .then(result => {
      console.log('index.js Line 41: ', result.rows);
      // const [user] = result.rows;
      // res.status(201).json(user);

      const { userId, email, firstName } = result.rows[0];
      const payload = { userId, email, firstName };
      const token = jwt.sign(payload, process.env.TOKEN_SECRET);
      res.status(201).json({ token, user: payload });
      console.log('acct created, payload and token created');
    })
    .catch(err => next(err));
});

app.post('/api/auth/sign-in', (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ClientError(401, 'invalid login');
  }
  const sql = `
    select *
      from "jobList"
      join "users" using ("userId")
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
        // first password arg is hashed in db
        .then(isMatching => {
          if (!isMatching) {
            throw new ClientError(401, 'invalid login');
          }
          const dataArray = result.rows.slice().map(item => {
            delete item.password;
            return item;
          });
          const payload = { userId, firstName, dataArray };
          const token = jwt.sign(payload, process.env.TOKEN_SECRET);
          res.json({ token, user: payload });
          console.log('match found, payload and token created');
        });
    })
    .catch(err => next(err));
});

app.use(authorizationMiddleware);

app.post('/api/auth/new-card', (req, res, next) => {
  console.log(req.user.userId);
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
    })
    .catch(err => next(err));
});

app.get('/api/auth/saved-card', (req, res, next) => {
  console.log(req.user.userId);
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
    })
    .catch(err => next(err));
});

// below code provided

app.use(errorMiddleware);

app.listen(process.env.PORT, () => {
  process.stdout.write(`\n\napp listening on port ${process.env.PORT}\n\n`);
});
