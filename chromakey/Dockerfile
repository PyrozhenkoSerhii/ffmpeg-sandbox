FROM ubuntu:20.04
USER root
WORKDIR /root/chromakey

# essentials
RUN apt-get update
RUN apt-get install -y curl
RUN apt-get install -y ffmpeg
RUN apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

# nodejs installation
RUN curl -sL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get update
RUN apt-get install -y nodejs

# server
COPY package.json .
RUN npm install
COPY . .

# If need to bin/bash into container without running a backend
# ENTRYPOINT ["tail", "-f", "/dev/null"]