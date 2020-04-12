#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# Run a simple development server. This is necessary because just doing `python3 -m http.server` does not set
# the correct MIME type for wasm files.
# Copied from https://gist.github.com/HaiyangXu/ec88cbdce3cdbac7b8d5
#test on python 3.4 ,python of lower version  has different module organization.
import http.server
from http.server import HTTPServer, BaseHTTPRequestHandler
import socketserver

PORT = 8080

Handler = http.server.SimpleHTTPRequestHandler

Handler.extensions_map={
    '.manifest': 'text/cache-manifest',
    '.html': 'text/html',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.svg':	'image/svg+xml',
    '.css':	'text/css',
    '.js':	'application/x-javascript',
    '.wasm': 'application/wasm',
    '': 'application/octet-stream', # Default
}

httpd = socketserver.TCPServer(("", PORT), Handler)

print("serving at port", PORT)
httpd.serve_forever()