# Retro Funtime!

## What is Retro Funtime?
This is a web app that aggregates statistics in realtime from team members during a retrospective.

The app asks for your temperature and safety which are submitted anonymously.
As team members submit these values, the low, high, and average values are displayed to everyone in realtime.

![Alt text](/screenshots/2022-02-22.png?raw=true "Retro Funtime Screenshot")

### Temp
Indicates how you are feeling about your job.

### Safety
Indicates how comfortable you feel raising your opinions with the group.

### Retro Confession
An open-ended submission for anonymous retro topics or just for fun.

### Manual Reset
A reset link in the bottom left corner allows anyone to manually reset the statistics and allow for new submissions.

### Pause the background video
You can pause the video background with the "MAKE IT STOP" link in the bottom right corner. This user preference is saved to local storage.

### Some things to note:

- Submissions are anonymous and there is no authentication.
- Deploy this to a place where only the team can access it.
- There is no persistence or logging of submissions.
- Statistics are automatically cleared 30 minutes after the last user disconnects from the page.
- Trolls on your team could mess with your data and abuse the confessions, but you don't have trolls on your team, right?

## Running from Docker

    docker pull justinkurtz/retrofuntime
    docker run -p 4000:4000 justinkurtz/retrofuntime

Then go to http://localhost:4000

## How do I make changes?

### Software that would be helpful
- Docker
- Golang 1.17 or later
- Node and NPM

### Running locally

    npm install --prefix ui
    npm run buildProd --prefix ui
    go run main.go

Then go to http://localhost:4000

### Running locally with Angular watch mode

In your first terminal run:

    npm start --prefix ui

In a second terminal run:
    
    go run main.go

Then go to http://localhost:4200. Requests are proxied to localhost:4000 as defined in proxy.conf.json.

### Building with Docker

    docker build .
