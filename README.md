# jobify

A full stack JavaScript solo project that helps users keep track of job search progress.
As a soon-to-be bootcamp graduate, I will need a tool to facilitate my job hunt. What better idea for a final project than to create a solution to solve a real world problem?

## Technologies Used
- React.js
- React Bootstrap
- Webpack
- Node.js
- PostgreSQL
- HTML5
- CSS3
- Heroku

## Live Demo
Try the application live at [https://another-jobify-app.herokuapp.com/]

## Features
- Users can create an account.
- Users can log in to an existing account.
- Users can create new job cards.
- Users can view saved job cards.
- Users can edit saved job cards.
- Users can delete saved job cards.

## Preview
![Kapture 2022-06-17 at 22 36 31](https://user-images.githubusercontent.com/96906988/174424500-e4b527c6-fe0c-487e-86bf-6b7ff922108c.gif)
![Kapture 2022-06-17 at 22 40 11](https://user-images.githubusercontent.com/96906988/174424583-38ab5eac-4bae-4971-854f-2a1e9d55af02.gif)


## Future Development
- Users can toggle list view.
- Users can toggle big job card view to display more information.
- Users can saved additional input fields.
- Users can sort.

## Instructions
1. Clone the repository

  ```shell
  git clone git@github.com:theDanielYeh/jobify.git
  cd jobify
  ```

2. Install all dependencies with NPM

  ```shell
  npm install
  ```

3. Create a copy of the .env.example file

  ```shell
  cp .env.example .env
  ```

4. In the `.env` update `DATABASE_URL` string of `changeMe` to `jobify`

5. Start PostgreSQL

  ```shell
  sudo service postgresql start
  ```

6. Create a new database

  ```shell
  createdb jobify
  ```

7. Import database to PostgreSQL

  ```shell
  npm run db:import
  ```

8. Start GUI for database

  ```shell
  pgweb --db=jobify
  ```

9. Start development environment

  ```shell
  npm run dev
  ```
