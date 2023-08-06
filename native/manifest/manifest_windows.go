package manifest

import "errors"

var ErrTodo = errors.New("TODO")

func Install() (err error) {
	err = ErrTodo
	return
}

func Uninstall() (err error) {
	err = ErrTodo
	return
}
