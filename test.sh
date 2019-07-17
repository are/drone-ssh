#!/bin/sh

docker build -t are1000/drone-ssh:latest .

docker run --rm \
	-e PLUGIN_HOST=dokku.are1000.dev \
	-e PLUGIN_USERNAME=dokku \
	-e PLUGIN_PRIVATE_KEY_PATH=/Users/artur.wojciechowski/.ssh/id_rsa \
	-e PLUGIN_SCRIPT="apps:report,apps:list,domains:report" \
	are1000/drone-ssh