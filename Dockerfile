FROM node:alpine3.11
# added workdir here because npm install was not working. it was running in the root directory of the container.
WORKDIR /usr/app
COPY . /usr/app
RUN npm i

EXPOSE 80
CMD ["node","index.js"]