# sekstant

GraphQL interface for the Kubernetes API server.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: sekstant
spec:
  containers:
  - name: sekstant
    image: gcr.io/sekstant/sekstant # TODO version
    ports:
    - containerPort: 11456
```

The image is designed to run inside a Kubernetes cluster. On startup, it queries the API server for it's Swagger specification and translates it into a GraphQL schema which is then exposed as an HTTP endpoint.

<!-- TODO non-hardcoded -->

## Options

<!-- TODO
PORT
GRAPHIQL
KUBERNETES_SERVICE_HOST ?????
KUBERNETES_SERVICE_PORT ?????
-->

#### Authorization

<!-- TODO
minikube start --extra-config=apiserver.authorization-mode=RBAC

CERTIFICATE_PATH
TOKEN_PATH
-->

## License

[MIT](./LICENSE)
