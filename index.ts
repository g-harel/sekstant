const express = require("express");
const app = express();
const graphqlHTTP = require("express-graphql");
const graphQLSchema = require("swagger-to-graphql");

const proxyUrl = "http://petstore.swagger.io/v2";
const pathToSwaggerSchema = "./swagger.json";
const customHeaders = {
  // Authorization: 'Basic YWRkOmJhc2ljQXV0aA=='
};

graphQLSchema(pathToSwaggerSchema, proxyUrl, customHeaders)
  .then((schema: any) => {
    app.use(
      "/graphql",
      graphqlHTTP(() => {
        return {
          schema,
          graphiql: true
        };
      })
    );

    app.listen(3009, "localhost", () => {
      console.info("http://localhost:3009/graphql");
    });
  })
  .catch((e: any) => {
    console.log(e);
  });
