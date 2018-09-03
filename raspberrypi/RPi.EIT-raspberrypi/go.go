package main

import (
	"bufio"
	"github.com/zhouhui8915/go-socket.io-client"
	"log"
	"os"
)

func main() {
	log.Printf("Listening Server...\n")

	opts := &socketio_client.Options{
		//Transport:"polling",
		Transport:"websocket",
		Query:     make(map[string]string),
	}
	opts.Query["user"] = "user"
	opts.Query["pwd"] = "pass"
	uri := "http://localhost:1993"

	client, err := socketio_client.NewClient(uri, opts)
	if err != nil {
		log.Printf("NewClient error:%v\n", err)
		return
	}
	// client.Emit("raspiConnect")
	client.On("error", func() {
		log.Printf("on error\n")
	})
	client.On("connection", func() {
		log.Printf("on connect\n")
	})
	client.On("message", func(msg string) {
		log.Printf("on message:%v\n", msg)
	})
	client.On("chat message", func(msg string) {
		log.Printf("on message:%v\n", msg)
	})
	client.On("disconnection", func() {
		log.Printf("on disconnect\n")
	})
	client.On("startReconstruction", func(msg string) {
		log.Printf("masukkk")
	})
	client.On("toGo", func() {
		log.Printf("masuk go")
	})
	log.Printf("Listening Sersadsadver...\n")

	reader := bufio.NewReader(os.Stdin)
	for {
		client.On("toGo", func() {
			log.Printf("masuk go")
		})
		data, _, _ := reader.ReadLine()
		command := string(data)
		log.Printf(command)
		client.Emit("message", command)
		log.Printf("send message:%v\n", command)
	}

}
