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
const swaggerCleanSpecPath = path.join(tempDir, "schema.json");
const gqlSchemaPath = path.join(tempDir, "schema.gql");

const writeSpec = async () =>
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

const genCleanSpec = async () => {
    return new Promise((resolve) => {
        const input = fs.createReadStream(swaggerSpecPath, "utf8");
        const output = fs.createWriteStream(swaggerCleanSpecPath, "utf8");

        input.on("data", (chunk: string) => {
            output.write(
                chunk.replace(/io\.k8s\.((?:\w+\.)*\w+)/g, (_, name: string) => {
                    return name.replace(/\./g, "");
                }),
            );
        });

        input.on("close", () => {
            output.emit("close");
            resolve();
        });
    });
};

const genSchema = async (): Promise<GraphQLSchema> => {
    const url = APIServerHost + ":" + APIServerPort;
    const schema: GraphQLSchema = await graphQLSchema(swaggerCleanSpecPath, url, {});
    return schema;
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
    .then(genCleanSpec)
    .then(writeSchema)
    .then(serveSchema)
    .catch(console.error);
