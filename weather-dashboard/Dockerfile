FROM node:16.6.2-alpine
WORKDIR /code
ENV PATH /code/node_modules/.bin:$PATH
COPY ./package.json /code/package.json
COPY ./package-lock.json /code/package-lock.json
RUN npm install --silent
COPY ./src /code/src
CMD ["npm", "start", "--host", "0.0.0.0", "--port 80"]