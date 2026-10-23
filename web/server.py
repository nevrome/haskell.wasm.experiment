#!/usr/bin/env python3
import http.server
import urllib.request
import urllib.parse
import json
import sys
import os
import re

class ProxyHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory='.', **kwargs)
    
    def do_GET(self):
        # Check if this is a proxy request
        if self.path.startswith('/proxy?url='):
            self.handle_proxy_request()
        else:
            # Serve static files as before
            super().do_GET()
    
    def handle_proxy_request(self):
        try:
            # Parse the URL parameter
            parsed = urllib.parse.urlparse(self.path)
            query = urllib.parse.parse_qs(parsed.query)
            
            if 'url' not in query:
                self.send_error(400, "Missing 'url' parameter")
                return
            
            target_url = query['url'][0]
            
            # Security: only allow http/https URLs
            if not target_url.startswith(('http://', 'https://')):
                self.send_error(400, "Only http/https URLs are allowed")
                return
            
            # Add a timeout to prevent hanging
            req = urllib.request.Request(target_url, headers={
                'User-Agent': 'Mozilla/5.0 (compatible; Cheesecake/1.0)'
            })
            
            with urllib.request.urlopen(req, timeout=10) as response:
                content = response.read()
                content_type = response.headers.get('Content-Type', 'text/html')
                
                # Send response
                self.send_response(200)
                self.send_header('Content-Type', content_type)
                self.send_header('Content-Length', str(len(content)))
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(content)
                
        except urllib.error.HTTPError as e:
            self.send_error(e.code, f"HTTP Error: {e.reason}")
        except urllib.error.URLError as e:
            self.send_error(502, f"URL Error: {e.reason}")
        except Exception as e:
            self.send_error(500, f"Proxy error: {str(e)}")
    
    def log_message(self, format, *args):
        # Add proxy-specific logging
        if self.path.startswith('/proxy?'):
            print(f"[PROXY] {self.address_string()} - {self.path}")
        else:
            super().log_message(format, *args)

def main():
    port = 8000
    if len(sys.argv) > 1:
        port = int(sys.argv[1])
    
    handler = ProxyHandler
    httpd = http.server.ThreadingHTTPServer(("", port), handler)
    print(f"Serving on port {port}")
    print(f"Proxy endpoint: http://localhost:{port}/proxy?url=YOUR_URL")
    httpd.serve_forever()

if __name__ == "__main__":
    main()
