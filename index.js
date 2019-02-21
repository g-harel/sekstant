const path = require("path");
const os = require("os");

const {createGraphQlSchema} = require("oasgraph");
const express = require("express");
const got = require("got");
const graphqlHTTP = require("express-graphql");
const syswidecas = require('syswide-cas');

const APIServerHost = "192.168.99.100";
const APIServerPort = 8443;

syswidecas.addCAs(path.join(os.homedir(), ".minikube", "ca.crt"))

const main = async () => {
    const oas = await got({
        hostname: APIServerHost,
        port: APIServerPort,
        path: "/swagger.json",
        timeout: 3000,
        json: true,
    }).then((res) => res.body);

    const {schema} = await createGraphQlSchema(oas, {
        baseUrl: `https://${APIServerHost}:${APIServerPort}`
    });

    const app = express();
    app.use("/graphql", graphqlHTTP({schema, graphiql: true}));
    app.listen(3000, () => console.log("http://localhost:3000/graphql"));
};

main().catch((err) => {
    console.error(err.toString());
    process.exit(1);
});
