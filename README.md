# LifeWasADream
3rd year Software Engineer group project 

## Backend


### Starting the Database

PostgreSQL database should be running when server is started.
It doesn't matter what method is used to start the DB,
however you **need** to create an `.env` file in the root directory
and specify following environment variables:

```
DB_HOSTNAME=...
DB_PORT=...
DB_NAME=...
DB_USER=...
DB_PASS=...
```

#### Running DB locally using Docker containers

Simple way to run DB locally is provided using Docker containers.

**To start the DB:**

```console
docker compose up -d
```

**Note:** To run DB using Docker containers 
you **still need** to specify DB environment variables from before.

Docker containers, besides the Postgres DB, will also start pgAdmin.
If you want to use it make sure you set the following environment variables:

```
PGADMIN_PORT=...
PGADMIN_EMAIL=...
PGADMIN_PASS=...
```

You will be able to access pgAdmin panel through the browser at `localhost`
with the specified DB and pgAdmin variables.
Note that since the panel is running on the container,
when connecting to the DB through it,
you'll have to specify the standard Postgres port (`5432`).

**To stop the DB:**

```console
docker compose down -v
```

#### Creating DB objects and filling in dummy data

Execute `postgres/init.sql` to generate DB with some sample data.


### Starting the server

Before starting the server 
you need to specify `URL` environment variable in `.env` file
in the root directory of the repository
(if it's not there create it).

**To start the server at the `URL`:**

```console
go run cmd/dreampos/main.go
```

#### Using the server

Following routes are implemented:
 - `/businesses/<business_id>` 
    - `GET` request;
    - Returns `Business` with ID equal to `<business_id>`;
 - `/businesses/list?pageNumber=<page_number>&pageSize=<page_size>`
    - `GET` request;
    - Returns a page of `Business` objects according to the parameters;
    - Defaults: `pageNumber=0`, `pageSize=10`;
 - `/businesses/create`
    - `PUT` request;
    - Adds specified `Business` to DB;
    - Request body consists solely of a single `Business` (see below);

Following is an example of a `Business` object:
```json
{
    "id": 5,
    "name": "Zava",
    "description": "Aenean lectus. Pellentesque eget nunc. Donec quis orci eget orci vehicula condimentum.",
    "type": "APPOINTMENT_BASED",
    "email": "lcotter4@studiopress.com",
    "phone": "530-368-8393",
    "created_at": "2010-10-27T16:46:23Z"
}
```
## Frontend

Make sure to have this variable in `.env` file:
```
VITE_PORT=...
```

### Starting the frontend
Go to frontend directory and run these commands:
```
npm i
npm run dev
```

The app can be viewed through a browser at http://localhost:[VITE_PORT]. For example: http://localhost:8082.
