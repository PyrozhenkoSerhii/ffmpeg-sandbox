FROM ubuntu:20.04
USER root
WORKDIR /root/server

# essentials
RUN apt-get update
RUN apt-get install -y curl
RUN apt-get install -y ffmpeg

# nodejs installation
RUN curl -sL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get update
RUN apt-get install -y nodejs

# server
COPY package.json .
RUN npm install
COPY . .