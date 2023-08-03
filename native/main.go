package main

import (
	"bufio"
	"encoding/binary"
	"encoding/json"
	"io"
	"log"
	"os"
	"os/exec"
)

func stdinWorker(c chan map[string]any) {
	reader := bufio.NewReader(os.Stdin)

	for {
		var messageLength uint32
		if err := binary.Read(reader, binary.LittleEndian, &messageLength); err != nil {
			log.Println(err)
			continue
		}

		bs := make([]byte, messageLength)
		if _, err := io.ReadFull(reader, bs); err != nil {
			log.Println(err)
			continue
		}

		parsedJson := make(map[string]any)
		if err := json.Unmarshal(bs, &parsedJson); err != nil {
			log.Println(err)
			continue
		}

		c <- parsedJson
	}
}

type Message struct {
	Content string `json:"c"`
}

type DebugMessage struct {
	Debug any `json:"d"`
}

func newMessage(Content string) Message {
	return Message{Content}
}

func sendDebugMessage(a any, w io.Writer) (err error) {
	return sendMessage(DebugMessage{Debug: a}, w)
}

func (m Message) send(w io.Writer) (err error) {
	return sendMessage(m, w)
}

func sendMessage[T Message | DebugMessage](m T, w io.Writer) (err error) {
	var j []byte
	j, err = json.Marshal(m)
	if err != nil {
		return
	}

	header := make([]byte, 4)
	binary.LittleEndian.PutUint32(header, uint32(len(j)))

	if err = binary.Write(w, binary.LittleEndian, header); err != nil {
		return
	}

	if _, err = w.Write(j); err != nil {
		return
	}

	return
}

func main() {
	stdinQueue := make(chan map[string]any)

	go stdinWorker(stdinQueue)

	cmd := exec.Command("/bin/sh")
	if dir, err := os.UserHomeDir(); err == nil {
		cmd.Dir = dir
	}

	cmd.Env = append(cmd.Environ(), "TERM_PROGRAM=browser-terminal-extension")

	processCommands(stdinQueue, cmd)
}
