"""SaberPro Server — serves app + handles update publishing."""
import http.server
import json
import os
import socket

PORT = 8001
DIR = os.path.dirname(os.path.abspath(__file__))

class SaberProHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIR, **kwargs)

    def do_POST(self):
        """Handle POST /publish — save update.json to updates/ folder."""
        if self.path == '/publish':
            try:
                length = int(self.headers.get('Content-Length', 0))
                data = self.rfile.read(length)
                pkg = json.loads(data)
                
                updates_dir = os.path.join(DIR, 'updates')
                os.makedirs(updates_dir, exist_ok=True)
                
                filepath = os.path.join(updates_dir, 'update.json')
                with open(filepath, 'w', encoding='utf-8') as f:
                    json.dump(pkg, f, ensure_ascii=False, indent=2)
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                resp = {'ok': True, 'version': pkg.get('version'), 'questions': len(pkg.get('questions', []))}
                self.wfile.write(json.dumps(resp).encode('utf-8'))
                print(f'[PUBLISH] v{pkg.get("version")} - {len(pkg.get("questions",[]))} preguntas')
            except Exception as e:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'ok': False, 'error': str(e)}).encode('utf-8'))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def end_headers(self):
        # No-cache para evitar que el navegador use JS/CSS viejos
        if self.path and (self.path.endswith('.js') or self.path.endswith('.css') or self.path.endswith('.html') or self.path.endswith('.json')):
            self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')
        super().end_headers()

    def log_message(self, format, *args):
        path = self.path or ''
        if '/updates/' in path or '/publish' in path:
            print(f'[{self.command}] {path} - update')
        elif not any(x in path for x in ['.css','.js','.json','.html','favicon']):
            print(f'[{self.command}] {path}')

def get_local_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
    except:
        ip = '127.0.0.1'
    finally:
        s.close()
    return ip

if __name__ == '__main__':
    ip = get_local_ip()
    print('=' * 55)
    print('  SaberPro Server')
    print('=' * 55)
    print(f'  Admin:     http://{ip}:{PORT}/admin')
    print(f'  App:       http://{ip}:{PORT}/user')
    print(f'  Emulator:  http://{ip}:{PORT}/emulador_celular.html')
    print(f'  Updates:   http://{ip}:{PORT}/updates/update.json')
    print()
    print('  En tu celular (misma red WiFi):')
    print(f'  App:       http://{ip}:{PORT}/user')
    print(f'  Updates:   http://{ip}:{PORT}/updates/update.json')
    print('=' * 55)
    
    server = http.server.HTTPServer(('0.0.0.0', PORT), SaberProHandler)
    print(f'\n  Servidor iniciado. Ctrl+C para detener.\n')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\n  Servidor detenido.')
        server.shutdown()
