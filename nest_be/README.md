## Base nest app

## Setting up environments
1. Copy `.env.registry` into `.env`
    ```
    cp .env.registry .env
    ```

2. Prepare docker envs
    ```
    cp .env.defaults docker/env/.env.backend
    ```

3. Add MongoDB variables to `docker/env/.env.backend`
  ```
  MONGO_URI=mongodb://mongo:27017
  MONGO_DB_NAME=pokemon
  ```

4. Start services
  ```
  cd docker && docker compose up -d
  ```

## Testing
1. To run all test suites: `npm run docker:test`,
2. To run single test suite: `docker exec -it nest_be npm run test -- test/modules/<file_name>.spec.ts`