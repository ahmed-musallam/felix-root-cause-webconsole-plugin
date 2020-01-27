#!/usr/bin/env bash
# For use in gitpod


# wait untill sling instance is up
bash -c 'while [[ "$(curl -s -o /dev/null -w ''%{http_code}'' localhost:8080/starter/index.html)" != "200" ]]; do sleep 5; done'
# deploy to sling instance
mvn clean install -PautoInstallBundle -Dfelix.port=8080