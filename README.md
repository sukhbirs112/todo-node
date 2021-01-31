# todo-node
Back end server using node/ExpressJS for a todo app that connects to postgresql.

## Background
I wrote this code to be used as a backend web server which exposed an api to interact with a postgresql database.
The server is written in Node.js and uses the Express.js framework.
The server incorporates various packages in order to:
-Use CSRF Tokens
-Allow Websocket connections (Used for development, live-reloading)
-Develop a reverse proxy server (When using linux, I used Apache2. On Windows, I experimented by building my own with Node.js, see proxy.js).
-Use Bcrypt to hash passwords
-Interact with a postgres database
-Create sessions for users.

All packages can be viewed in package.json's dependencies.

## API
The api allows a person, through a web application (see the repo todo-ng), to create a user account, log in (create a session), log out (destroy the session), and perform CRUD on
todo items. Todo items consist of a title (text), the body text (text), and a complete value (true/false).

## Notes
I manually coded all the postgresql for managing the data for the user and todo item models instead of using a node.js ORM. It was tedious but made be appreciate ORMs
and software that generates scaffolds.
