#!/usr/bin/env python3
# SPDX-License-Identifier: MPL-2.0
"""Test a returning browser across a release with four-hour HTTP asset caches.

Supply two Hugo production builds. The local server starts with the old build,
then switches in place; Chrome's HTTP cache, service worker and local data stay.
ChromeDriver must be running. No existing user profile is accessed.
"""
import argparse
import hashlib
import json
import mimetypes
import threading
import time
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--old-build', type=Path, required=True)
parser.add_argument('--new-build', type=Path, required=True)
parser.add_argument('--driver-url', default='http://127.0.0.1:9515')
parser.add_argument('--port', type=int, default=1331)
parser.add_argument('--expect-version', required=True)
args = parser.parse_args()
release = {'root': args.old_build.resolve()}
requests = []


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        path = urllib.parse.urlsplit(self.path).path
        root = release['root']
        file = root / path.lstrip('/')
        if file.is_dir():
            file /= 'index.html'
        if not file.is_file() or not file.resolve().is_relative_to(root):
            self.send_error(404)
            return
        data = file.read_bytes()
        etag = '"' + hashlib.sha256(data).hexdigest() + '"'
        fresh = self.headers.get('If-None-Match') == etag
        self.send_response(304 if fresh else 200)
        self.send_header('ETag', etag)
        # Keep the custom domain's observed four-hour browser TTL even after
        # the release. Versioned URLs must work despite CDN header overrides.
        policy = 'public, max-age=0, must-revalidate' if file.suffix == '.html' else 'public, max-age=14400, must-revalidate'
        self.send_header('Cache-Control', policy)
        self.send_header('Content-Type', mimetypes.guess_type(file)[0] or 'application/octet-stream')
        self.send_header('Content-Length', str(len(data)))
        self.end_headers()
        requests.append(self.path)
        if not fresh:
            self.wfile.write(data)

    def log_message(self, *_):
        pass


server = ThreadingHTTPServer(('127.0.0.1', args.port), Handler)
threading.Thread(target=server.serve_forever, daemon=True).start()


def request(method, path, data=None):
    req = urllib.request.Request(args.driver_url + path, data=json.dumps(data).encode() if data is not None else None,
                                 headers={'Content-Type': 'application/json'}, method=method)
    with urllib.request.urlopen(req, timeout=30) as response:
        value = json.load(response)['value']
    if isinstance(value, dict) and value.get('error'):
        raise RuntimeError(value)
    return value


session = request('POST', '/session', {'capabilities': {'alwaysMatch': {
    'browserName': 'chrome',
    'goog:chromeOptions': {'args': ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--window-size=1440,1100']},
}}})['sessionId']


def command(method, path, data=None):
    return request(method, '/session/' + session + path, data)


def js(script, *values):
    return command('POST', '/execute/sync', {'script': script, 'args': list(values)})


def wait(script):
    deadline = time.monotonic() + 20
    while time.monotonic() < deadline:
        if js(script):
            return
        time.sleep(.1)
    raise AssertionError('Timed out: ' + script)


def visit():
    command('POST', '/url', {'url': f'http://127.0.0.1:{args.port}/app/'})
    wait("return !!document.querySelector('#open-settings')")


def click(selector):
    js('document.querySelector(arguments[0]).click()', selector)


def type_amount():
    for key in '12.34':
        element = command('POST', '/element', {'using': 'css selector', 'value': '#payment-amount'})['element-6066-11e4-a52e-4f735466cecf']
        command('POST', '/element/' + element + '/value', {'text': key, 'value': [key]})
    return js("return document.querySelector('#payment-amount').value")


try:
    visit()
    click('#open-create-wallet')
    js("const e=document.querySelector('[data-modal-field=name]');e.value='Existing wallet';e.dispatchEvent(new Event('input',{bubbles:true}))")
    click('[data-modal-action=create]')
    wait("return !!document.querySelector('.inventory-card') || !!document.querySelector('.wallet-card')")
    js("""const s=JSON.parse(localStorage.getItem('kontana_state_v1'));const w=Object.values(s.wallets)[0];
        w.denominations.forEach(d=>d.count=d.value_minor===10000?1:d.value_minor===2000?2:d.value_minor===100?3:0);
        w.balance_minor=14300;s.settings.language='en';s.settings.appearance='light';s.settings.show_cents=false;
        s.transactions=[{id:'existing-cash',wallet_id:w.id,currency:w.currency,type:'incoming',amount_minor:14300,delta_minor:14300,created_at:'1990-01-01T00:00:00Z',note:'Keep this history'}];
        localStorage.setItem('kt-language','en');window.__ktSetTheme('light');
        localStorage.setItem('kontana_state_v1',JSON.stringify(s));""")
    visit()
    wait('return !!navigator.serviceWorker.controller')
    stored = js("return localStorage.getItem('kontana_state_v1')")
    old_version = js('return APP_VERSION')
    click('.tab-btn[data-tab=pay]')
    print('Old release:', old_version, 'typed 12.34 as', type_amount(), flush=True)

    release['root'] = args.new_build.resolve()
    requests.clear()
    # Exercise the actual old-app update/reload flow, preserving the HTTP cache.
    js('navigator.serviceWorker.getRegistration().then(r=>r.update())')
    wait("return !!document.querySelector('#sw-update-reload')")
    click('#sw-update-reload')
    wait("return document.querySelector('meta[name=kontana-app-version]').content === arguments[0]".replace('arguments[0]', json.dumps(args.expect_version)))
    wait("return !!document.querySelector('.inventory-card')")
    runtime_version = js('return APP_VERSION')
    print('After update: HTML', js("return document.querySelector('meta[name=kontana-app-version]').content"), 'runtime', runtime_version, flush=True)
    assert runtime_version == args.expect_version, f'Cached runtime {runtime_version} survived the release'
    assert js("return localStorage.getItem('kontana_state_v1')") == stored, 'Local wallets/history changed during upgrade'
    assert js("return [...document.querySelectorAll('.inventory-group-heading')].some(e=>e.innerText==='In your wallet')")
    click('.tab-btn[data-tab=pay]')
    assert type_amount() == '€12.34', 'Decimal typing remains broken after upgrade'
    assert js("const a=document.querySelector('.payment-entry-grid').getBoundingClientRect();const b=document.querySelector('.payment-advanced-divider').getBoundingClientRect();return b.top>=a.bottom && Math.abs(a.left-b.left)<2"), 'Old side-by-side layout survived'
    assert any('/app.js?v=' in path for path in requests), 'Runtime was not fetched using a release-specific URL'
    command('POST', '/goog/cdp/execute', {'cmd': 'Network.enable', 'params': {}})
    command('POST', '/goog/cdp/execute', {'cmd': 'Network.emulateNetworkConditions', 'params': {'offline': True, 'latency': 0, 'downloadThroughput': 0, 'uploadThroughput': 0}})
    visit()
    wait("return !!document.querySelector('.inventory-card')")
    assert js('return APP_VERSION') == args.expect_version
    assert js("return localStorage.getItem('kontana_state_v1')") == stored
    click('.tab-btn[data-tab=pay]')
    assert type_amount() == '€12.34'
    print('PASS: cached installation upgraded, decimal typing/layout/inventory fixed, wallets/history unchanged, offline reload works', flush=True)
finally:
    command('DELETE', '')
    server.shutdown()
    server.server_close()
