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

const processLine = (name: string, prefix: string): string => {
    const pattern = new RegExp(prefix + "((?:\\w+\\.)*\\w+)", "g");
    return name.replace(pattern, (_, n: string) => {
        return n.replace(/\.(\w)/g, (_, letter: string) => {
            return letter.toUpperCase();
        });
    });
};

const processSpec = (line: string): string => {
    line = processLine(line, "io.k8s.");
    line = processLine(line, "apiextensions-apiserver.pkg.apis.apiextensions.");
    line = processLine(line, "kube-aggregator.pkg.apis.apiregistration.");
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
            });
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

if (0) {
    console.time();
    writeSpec().then(() => console.timeEnd());
} else {
    writeSpec()
        .then(serveSchema)
        .catch(console.error);
}
