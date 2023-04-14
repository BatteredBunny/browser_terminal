#!/usr/bin/env -S python3 -u

# Note that running python with the `-u` flag is required on Windows,
# in order to ensure that stdin and stdout are opened in binary, rather
# than text, mode.
import sys
import json
import struct
import subprocess


# Read a message from stdin and decode it.
def get_message():
    raw_length = sys.stdin.buffer.read(4)
    if len(raw_length) == 0:
        return
    message_length = struct.unpack('@I', raw_length)[0]
    message = sys.stdin.buffer.read(message_length).decode('utf-8')
    return json.loads(message)


# Encode a message for transmission,
# given its content.
def encode_message(message_content: str, return_code=''):
    # https://docs.python.org/3/library/json.html#basic-usage
    # To get the most compact JSON representation, you should specify
    # (',', ':') to eliminate whitespace.
    # We want the most compact representation because the browser rejects # messages that exceed 1 MB.
    msg = {'content': message_content, 'return_code': return_code}
    encoded_content = json.dumps(msg, separators=(',', ':')).encode('utf-8')
    encoded_length = struct.pack('@I', len(encoded_content))
    return {'length': encoded_length, 'content': encoded_content}


# Send an encoded message to stdout
def send_message(encoded_message):
    sys.stdout.buffer.write(encoded_message['length'])
    sys.stdout.buffer.write(encoded_message['content'])
    sys.stdout.buffer.flush()


while True:
    received_message = get_message()

    proc = subprocess.Popen(received_message['content'],
                            stdout=subprocess.PIPE,
                            stderr=subprocess.PIPE,
                            text=True,
                            shell=True)

    while proc.poll() is None:
        b = proc.stdout.readline().rstrip()
        if b:
            send_message(encode_message(b))

    # Just in case so bytes don't get lost
    last_bytes = proc.stdout.read()
    if last_bytes:
        send_message(encode_message(last_bytes))

    if proc.returncode != 0:
        send_message(encode_message(proc.stderr.read()))
    send_message(encode_message('', str(proc.returncode)))
