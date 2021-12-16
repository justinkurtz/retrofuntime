package main

import (
	"github.com/gin-contrib/gzip"
	"github.com/gin-gonic/gin"
	"gopkg.in/olahol/melody.v1"
	"log"
	"retrofuntime/retrofuntime"
)

func main() {
	r := gin.Default()
	m := melody.New()
	r.Use(gzip.Gzip(gzip.DefaultCompression))

	retrofuntime.RegisterRoutes(r, m)
	err := r.Run(":4000")
	if err != nil {
		log.Fatalln(err.Error())
	}
}
