const fs = require("fs");
const path = require("path");
const os = require("os");

const express = require("express");
const graphqlHTTP = require("express-graphql");
const got = require("got");
const {createGraphQlSchema} = require("oasgraph");

const APIServerHost = "192.168.99.100";
const APIServerPort = 8443;
const certPath = path.join(os.homedir(), ".minikube");

const main = async () => {
    const oas = await got({
        hostname: APIServerHost,
        port: APIServerPort,
        path: "/swagger.json",

        ca: fs.readFileSync(path.join(certPath, "ca.crt")),
        cert: fs.readFileSync(path.join(certPath, "client.crt")),
        key: fs.readFileSync(path.join(certPath, "client.key")),

        timeout: 1000,
        json: true,
    }).then((res) => res.body);

    const {schema} = await createGraphQlSchema(oas);

    const app = express();
    app.use("/graphql", graphqlHTTP({schema, graphiql: true}));
    app.listen(3000, () => console.log("https://localhost:3000/graphql"));
};

main().catch((err) => {
    console.error(err.toString());
    process.exit(1);
});
