import https, {RequestOptions} from "https";
import fs from "fs";
import path from "path";
import os from "os";
import readline from "readline";

import {GraphQLSchema} from "graphql";
import express from "express";
import graphqlHTTP from "express-graphql";
import graphQLSchema from "swagger-to-graphql";

const APIServerHost = "192.168.99.100";
const APIServerPort = 8443;
const certPath = path.join(os.homedir(), ".minikube");

const tempDir = ".out";
const swaggerSpecPath = path.join(tempDir, "swagger.json");

const processSpec = (line: string): string => {
    line = line.replace(/io\.k8s\.((?:\w+\.)*\w+)/g, (_, name: string) => {
        return name.replace(/\.(\w)/g, (_, letter: string) => {
            return letter.toUpperCase();
        });
    });
    return line;
};

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

            const reader = readline.createInterface({input: res});
            reader.on("line", (line: string) => {
                file.write(processSpec(line) + "\n");
            });

            reader.on("close", () => {
                file.end(() => resolve());
            })
        });
    });

const genSchema = async (): Promise<GraphQLSchema> => {
    const url = APIServerHost + ":" + APIServerPort;
    const schema: GraphQLSchema = await graphQLSchema(swaggerSpecPath, url, {});
    return schema;
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


if (1) {
    console.time();
    writeSpec().then(() => console.timeEnd());
} else {
    writeSpec()
        .then(serveSchema)
        .catch(console.error);
}