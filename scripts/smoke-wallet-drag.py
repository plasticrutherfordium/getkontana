#!/usr/bin/env python3
# SPDX-License-Identifier: MPL-2.0
"""Exercise wallet reordering with real mouse/touch/key input in a fresh profile."""
import argparse
import base64
import json
import time
import urllib.error
import urllib.request
from pathlib import Path

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--base-url', default='http://127.0.0.1:1327')
parser.add_argument('--driver-url', default='http://127.0.0.1:9515')
parser.add_argument('--artifacts', type=Path, default=Path('/tmp/kontana-wallet-drag-qa'))
args = parser.parse_args()
args.artifacts.mkdir(parents=True, exist_ok=True)


def request(method, path, data=None):
    req = urllib.request.Request(args.driver_url + path, data=json.dumps(data).encode() if data is not None else None,
                                 headers={'Content-Type': 'application/json'}, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            result = json.load(response)['value']
    except urllib.error.HTTPError as error:
        raise RuntimeError(error.read().decode()) from error
    if isinstance(result, dict) and result.get('error'):
        raise RuntimeError(result)
    return result


session = request('POST', '/session', {'capabilities': {'alwaysMatch': {
    'browserName': 'chrome',
    'goog:chromeOptions': {'args': ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--window-size=1440,1100']},
    'goog:loggingPrefs': {'browser': 'ALL'},
}}})['sessionId']


def command(method, path, data=None):
    return request(method, '/session/' + session + path, data)


def js(script, *values):
    return command('POST', '/execute/sync', {'script': script, 'args': list(values)})


def wait(script):
    deadline = time.monotonic() + 15
    while time.monotonic() < deadline:
        if js(script):
            return
        time.sleep(.03)
    raise AssertionError('Timed out: ' + script)


def click(selector):
    js('document.querySelector(arguments[0]).click()', selector)


def visit():
    command('POST', '/url', {'url': args.base_url.rstrip('/') + '/app/'})
    wait("return !!document.querySelector('#open-settings')")


def order():
    return js("return JSON.parse(localStorage.getItem('kontana_state_v1')).wallet_order")


def financial():
    return js("const s=JSON.parse(localStorage.getItem('kontana_state_v1'));delete s.wallet_order;return s")


def rail(tab='cash'):
    return f'#tab-{tab} .wallet-cards'


def card(wallet, tab='cash'):
    return f'#tab-{tab} [data-wallet-id="{wallet}"]'


def point(selector, x=.5, y=.5):
    return js("const r=document.querySelector(arguments[0]).getBoundingClientRect();return {x:Math.round(r.left+r.width*arguments[1]),y:Math.round(r.top+r.height*arguments[2])}", selector, x, y)


def pointer(actions, kind='mouse'):
    command('POST', '/actions', {'actions': [{'type': 'pointer', 'id': 'wallet-' + kind,
        'parameters': {'pointerType': kind}, 'actions': actions}]})


def move(p, duration=0):
    return {'type': 'pointerMove', 'origin': 'viewport', 'x': p['x'], 'y': p['y'], 'duration': duration}


def key_combo(key, alt=False):
    actions = ([{'type': 'keyDown', 'value': '\ue00a'}] if alt else [])
    actions += [{'type': 'keyDown', 'value': key}, {'type': 'keyUp', 'value': key}]
    if alt:
        actions += [{'type': 'keyUp', 'value': '\ue00a'}]
    command('POST', '/actions', {'actions': [{'type': 'key', 'id': 'wallet-keys', 'actions': actions}]})


def screenshot(name):
    (args.artifacts / (name + '.png')).write_bytes(base64.b64decode(command('GET', '/screenshot')))


def settle():
    wait("return !document.querySelector('.wallet-drag-preview') && !document.body.classList.contains('wallet-reordering')")


def drag_one(tab='cash', reduced=False):
    js("if(!window.__walletWritesTracked){window.__walletWritesTracked=true;window.__walletStateWrites=0;const write=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(key==='kontana_state_v1')window.__walletStateWrites++;return write.call(this,key,value)}}")
    writes = js('return window.__walletStateWrites')
    before = order()
    selected = js("return document.querySelector(arguments[0]+' [data-wallet-id][aria-pressed=true]').dataset.walletId", rail(tab))
    source = before[1]
    js("document.querySelector(arguments[0]).scrollLeft=0", rail(tab))
    start = point(card(source, tab), .72, .68)
    width = js('return document.querySelector(arguments[0]).getBoundingClientRect().width', card(source, tab))
    end = {'x': round(start['x'] - width - 12), 'y': start['y'] + 16}
    pointer([move(start), {'type': 'pointerDown', 'button': 0}, move(end)])
    wait("return !!document.querySelector('.wallet-drag-preview') && document.querySelector(arguments[0])".replace('arguments[0]', json.dumps(rail(tab) + ' .wallet-drag-placeholder')))
    assert order() == before, 'Preview must not persist an order before release'
    assert js('return window.__walletStateWrites') == writes, 'Pointer tracking must not write storage'
    anchor = js("const r=document.querySelector('.wallet-drag-preview').getBoundingClientRect();return {x:(arguments[0]-r.left)/r.width,y:(arguments[1]-r.top)/r.height}", end['x'], end['y'])
    assert abs(anchor['x'] - .72) < .02 and abs(anchor['y'] - .68) < .02, anchor
    assert js("return document.querySelectorAll('.wallet-drag-preview').length") == 1
    wait("const n=[...document.querySelector(arguments[0]).children].find(e=>e.matches('.wallet-card-wrap:not(.wallet-drag-source)'));return (n.dataset.walletReorderId || n.querySelector('[data-wallet-id]').dataset.walletId) === arguments[1]".replace('arguments[0]', json.dumps(rail(tab))).replace('arguments[1]', json.dumps(source)))
    if not reduced:
        screenshot('drag-offset-and-open-slot-' + tab)
    pointer([{'type': 'pointerUp', 'button': 0}])
    settle()
    expected = [before[1], before[0], *before[2:]]
    assert order() == expected, (order(), expected)
    assert js('return window.__walletStateWrites') == writes + 1, 'A drop must persist exactly once'
    assert js("return document.querySelector(arguments[0]+' [data-wallet-id][aria-pressed=true]').dataset.walletId", rail(tab)) == selected, 'Dragging must not select another wallet'
    return source


try:
    visit()
    click('#open-create-wallet')
    js("const e=document.querySelector('[data-modal-field=name]');e.value='Wallet 01';e.dispatchEvent(new Event('input',{bubbles:true}))")
    click('[data-modal-action=create]')
    wait("return !!document.querySelector('.wallet-card[data-wallet-id]')")
    js("""const s=JSON.parse(localStorage.getItem('kontana_state_v1'));const template=Object.values(s.wallets)[0];
      s.wallets={};s.wallet_order=[];for(let i=0;i<20;i++){const w=JSON.parse(JSON.stringify(template));w.id='drag-'+i;w.name='Wallet '+String(i+1).padStart(2,'0');
        w.denominations.forEach(d=>d.count=i===0&&d.value_minor===2000?1:0);w.balance_minor=i===0?2000:0;s.wallets[w.id]=w;s.wallet_order.push(w.id);}
      s.settings.language='en';s.settings.appearance='light';localStorage.setItem('kt-language','en');window.__ktSetTheme('light');
      s.transactions=[{id:'old-opening',wallet_id:'drag-0',currency:'EUR',type:'incoming',amount_minor:2000,delta_minor:2000,category:'income',created_at:'1990-01-01T00:00:00Z'}];
      localStorage.setItem('kontana_state_v1',JSON.stringify(s));location.reload()""")
    wait("return document.querySelectorAll('#tab-cash [data-wallet-id]').length===20")
    baseline = financial()
    moved = drag_one()
    assert financial() == baseline
    saved = order()
    # Escape restores the preview order and removes the floating card.
    start = point(card(moved), .65, .5)
    pointer([move(start), {'type': 'pointerDown', 'button': 0}, move({'x': start['x'] + 270, 'y': start['y']})])
    wait("return !!document.querySelector('.wallet-drag-preview')")
    key_combo('\ue00c')
    settle()
    pointer([{'type': 'pointerUp', 'button': 0}])
    assert order() == saved
    assert js("return [...document.querySelectorAll('#tab-cash [data-wallet-id]')].map(e=>e.dataset.walletId)") == saved
    # Cancelling back over the same inactive card must not turn into a click.
    selected_before = js("return document.querySelector('#tab-cash [aria-pressed=true][data-wallet-id]').dataset.walletId")
    start = point(card(moved), .65, .5)
    pointer([move(start), {'type': 'pointerDown', 'button': 0}, move({'x': start['x'] + 12, 'y': start['y']})])
    wait("return !!document.querySelector('.wallet-drag-preview')")
    key_combo('\ue00c')
    settle()
    pointer([move(start), {'type': 'pointerUp', 'button': 0}])
    assert js("return document.querySelector('#tab-cash [aria-pressed=true][data-wallet-id]').dataset.walletId") == selected_before
    start = point(card(moved), .65, .5)
    outside = {'x': start['x'] + 260, 'y': start['y'] + 220}
    pointer([move(start), {'type': 'pointerDown', 'button': 0}, move(outside), {'type': 'pointerUp', 'button': 0}])
    settle()
    assert order() == saved, 'Dropping outside the strip must cancel'
    # Keyboard movement preserves focus and selected wallet independently.
    js('document.querySelector(arguments[0]).focus()', card(moved))
    key_combo('\ue014', alt=True)
    assert order()[1] == moved
    assert js('return document.activeElement.dataset.walletId') == moved
    assert js("return document.querySelector('#tab-cash [aria-pressed=true][data-wallet-id]').dataset.walletId") == 'drag-0'
    assert financial() == baseline
    print('PASS: original grab point, live slot, mouse drop, no accidental selection, Escape cancellation, keyboard order/focus', flush=True)

    # A held pointer near the edge scrolls the twenty-wallet rail.
    source = order()[0]
    start = point(card(source), .5, .5)
    edge = js("const r=document.querySelector('#tab-cash .wallet-cards').getBoundingClientRect();return {x:Math.floor(r.right-5),y:Math.round(r.top+r.height/2)}")
    pointer([move(start), {'type': 'pointerDown', 'button': 0}, move(edge, 250), {'type': 'pause', 'duration': 700}])
    assert js("return document.querySelector('#tab-cash .wallet-cards').scrollLeft") > 100
    pointer([{'type': 'pointerUp', 'button': 0}])
    settle()
    assert order().index(source) > 2
    assert js("return document.querySelector('#tab-cash .wallet-cards').scrollLeft") > 100, 'Drop must retain the scrolled position'
    assert financial() == baseline
    saved = order()
    visit()
    wait("return document.querySelectorAll('#tab-cash [data-wallet-id]').length===20")
    assert order() == saved
    print('PASS: twenty-wallet edge scrolling, retained scroll position, saved order survives reload', flush=True)

    for tab in ['pay', 'transactions']:
        click(f'.tab-btn[data-tab={tab}]')
        drag_one(tab)
        assert financial() == baseline
    print('PASS: shared ordering works in Cash, Pay and Transactions without changing cash/history', flush=True)

    # Reduced motion preserves functionality without lift/settling animations.
    command('POST', '/goog/cdp/execute', {'cmd': 'Emulation.setEmulatedMedia', 'params': {'features': [{'name': 'prefers-reduced-motion', 'value': 'reduce'}]}})
    click('.tab-btn[data-tab=cash]')
    drag_one(reduced=True)
    command('POST', '/goog/cdp/execute', {'cmd': 'Emulation.setEmulatedMedia', 'params': {'features': []}})
    command('POST', '/window/rect', {'width': 390, 'height': 844})
    js("window.__walletPointerTrace=[];for(const type of ['pointerdown','pointerup','pointercancel','gotpointercapture','lostpointercapture'])document.addEventListener(type,e=>window.__walletPointerTrace.push({type,id:e.pointerId,kind:e.pointerType,target:e.target.className}),true)")
    js("document.querySelector('#tab-cash .wallet-cards').scrollLeft=0;window.scrollTo(0,0)")
    before = order()
    start = point(card(before[0]), .6, .4)
    pointer([move(start), {'type': 'pointerDown', 'button': 0}, move({'x': 35, 'y': start['y']}, 350), {'type': 'pointerUp', 'button': 0}], 'touch')
    assert js("return document.querySelector('#tab-cash .wallet-cards').scrollLeft") > 20, 'Native touch swiping must remain available'
    assert order() == before
    assert not js("return !!document.querySelector('.wallet-drag-preview')")
    js("document.querySelector('#tab-cash .wallet-cards').scrollLeft=0")
    handle = '#tab-cash .wallet-card-wrap:first-child [data-wallet-drag-handle]'
    start = point(handle)
    pointer([move(start), {'type': 'pointerDown', 'button': 0}, move({'x': 363, 'y': start['y']}, 250), {'type': 'pause', 'duration': 200}, {'type': 'pointerUp', 'button': 0}], 'touch')
    settle()
    screenshot('touch-wallet-drop')
    assert order().index(before[0]) > 0
    assert financial() == baseline
    print('PASS: reduced motion, native mobile rail swiping, touch handle reordering', flush=True)

    command('POST', '/window/rect', {'width': 1440, 'height': 1100})
    wait('return !!navigator.serviceWorker.controller')
    errors = [entry for entry in command('POST', '/log', {'type': 'browser'}) if entry['level'] == 'SEVERE']
    assert not errors, errors
    command('POST', '/goog/cdp/execute', {'cmd': 'Network.enable', 'params': {}})
    command('POST', '/goog/cdp/execute', {'cmd': 'Network.emulateNetworkConditions', 'params': {'offline': True, 'latency': 0, 'downloadThroughput': 0, 'uploadThroughput': 0}})
    visit()
    wait("return !!document.querySelector('#tab-cash [data-wallet-id]')")
    drag_one()
    assert financial() == baseline
    print('PASS: offline reload and wallet dragging; no browser errors', flush=True)
except Exception:
    screenshot('failure')
    print('Browser errors:', command('POST', '/log', {'type': 'browser'}), flush=True)
    print('Gesture state:', js("return {trace:window.__walletPointerTrace,preview:!!document.querySelector('.wallet-drag-preview'),body:document.body.className}"), flush=True)
    raise
finally:
    command('DELETE', '')
