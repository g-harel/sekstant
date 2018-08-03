import https, {RequestOptions} from "https";
import fs from "fs";
import path from "path";
import os from "os";

import {GraphQLSchema} from "graphql";
import express from "express";
import graphqlHTTP from "express-graphql";
import {printSchema} from "graphql";
import graphQLSchema from "swagger-to-graphql";

const APIServerHost = "192.168.99.100";
const APIServerPort = 8443;
const certPath = path.join(os.homedir(), ".minikube");

const tempDir = ".out";
const swaggerSpecPath = path.join(tempDir, "swagger.json");
const gqlSchemaPath = path.join(tempDir, "schema.gql");

const writeSpec = () =>
    new Promise((resolve, reject) => {
        const file = fs.createWriteStream(swaggerSpecPath);

        const options: RequestOptions = {
            hostname: APIServerHost,
            port: APIServerPort,
            path: "/swagger.json",
            ca: fs.readFileSync(path.join(certPath, "ca.crt")),
            cert: fs.readFileSync(path.join(certPath, "client.crt")),
            key: fs.readFileSync(path.join(certPath, "client.key")),
        };

        https.get(options, (res) => {
            if (res.statusCode !== 200) {
                const message =
                    "Unexpected status when querying api server: " +
                    `${res.statusCode} ${res.statusMessage}`;
                reject(message);
            }
            res.pipe(file);
        });

        file.on("finish", () => {
            file.close();
            resolve();
        });
    });

const genSchema = async (): Promise<GraphQLSchema> => {
    const url = APIServerHost + ":" + APIServerPort;
    return graphQLSchema(swaggerSpecPath, url, {});
};

const writeSchema = async () => {
    fs.writeFileSync(gqlSchemaPath, printSchema(await genSchema()), "utf8");
};

const serveSchema = async () => {
    const app = express();

    app.use(
        "/graphql",
        graphqlHTTP({
            schema: await genSchema(),
            graphiql: true,
        }),
    );

    app.listen(3000, () => {
        console.log("http://localhost:3000/graphql");
    });
};

writeSpec()
    .then(writeSchema)
    .then(serveSchema)
    .catch(console.error);
