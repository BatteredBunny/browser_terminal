//go:build !windows

package main

import (
	"bufio"
	"io"
	"log"
	"os"
	"os/exec"

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

func (w NativeMessageWriter) ReadFrom(r io.Reader) (total_bytes int64, err error) {
	ptmx_reader := bufio.NewReader(r)

	for {
		r, byte_amount, err := ptmx_reader.ReadRune()
		total_bytes += int64(byte_amount)
		if err != nil {
			return total_bytes, err
		}
		if err := newMessage(string(r)).send(w.writer); err != nil {
			continue
		}
	}
}

func process_commands(c chan map[string]any, cmd *exec.Cmd) {
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
		if command, exits := msg["command"]; exits {
			ptmx.WriteString(command.(string))
		} else if signal, exits := msg["signal"]; exits {
			cmd.Process.Signal(signal.(os.Signal))
		}
	}
}
