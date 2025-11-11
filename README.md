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
To start the DB run:

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
Note that since the panel is running on the container
when connecting to DB through it 
you'll have to specify the standard Postgres port `5432`.

To stop the DB run:

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

To start the server at the `URL` run:

```console
go run cmd/dreampos/main.go
```

