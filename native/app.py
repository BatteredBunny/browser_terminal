#!/usr/bin/env -S python3 -u

# Note that running python with the `-u` flag is required on Windows,
# in order to ensure that stdin and stdout are opened in binary, rather
# than text, mode.
import sys
import json
import struct
import subprocess
import queue
import threading

stdin_queue = queue.Queue()


def stdin_worker():
    while True:
        raw_length = sys.stdin.buffer.read(4)
        if len(raw_length) == 0:
            continue
        message_length = struct.unpack('@I', raw_length)[0]
        message = sys.stdin.buffer.read(message_length).decode('utf-8')
        stdin_queue.put(json.loads(message))


threading.Thread(target=stdin_worker, daemon=True).start()


def encode_message(message_content):
    # https://docs.python.org/3/library/json.html#basic-usage
    # To get the most compact JSON representation, you should specify
    # (',', ':') to eliminate whitespace.
    # We want the most compact representation because the browser rejects # messages that exceed 1 MB.
    encoded_content = json.dumps(message_content, separators=(',', ':')).encode('utf-8')
    encoded_length = struct.pack('@I', len(encoded_content))
    return {'length': encoded_length, 'content': encoded_content}


def send_message_raw(encoded_message):
    sys.stdout.buffer.write(encoded_message['length'])
    sys.stdout.buffer.write(encoded_message['content'])
    sys.stdout.buffer.flush()


def send_content(content):
    send_message_raw(encode_message({'content': content}))


def send_return_code(code):
    send_message_raw(encode_message({'return_code': code}))


while True:
    received_message = stdin_queue.get()
    if not received_message['command']:
        continue

    proc = subprocess.Popen(received_message['command'],
                            stdout=subprocess.PIPE,
                            stderr=subprocess.PIPE,
                            text=True,
                            shell=True)

    while proc.poll() is None:
        try:
            received_message = stdin_queue.get_nowait()
            if received_message['signal']:
                proc.send_signal(received_message['signal'])
        except queue.Empty:
            pass

        b = proc.stdout.readline().rstrip()
        if b:
            send_content(b)

    # Just in case so bytes don't get lost
    last_bytes = proc.stdout.read()
    if last_bytes:
        send_content(last_bytes)

    if proc.returncode != 0:
        send_content(proc.stderr.read())

    send_return_code(str(proc.returncode))
