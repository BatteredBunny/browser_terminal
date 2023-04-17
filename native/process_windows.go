//go:build windows

package main

import (
	"bufio"
	"fmt"
	"log"
	"os"
	"os/exec"
	"strings"
)

func sendBuffer(s strings.Builder, writer *bufio.Writer) {
	if s.Len() != 0 {
		for _, line := range strings.Split(s.String(), "\n") {
			if err := newMessage(line).send(writer); err != nil {
				continue
			}
		}

		s.Reset()
	}
}

func processCommands(c chan map[string]any, cmd *exec.Cmd) {
	var stdout_buffer strings.Builder
	cmd.Stdout = &stdout_buffer

	var stderr_buffer strings.Builder
	cmd.Stderr = &stderr_buffer

	stdin, err := cmd.StdinPipe()
	if err != nil {
		log.Fatal(err)
	}

	go func() {
		if err = cmd.Run(); err != nil {
			log.Fatal(err)
		}
	}()

	stdinWriter := bufio.NewWriter(os.Stdout)

	go func() {
		for {
			sendBuffer(stdout_buffer, stdinWriter)
			sendBuffer(stderr_buffer, stdinWriter)
		}
	}()

	for msg := range c {
		_, _ = fmt.Fprintln(stdin, msg["command"])
	}
}
