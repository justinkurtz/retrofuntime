## STAGE 1 - Build go
FROM golang:1.20-alpine as gobuilder
RUN apk update && apk add --no-cache git
COPY . /src
WORKDIR /src
RUN go build -o goapp


## STAGE 2 -- Build Angular
FROM node:18-alpine as ngbuilder
WORKDIR /usr/src/app/ui
COPY ui/ ./
RUN npm i && npm run buildProd

## STAGE 3 -- Final
FROM alpine
ENV GIN_MODE=release
WORKDIR /app

COPY --from=gobuilder /src/goapp /app/
COPY --from=ngbuilder /usr/src/app/ui/dist /app/public/

EXPOSE 4000

ENTRYPOINT ["./goapp"]
