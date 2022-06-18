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

app.use(express.static(publicPath));

if (process.env.NODE_ENV === 'development') {
  app.use(require('./dev-middleware')(publicPath));
}

const jsonMiddleware = express.json();
app.use(jsonMiddleware);
const authorizationMiddleware = require('./authorization-middleware');

app.post('/api/auth/sign-up', (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName || !email || !password) {
    throw new ClientError(400, 'all fields are required');
  }

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
        argon2
          .hash(password)
          .then(hashedPassword => {
            const sqlTwo = `
              insert into "users" ("firstName", "lastName", "email", "password")
              values ($1, $2, $3, $4)
              returning "userId", "email", "createdAt", "firstName"
            `;
            const paramsTwo = [firstName, lastName, email, hashedPassword];
            return db.query(sqlTwo, paramsTwo);
          })
          .then(result => {
            const { userId, email, firstName } = result.rows[0];
            const payload = { userId, email, firstName };
            const token = jwt.sign(payload, process.env.TOKEN_SECRET);
            res.status(201).json({ token, user: payload });
          })
          .catch(err => next(err));
      }
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
          const token = jwt.sign(payload, process.env.TOKEN_SECRET);
          res.json({ token, user: payload });
        });
    })
    .catch(err => next(err));
});

app.use(authorizationMiddleware);

app.post('/api/auth/new-card', (req, res, next) => {
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

app.get('/api/auth/saved-card/:searchJobId', (req, res, next) => {
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

app.post('/api/auth/edit-card', (req, res, next) => {
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

app.delete('/api/auth/delete-card/:deleteJobId', (req, res, next) => {
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
  process.stdout.write(`\n\napp listening on port ${process.env.PORT}\n\n`);
});
