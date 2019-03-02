const fs = require("fs");

const {createGraphQlSchema} = require("oasgraph");
const express = require("express");
const got = require("got");
const graphqlHTTP = require("express-graphql");
const syswidecas = require("syswide-cas");

const port = process.env.PORT || 11456;
const path = process.env.PATHNAME || "/graphql";
const graphiql = process.env.GRAPHIQL === "enabled";

const serverURL = process.env.API_SERVER_URL || "https://kubernetes.default.svc";
const serverCert = process.env.CERTIFICATE_PATH || "/var/run/secrets/kubernetes.io/serviceaccount/ca.crt"
const serverToken = process.env.TOKEN_PATH || "/var/run/secrets/kubernetes.io/serviceaccount/token";

let token;
try {
    token = fs.readFileSync(serverToken);
} catch (e) {
    console.error("Missing API token:", e.toString());
    process.exit(1);
}

syswidecas.addCAs(serverCert);

const main = async () => {
    const oas = await got({
        url: serverURL,
        path: "/swagger.json",
        timeout: 10 * 1e3,
        json: true,
    }).then((res) => res.body);

    const {schema} = await createGraphQlSchema(oas, {
        baseUrl: serverURL,
        viewer: false,
        headers: {Authorization: `Bearer ${token}`},
    });

    const app = express();
    app.use(path, graphqlHTTP({schema, graphiql}));
    app.listen(port);
};

main().catch((err) => {
    console.error(err.toString());
    process.exit(1);
});
