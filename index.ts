import https, {RequestOptions} from "https";
import fs from "fs";
import path from "path";
import os from "os";

import {printSchema} from "graphql";
import graphQLSchema from "swagger-to-graphql";

const APIServerHost = "192.168.99.100";
const APIServerPort = 8443;
const certPath = path.join(os.homedir(), ".minikube");

const tempDir = ".out";
const swaggerSpec = path.join(tempDir, "swagger.json");
const gqlSchema = path.join(tempDir, "schema.gql");

const writeSpec = () =>
    new Promise((resolve, reject) => {
        const file = fs.createWriteStream(swaggerSpec);

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

const writeSchema = async () => {
    const schema = await graphQLSchema(swaggerSpec, "", {});
    fs.writeFileSync(gqlSchema, printSchema(schema), "utf8");
};

writeSpec()
    .then(writeSchema)
    .catch(console.error);
