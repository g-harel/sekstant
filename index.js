const fs = require("fs");

const {createGraphQlSchema} = require("oasgraph");
const express = require("express");
const got = require("got");
const graphqlHTTP = require("express-graphql");
const syswidecas = require("syswide-cas");

const port = process.env.PORT || 11456;
const graphiql = process.env.GRAPHIQL === "true";

const APIServerHost = process.env.KUBERNETES_SERVICE_HOST;
const APIServerPort = process.env.KUBERNETES_SERVICE_PORT;
const APIServerCert = process.env.CERTIFICATE_PATH || "/var/run/secrets/kubernetes.io/serviceaccount/ca.crt"
const APIServerToken = process.env.TOKEN_PATH || "/var/run/secrets/kubernetes.io/serviceaccount/token";

const token = fs.readFileSync(APIServerToken);

syswidecas.addCAs(APIServerCert);

const main = async () => {
    const oas = await got({
        hostname: APIServerHost,
        port: APIServerPort,
        path: "/swagger.json",
        timeout: 10 * 1e3,
        json: true,
    }).then((res) => res.body);

    const {schema} = await createGraphQlSchema(oas, {
        baseUrl: `https://${APIServerHost}:${APIServerPort}`,
        viewer: false,
        headers: {Authentication: `Bearer ${token}`},
    });

    const app = express();
    app.use("/graphql", graphqlHTTP({schema, graphiql}));
    app.listen(port);
};

main().catch((err) => {
    console.error(err.toString());
    process.exit(1);
});
