## CS_326_Project

Web Development Server where our personal project lives

| Name            | GitHub Username |
| --------------- | --------------- |
| William Duby    | DubyD           |
| Edmund Chang    | Edmundchang7    |
| Ivan Matviichuk | imatvii         |
| Hasanat Ashraf  | Hasanat-Ashraf  |

## Working agreement:

- As a team we decided to communicate through Discord
  in order to have unlimited time on video calls when needed.

- Done for a 'PR' is when we have code that has complete
  syntax and wouldn't prevent our web server from running, but
  isn't necessarily solve the problem in it's entirety.

- Any large disagreements will be discussed with the entirety
  of the group, or the members of the group present if time
  constraints are an issue, and once all arguments are aired
  out we will have a vote between the members present at the
  time of the disagreement.

## Project Overview:

This project is to help with translating code from upper level languages and compiling it into machine code, then decompiling it into C language. We implemented an Ai component to alter the variable names into human language, and to remove some of the guard rails upper level languages deploy which can make for inefficient code, to allow greater access to more to performance that may be out of reach for people who are not systems programmers.

## Getting started for new users:

```bash
  git clone https://github.com/DubyD/CS_326_Project
  cd CS_326_Project
```

Windows through virtual environment:

```bash
  python3 -m venv .venv
  source .venv/bin/activate
```

MacOS installation instructions below.

```bash
    npm install
    bash backend/setup_mac.sh
```

Download MongoDB using powershell with the prompt:

```powershell
    - docker run -d --name mongo -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=dev -e MONGO_INITDB_ROOT_PASSWORD=devpassword mongo
    - docker start mongo
    - docker network connect gantry mongo
```

- Make your own secrets file, .env is never committed so a fresh clone has none:
  - MacOS/Linux: cp .env.example .env
  - Windows: copy .env.example .env
  - Then edit .env and put in your own values. MONGO_URI is the database url and
    SESSION_SECRET is the string used to sign the login cookie. server.js reads both
    from the environment and quits with a message if SESSION_SECRET is missing.

## Starting the Program:

- npm start
- Our server is Listening on port 3000.
- Open http://localhost:3000 in the browser. The converter page and its history are the
  feature and they are behind the login, so you get sent to /login. Click Sign up, make an
  account, and you are logged in and looking at the converter with your history underneath.
- The frontend the team already wrote is untouched. The only pages added for the login work
  are views/login.ejs and views/signup.ejs.
- The converter page has no logout button in it, so logging out is typing
  http://localhost:3000/logout in the address bar. That ends the session and sends you to
  /login, and going back to http://localhost:3000 sends you to /login again.
- Same thing with curl if you prefer, a cookie jar keeps you logged in between calls:
  - curl -s -c jar -d "username=you&password=secret123" http://localhost:3000/signup
  - curl -s -b jar http://localhost:3000/me which answers your username and role
  - curl -s -b jar -X POST http://localhost:3000/logout, then /me is a 401 again
- npm run test:auth (bash scripts/test-auth.sh) checks all of the login and permission rules below with curl
  while the server is running, and it makes its own alice / bob / admin accounts in the
  database as it goes.
- To make an admin account run: npm run seed:admin
  - with no arguments that makes username admin with password admin123, change the
    password in the .env or pass your own: npm run seed:admin -- admin2 myPassword
  - the same thing by hand in the database:
    db.users.updateOne({username: "admin"}, {$set: {role: "admin"}})

## Log in and roles:

- The pages are GET /login and GET /signup, the routes are POST /signup, POST /login and
  POST /logout with GET /logout too, and GET /me answers your username and role. The
  converter page and everything under /conversions are the only feature and all of them
  need a logged in user.
- Passwords are never stored in the clear. Signup runs bcrypt.hash and login runs
  bcrypt.compare, and the user document only has passwordHash, there is no plain
  password field on it.
- Login sets a signed session cookie (express-session, cookie name sid, signed with
  SESSION_SECRET). If you edit the cookie by hand the signature no longer matches so
  you are logged out, it will not let you pretend to be somebody else.
- The User schema has a role field with two values, member and admin, and member is
  the default. Signup never reads role from the request, so posting role=admin with the
  signup body still gives you an ordinary member. Admins are made with npm run seed:admin
  or by updating the document in the database, as said above.

## Who may change what:

- Logged out people get nothing. The pages send you to /login, and /me and every route
  under /conversions answer 401 with "log in first." and nothing happens. That is
  requireLogin and requireApi from middleware/auth.js put on the routes in
  routes/pageRoutes.js, routes/authRoutes.js and routes/conversionRoutes.js, so it is
  route level middleware and not something inside a handler.
- The owner of a new conversion is set by the server from the logged in session, it is
  not a form field and putting owner in the request body does nothing.
- Before any edit or delete, conversionService loads the record and calls isOwnerOrAdmin
  on it. So the check is in the service and not only in a middleware.
- Logged in as somebody else, patching or deleting your record answers 403
  "not your conversion." and the record is left exactly as it was.
- Logged in as an admin the same patch or delete does succeed, and an admin's history
  list shows everybody's conversions while a member only sees their own.

## Errors you may run into:

Situation What happens
Not logged in, on a page Sent to /login
Not logged in, calling the api "log in first." (401)
Signed up but wrong password "wrong username or password." (401)
Name already used "that username is taken." (409)
Signup or login missing a field "username and password are both required." (400)
Password shorter than 6 "password must be at least 6 characters." (400)
Editing someone's else conversion "not your conversion." (403)
SESSION_SECRET not set "SESSION_SECRET is not set. Copy .env.example to .env first."
Empty code box "Please enter code to convert." (400)
Unsupported language "Unsupported language …" (400)
Code that doesn't compile The gcc error message (422)
Ghidra not installed "Ghidra not found…" (500). Use the dev container or run a setup script.

## Jest tests:

Set up the testing environment with:

```bash
 npm i -D jest @jest/globals supertest
```

then running the tests with:

```bash
 npm test
```

## Design Decisions:

William Duby:
-Sprint 2: I separated the controller, routes, services, and server. Having considered keeping these methods all in the server since it was already written in one file, however the readability was already difficult and would continue to get worse if left in the state that it was created. This version is superior because when we expand the functionality of the app we will have easier scalability and adaptability for future app functions. Without this change it would be challenging to ensure any updates or new functionality will give the expected results without combing through and matching up all possibilities. Readability is a major upgrade for any code.

-Sprint 3: I updated the front end with tailwind which makes the whole experience look nice, while also adding a space with the servers history below the converted code space. This is aesthetically better than the previous version. I considered making a new tab with the code history and still may do that in sprint 4. Thank you Ivan for spear heading our project and keep it moving forward.

- Sprint 4: I reformatted the README.md for new users setting up a clone of our server. And I wrote 6 jest tests that helped test the server:
  - asyncHandler: errors get passed to next, and success doesn’t call it.
  - pageController: the right views render with the right data.
    conversionController: it returns 400 for empty code, 201 on success, and 404 for missing records; PATCH sends only the fields provided; DELETE returns 204; errors go to next.
  - conversionService: unsupported languages are rejected; it writes the temp file, calls converter.py with the right paths, saves the result, and always cleans up; stderr, timeout and empty output each raise the right error.
  - conversionRepository: each function makes the right Mongoose call (sort order, invalid-ID check, update options).
  - conversionRoutes: the HTTP methods and paths reach the right handlers and return the right status codes, including 500 on errors.

Ivan Matviichuk:
-Sprint 2: One of the biggest changes I made was making everything to run from a local folder, before I made shell/bat files to install dependencies in the root, but now it installs evertyhing in local tools directory, so everyones files are the same and can be ran identically. I considered installing the dependencies in the root, but then it would work on my computer and break on someone elses, so I wanted to make sure everyone running this have the same tools installed in the same location such as ghidra and JDK
-Sprint 3: For the MongoDB I made the repository be the only file that talks to Mongoose. repositories/conversionRepository.js, and routes, controllers/, and services only ever import the repository and none of them import mongoose. The connection itself is in db.js, which server.js imports and calls before app.listen. I could put the schema and the mongoose.connect() call into server.js, but didn't i would need to change to conversionController.js and conversionService.js and it would break the isolation.
Sprint 4: I made the ownership check run in the service. conversionService loads the conversion, calls isOwnerOrAdmin, then updates or deletes. The alternative was a route middleware. I kept it in the service because the check needs the record from mongo. IF implemented in middleware the record would read once to check permission and one more time in the controller to write it. The alternative would cost extra files.

Edmund Chang:
-Sprint 2: One decision I made was to use an async error handler instead of catching failures and sending a 500 status code directly. I decided to wrap the async handler in conversionController.js with asyncHandler. In addition, I decided to store the async handler function in a utilities folder, that way different files can all use the same async handler function. Another alternative I considered was to have the async handler show up in multiple places, but this is code duplication and bad practice, especially if we want to make a change to the async handler function. The shipped version is better because it makes errors observable, it doesn't depend on specific status codes, and it prevents problems related to Express's rejected promises, which aren't thrown synchronously.
-Sprint 3: One decision I made was to convert the form in index.ejs to HTMX, by adding an HTMX script to <head> and modifying the form element to have hx-\* attributes. One alternative is to change only the #result or #errorMessage part, and not the entire form to be HTMX. The version I shipped is better now because now we can replace some of the functionality of app.js with HTMX in index.ejs, and we don't need the original handler's javascript to validate the interaction.
-Sprint 4: One decision I made was for the health check (/health) to only check database connectivity and report a binary enum status code (either up or degraded), instead of returning a generic 200 status code we return a specific 503 HTTP status code when the database isn't up. One credible alternative would be to always return a 200 status code and include more details in the response body, such as information about whether the databse is up or down. However, the shipped version is better because without a database we can't do that much, so we define health as the database up and runnING. What the alternative (always return a 200 status cod eeven if the catabase is down) would mean developers need to manually read the response body to see if the database is running or not, and we would still report good health even if our MongoDB isn't running properly.
