//go:build !windows

package main

import (
	"bufio"
	"io"
	"log"
	"os"
	"os/exec"
	"time"

	"github.com/creack/pty"
)

type NativeMessageWriter struct {
	writer *bufio.Writer
}

func newNativeMessageWriter(w io.Writer) NativeMessageWriter {
	return NativeMessageWriter{
		writer: bufio.NewWriter(w),
	}
}

func (w NativeMessageWriter) Write(p []byte) (n int, err error) {
	return w.writer.Write(p)
}

func (w NativeMessageWriter) Flush() error {
	return w.writer.Flush()
}

func (w NativeMessageWriter) ReadFrom(r io.Reader) (totalBytes int64, err error) {
	ptmxReader := bufio.NewReader(r)
	dataCh := make(chan []byte, 16)

	go func() {
		buf := make([]byte, 4096)
		for {
			n, readErr := ptmxReader.Read(buf)
			if n > 0 {
				totalBytes += int64(n)
				chunk := make([]byte, n)
				copy(chunk, buf[:n])
				dataCh <- chunk
			}
			if readErr != nil {
				continue
			}
		}
	}()

	// Batch messages every 5ms
	ticker := time.NewTicker(5 * time.Millisecond)
	defer ticker.Stop()

	var buffer []byte

	flush := func() {
		if len(buffer) == 0 {
			return
		}
		if err = newMessage(string(buffer)).send(w); err == nil {
			w.Flush()
		}
		buffer = buffer[:0]
	}

	for {
		select {
		case chunk := <-dataCh:
			buffer = append(buffer, chunk...)

			// Flush immediately if too much data
			if len(buffer) >= 4096 {
				flush()
			}
		case <-ticker.C:
			flush()
		}
	}
}

func processCommands(c chan map[string]any, cmd *exec.Cmd) {
	ptmx, err := pty.Start(cmd)
	if err != nil {
		log.Fatal(err)
	}

	defer ptmx.Close()

	go func() {
		wrappedStdoutWriter := newNativeMessageWriter(os.Stdout)
		_, _ = io.Copy(wrappedStdoutWriter, ptmx)
	}()

	for msg := range c {
		if command, exists := msg["command"]; exists {
			ptmx.WriteString(command.(string))
		} else if signal, exists := msg["signal"]; exists {
			cmd.Process.Signal(signal.(os.Signal))
		}
	}
}
