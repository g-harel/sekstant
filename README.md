# sekstant

<!--

TODO
- test watch
- test create
- publish/build version
- listen to changes to api spec (CRD)

 -->

GraphQL interface for the Kubernetes API.

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

The image is designed to run inside a [Kubernetes](https://kubernetes.io/) cluster. On startup, it queries the API server for it's [Swagger specification](https://swagger.io/specification/) and translates it into a [GraphQL](https://graphql.org/) schema which is then exposed as an HTTP endpoint.

<!-- TODO non-hardcoded -->

## Options

`PORT` Container port used to expose the GraphQL api. (default `11456`)

`PATHNAME` URL path at which GraphQL API is exposed. (default `/graphql`)

`GRAPHIQL` Configuration to enable the [GraphiQL IDE](https://github.com/graphql/graphiql). (default `disabled`)

#### Authorization

Authorization is inherited from the pod's service account credentials read from the [container's filesystem](https://kubernetes.io/docs/tasks/access-application-cluster/access-cluster/#accessing-the-api-from-a-pod). The following options allow configuration of this behavior.

_[Example service account and RBAC configuration.](./example.yaml)_

`API_SERVER_URL` Base URL of the API server. (default `https://kubernetes.default.svc`)

`TOKEN_PATH` Path to the pod's service account token. (default `/var/run/secrets/kubernetes.io/serviceaccount/token`)

`CERTIFICATE_PATH` Path to the API server's certificate. (default `/var/run/secrets/kubernetes.io/serviceaccount/ca.crt`)

_[You may need to enable RBAC explicitly when using minikube.](https://gist.github.com/F21/08bfc2e3592bed1e931ec40b8d2ab6f5)_

## License

[MIT](./LICENSE)
