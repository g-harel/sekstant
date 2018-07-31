#!/bin/sh

MINIKUBE_IP=$(minikube ip)
MINIKUBE_PATH=~/.minikube
API_SERVER_PORT=8443
OUT_FILE=swagger.json

curl \
  --cacert $MINIKUBE_PATH/ca.crt \
  --cert $MINIKUBE_PATH/client.crt \
  --key $MINIKUBE_PATH/client.key \
  --out $OUT_FILE \
  https://$MINIKUBE_IP:$API_SERVER_PORT/swagger.json
