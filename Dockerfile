## STAGE 1 - Build go
FROM golang:alpine as gobuilder

RUN apk update && apk add --no-cache git

COPY . /src

WORKDIR /src

RUN go build -o goapp


## STAGE 2 -- Build Angular

FROM node:current-alpine as ngbuilder

WORKDIR /usr/src/app

COPY ui/package*.json ./

RUN npm install

COPY ui/ .

RUN npm run buildProd

## STAGE 3 -- Final

FROM alpine

ENV GIN_MODE=release

WORKDIR /app

COPY --from=gobuilder /src/goapp /app/
COPY --from=ngbuilder /usr/src/app/dist /app/public/

EXPOSE 4000

ENTRYPOINT ["./goapp"]
