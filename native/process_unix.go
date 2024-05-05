//go:build !windows

package main

import (
	"bufio"
	"io"
	"log"
	"os"
	"os/exec"
	"sync"

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

	var runes []rune
	var runesMutex sync.Mutex

	go func() {
		var foundRune rune
		var byteAmount int

		for {
			foundRune, byteAmount, err = ptmxReader.ReadRune()
			if err != nil {
				continue
			}
			totalBytes += int64(byteAmount)

			runesMutex.Lock()
			runes = append(runes, foundRune)
			runesMutex.Unlock()
		}
	}()

	for {
		runesMutex.Lock()
		if len(runes) > 0 {
			if err = newMessage(string(runes)).send(w); err != nil {
				runesMutex.Unlock()
				continue
			}

			w.Flush()

			runes = []rune{}
		}
		runesMutex.Unlock()
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
