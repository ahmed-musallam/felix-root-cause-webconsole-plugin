#!/usr/bin/env bash
# For use in gitpod
SLING_PORT=8080

# wait untill sling instance is up
gp await-port $SLING_PORT
# deploy to sling instance
mvn clean install -PautoInstallBundle -Dfelix.port=$SLING_PORT
# get url preview it
PREVIEW_URL=$(gp url $SLING_PORT)
gp preview $PREVIEW_URL/system/console/root-cause