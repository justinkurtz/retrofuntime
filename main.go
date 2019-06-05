package main

import (
	"encoding/json"
	"github.com/gin-contrib/gzip"
	"github.com/gin-gonic/gin"
	"github.com/olahol/melody"
	"log"
	"path"
	"path/filepath"
	"sync"
	"time"
)

type RequestMessage struct {
	Type           string     `json:"type"`
	TempSafety     TempSafety `json:"tempSafety"`
	TrueConfession string     `json:"trueConfession"`
}

type ResponseMessage struct {
	Type            string       `json:"type"`
	RetroResults    RetroResults `json:"retroResults"`
	TrueConfessions []string     `json:"trueConfessions"`
}

type TempSafety struct {
	Temp   float64 `json:"temp"`
	Safety float64 `json:"safety"`
}

type RetroResults struct {
	NumResults    int             `json:"numResults"`
	TimeStarted   time.Time       `json:"timeStarted"`
	TempResults   AggregateResult `json:"tempResults"`
	SafetyResults AggregateResult `json:"safetyResults"`
}

type AggregateResult struct {
	Min float64 `json:"min"`
	Max float64 `json:"max"`
	Avg float64 `json:"avg"`
}

var tempResponses []float64
var safetyResponses []float64
var trueConfessions []string
var lastConnection = time.Now()
var lock = new(sync.Mutex)

func main() {
	r := gin.Default()
	m := melody.New()

	r.Use(gzip.Gzip(gzip.DefaultCompression))

	r.NoRoute(func(c *gin.Context) {
		dir, file := path.Split(c.Request.RequestURI)
		ext := filepath.Ext(file)
		if file == "" || ext == "" {
			c.File("./public/index.html")
		} else {
			c.File("./public/" + path.Join(dir, file))
		}
	})

	r.GET("/ws", func(c *gin.Context) {
		err := m.HandleRequest(c.Writer, c.Request)
		if err != nil {
			log.Println(err.Error())
		}
	})

	r.POST("/clear", func(c *gin.Context) {
		lock.Lock()
		tempResponses = tempResponses[:0]
		safetyResponses = safetyResponses[:0]
		trueConfessions = trueConfessions[:0]
		r, err := json.Marshal(generateResults())
		if err != nil {
			log.Println(err.Error())
			return
		}
		tc, err := json.Marshal(generateTrueConfessions())
		if err != nil {
			log.Println(err.Error())
			return
		}
		lock.Unlock()
		err = m.Broadcast(r)
		if err != nil {
			log.Println(err.Error())
		}
		err = m.Broadcast(tc)
		if err != nil {
			log.Println(err.Error())
		}
	})

	m.HandleConnect(func(s *melody.Session) {
		lock.Lock()
		if m.Len() == 0 && time.Now().Sub(lastConnection) > (30*time.Second) {
			tempResponses = tempResponses[:0]
			safetyResponses = safetyResponses[:0]
			trueConfessions = trueConfessions[:0]
		}
		lastConnection = time.Now()
		r, err := json.Marshal(generateResults())
		if err != nil {
			log.Println(err.Error())
			return
		}
		tc, err := json.Marshal(generateTrueConfessions())
		if err != nil {
			log.Println(err.Error())
			return
		}
		lock.Unlock()
		err = s.Write(r)
		if err != nil {
			log.Println(err.Error())
		}
		err = s.Write(tc)
		if err != nil {
			log.Println(err.Error())
		}
	})

	m.HandleDisconnect(func(s *melody.Session) {
		lastConnection = time.Now()
	})

	m.HandleMessage(func(s *melody.Session, msg []byte) {
		var request RequestMessage
		err := json.Unmarshal(msg, &request)
		if err != nil {
			log.Println(err.Error())
			return
		}
		switch request.Type {
		case "tempSafety":
			processTempSafety(request.TempSafety, m)
			break
		case "trueConfession":
			processTrueConfession(request.TrueConfession, m)
			break
		default:
			break
		}
	})

	err := r.Run(":4000")
	if err != nil {
		log.Fatalln(err.Error())
	}
}

func processTrueConfession(trueConfession string, m *melody.Melody) {
	lock.Lock()
	trueConfessions = append([]string{trueConfession}, trueConfessions...)
	r, err := json.Marshal(generateTrueConfessions())
	lock.Unlock()

	err = m.Broadcast(r)
	if err != nil {
		log.Println(err.Error())
	}
}

func processTempSafety(tempSafety TempSafety, m *melody.Melody) {
	lock.Lock()
	tempResponses = append(tempResponses, tempSafety.Temp)
	safetyResponses = append(safetyResponses, tempSafety.Safety)
	r, err := json.Marshal(generateResults())
	lock.Unlock()
	if err != nil {
		log.Println(err.Error())
		return
	}
	err = m.Broadcast(r)
	if err != nil {
		log.Println(err.Error())
	}
}

func generateTrueConfessions() ResponseMessage {
	return ResponseMessage{
		Type:            "trueConfession",
		TrueConfessions: trueConfessions,
	}
}

func generateResults() ResponseMessage {
	return ResponseMessage{
		Type: "retroResults",
		RetroResults: RetroResults{
			NumResults:    len(tempResponses),
			TempResults:   generateAggregateResult(&tempResponses),
			SafetyResults: generateAggregateResult(&safetyResponses),
		},
	}
}

func generateAggregateResult(s *[]float64) AggregateResult {
	return AggregateResult{
		Min: Min(*s),
		Max: Max(*s),
		Avg: Avg(*s),
	}
}

func Min(values []float64) (min float64) {
	if len(values) == 0 {
		return 0
	}

	min = values[0]
	for _, v := range values {
		if v < min {
			min = v
		}
	}

	return min
}

func Max(values []float64) (max float64) {
	if len(values) == 0 {
		return 0
	}

	max = values[0]
	for _, v := range values {
		if v > max {
			max = v
		}
	}

	return max
}

func Avg(values []float64) (avg float64) {
	if len(values) == 0 {
		return 0
	}

	var total float64 = 0
	for _, v := range values {
		total += v
	}

	return total / float64(len(values))
}
