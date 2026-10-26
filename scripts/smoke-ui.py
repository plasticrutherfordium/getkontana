#!/usr/bin/env python3
# SPDX-License-Identifier: MPL-2.0
"""Exercise the built app in a fresh ChromeDriver profile using only Python stdlib.

Start Hugo and ChromeDriver separately. No existing browser profile is accessed.
"""
import argparse
import base64
import json
import tempfile
import time
import urllib.error
import urllib.request
from pathlib import Path

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--base-url', default='http://localhost:1314')
parser.add_argument('--driver-url', default='http://localhost:9515')
parser.add_argument('--artifacts', default='/tmp/kontana-ui-smoke')
args = parser.parse_args()
artifacts = Path(args.artifacts).resolve()
artifacts.mkdir(parents=True, exist_ok=True)


def request(method, path, data=None):
    body = json.dumps(data).encode() if data is not None else None
    req = urllib.request.Request(args.driver_url + path, data=body, headers={'Content-Type': 'application/json'}, method=method)
    try:
        result = json.load(urllib.request.urlopen(req, timeout=30))['value']
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
        time.sleep(.05)
    raise AssertionError('Timed out: ' + script)


def visit(path):
    command('POST', '/url', {'url': args.base_url.rstrip('/') + path})
    wait("return document.readyState === 'complete'")


def click(selector):
    js('const e=document.querySelector(arguments[0]); if(!e) throw Error(arguments[0]);e.click()', selector)


def fill(selector, value):
    js("const e=document.querySelector(arguments[0]);e.focus();e.value=arguments[1];e.dispatchEvent(new Event('input',{bubbles:true}))", selector, value)



def type_keys(selector, keys):
    # The app rerenders on input, so reacquire the element after every key.
    for key in keys:
        element = command('POST', '/element', {'using': 'css selector', 'value': selector})['element-6066-11e4-a52e-4f735466cecf']
        command('POST', '/element/' + element + '/value', {'text': key, 'value': [key]})


def assert_payment_stacked():
    assert js("const fields=document.querySelector('.payment-entry-grid').getBoundingClientRect();const breakdown=document.querySelector('.payment-advanced-divider').getBoundingClientRect();return breakdown.top>=fields.bottom && Math.abs(fields.left-breakdown.left)<2"), 'Breakdown must be below the fields'


def screenshot(name):
    (artifacts / (name + '.png')).write_bytes(base64.b64decode(command('GET', '/screenshot')))


def viewport(width, height):
    command('POST', '/window/rect', {'width': width, 'height': height})


def balance():
    return js("return Object.values(JSON.parse(localStorage.getItem('kontana_state_v1')).wallets)[0].balance_minor")


def fits():
    assert js('return document.documentElement.scrollWidth <= innerWidth'), 'Page overflows horizontally'


try:
    for language, path in [('en', '/'), ('es', '/es/')]:
        visit(path)
        assert js('return document.documentElement.lang') == language
        assert js("return document.querySelector('.hero .button').getAttribute('href')") == ('/app/' if language == 'en' else '/es/app/')
        assert js("return document.querySelector('.source-badge').href") == 'https://github.com/plasticrutherfordium/getkontana'
        assert js("return document.querySelector('meta[name=kontana-license]').content") == 'MPL-2.0'
        assert js("return [...document.querySelectorAll('.site-footer a')].some(a=>a.getAttribute('href')===arguments[0])", '/open-source/' if language == 'en' else '/es/open-source/')
        for theme in ['dark', 'light']:
            js('window.__ktSetTheme(arguments[0])', theme)
            for width, height, label in [(1440, 1100, 'desktop'), (390, 844, 'mobile'), (320, 760, 'small')]:
                viewport(width, height)
                fits()
                if label != 'small':
                    screenshot(f'website-{language}-{theme}-{label}')
        visit('/open-source/' if language == 'en' else '/es/open-source/')
        assert js("return document.querySelector('.prose').innerText.includes('MPL-2.0')")
        assert js("return document.querySelector('.prose').innerText.includes(arguments[0])", 'not available yet' if language == 'en' else 'aún no están disponibles')
        for width, height in [(320, 760), (390, 844), (1440, 1100)]:
            viewport(width, height)
            fits()
    print('PASS: source/licence links, planned-extras disclosure, both languages/themes at 320/390/1440px')

    viewport(1440, 1100)
    visit('/app/')
    wait("return !!document.querySelector('#open-create-wallet')")
    assert js("return APP_VERSION === document.querySelector('meta[name=kontana-app-version]').content"), 'HTML and running app versions differ'
    assert js("const v=APP_VERSION;return [...document.scripts].filter(s=>s.src).every(s=>new URL(s.src).searchParams.get('v')===v) && [...document.querySelectorAll('link[rel=stylesheet]')].every(s=>new URL(s.href).searchParams.get('v')===v)"), 'Runtime assets must use release-specific URLs'
    click('#open-create-wallet')
    fill('[data-modal-field=name]', 'Everyday wallet')
    click('[data-modal-action=create]')
    wait("return document.querySelectorAll('#tab-cash [data-wallet-id]').length === 1")
    wallet_limit_fixture = js("return localStorage.getItem('kontana_state_v1')")
    for number in range(2, 21):
        click('#tab-cash [data-wallet-add="1"]')
        fill('[data-modal-field=name]', f'Wallet {number:02}')
        click('[data-modal-action=create]')
        wait(f"return document.querySelectorAll('#tab-cash [data-wallet-id]').length === {number}")
    visit('/app/')
    wait("return document.querySelectorAll('#tab-cash [data-wallet-id]').length === 20")
    assert js("return Object.keys(JSON.parse(localStorage.getItem('kontana_state_v1')).wallets).length") == 20
    for width in [1440, 390, 320]:
        viewport(width, 1100)
        fits()
    viewport(1440, 1100)
    click('#tab-cash [data-wallet-add="1"]')
    wait("return !!document.querySelector('[data-modal-action=ok]')")
    assert js("return document.querySelector('.modal-card').innerText.includes('(20)')")
    click('[data-modal-action=ok]')
    click('#open-settings')
    click('[data-settings-tab=general]')
    click('[data-language=es]')
    click('#settings-close')
    click('.tab-btn[data-tab=pay]')
    assert js("return document.querySelectorAll('#tab-pay [data-wallet-id]').length") == 20
    click('#tab-pay [data-wallet-add="1"]')
    wait("return !!document.querySelector('[data-modal-action=ok]')")
    assert js("return document.querySelector('.modal-card').innerText.includes('monederos (20)')")
    click('[data-modal-action=ok]')
    assert js("return Object.keys(JSON.parse(localStorage.getItem('kontana_state_v1')).wallets).length") == 20
    js("localStorage.setItem('kontana_state_v1',arguments[0]);localStorage.setItem('kt-language','en');location.reload()", wallet_limit_fixture)
    wait("return document.querySelectorAll('#tab-cash [data-wallet-id]').length === 1")
    print('PASS: created and reloaded 20 wallets; 21st blocked in Cash/Pay with English/Spanish limit messages; selector fits desktop/mobile')

    # A deterministic old-history fixture in this fresh test profile only.
    js("""const s=JSON.parse(localStorage.getItem('kontana_state_v1'));const w=Object.values(s.wallets)[0];
      const counts={5000:4,2000:5,1000:2,200:2,50:1};w.denominations.forEach(d=>d.count=counts[d.value_minor]||0);
      w.balance_minor=32450;s.settings.show_denominations_on_hand_only=true;s.settings.show_cents=false;
      s.settings.language='en';s.settings.appearance='dark';localStorage.setItem('kt-language','en');window.__ktSetTheme('dark');
      s.transactions=[{id:'old-opening',wallet_id:w.id,wallet_name:w.name,currency:'EUR',type:'incoming',amount_minor:32450,delta_minor:32450,created_at:'1990-01-01T12:00:00Z',category:'income',note:'Opening cash',breakdown:w.denominations.filter(d=>d.count)}];
      localStorage.setItem('kontana_state_v1',JSON.stringify(s));location.reload()""")
    wait("return !!document.querySelector('.inventory-card')")
    # Holdings and unavailable values are labelled, even when zero rows are shown.
    click('#toggle-denom-visibility')
    assert js("return [...document.querySelectorAll('.inventory-group-heading')].map(e=>e.innerText)") == ['In your wallet', 'Not in your wallet']
    assert js("return [...document.querySelectorAll('.cash-denom-table [role=columnheader]')].map(e=>e.innerText)") == ['Denomination', 'Quantity', 'Subtotal']
    assert js("return document.querySelector('.cash-denom-table .has-count .denom-count-readonly').innerText") == '4 bills'
    assert js("return document.querySelector('.cash-denom-table .missing-count .denom-count-readonly').innerText") == '0 bills'
    assert js("return document.querySelector('.denom-total-row').innerText.includes('Bills total')")
    click('#segment-coins')
    assert js("return document.querySelector('.cash-denom-table .has-count .denom-count-readonly').innerText") == '2 coins'
    assert js("return document.querySelector('.denom-total-row').innerText.includes('Coins total')")
    screenshot('app-cash-coins-dark-desktop')
    click('#segment-bills')
    screenshot('app-cash-dark-desktop')
    assert balance() == 32450
    click('.tab-btn[data-tab=pay]')
    for amount in ['24.50', '24,50']:
        fill('#payment-amount', '')
        type_keys('#payment-amount', amount)
        assert js("return document.querySelector('#payment-amount').value") == '€24.50'
        type_keys('#payment-amount', '9')
        assert js("return document.querySelector('#payment-amount').value") == '€24.50', 'Third decimal must be rejected'
    type_keys('#payment-amount', '\ue003')  # Backspace preserves the first decimal digit.
    assert js("return document.querySelector('#payment-amount').value") == '€24.5'
    type_keys('#payment-amount', '0')
    # Insert in the whole-number portion without jumping to the end.
    js("const e=document.querySelector('#payment-amount');e.setSelectionRange(2,2)")
    type_keys('#payment-amount', '1')
    assert js("return document.querySelector('#payment-amount').value") == '€214.50'
    assert js("return document.querySelector('#payment-amount').selectionStart") == 3
    type_keys('#payment-amount', '\ue003')
    assert js("return document.querySelector('#payment-amount').value") == '€24.50'
    for width in [1440, 1024, 390, 320]:
        viewport(width, 1100)
        fits()
        assert_payment_stacked()
    viewport(1440, 1100)
    print('PASS: real EUR decimal/comma typing, precision limit, deletion, caret editing, stacked payment at all widths')
    wait("return !!document.querySelector('#payment-use-suggested')")
    js('window.scrollTo(0,0)')
    screenshot('app-pay-dark-desktop')
    click('#payment-use-suggested')
    wait("return !!document.querySelector('#new-transaction')")
    assert balance() == 30000
    click('#new-transaction')
    fill('#payment-amount', '6.50')
    click('#payment-use-suggested')
    wait("return !!document.querySelector('[data-modal-action=confirm_suggested]')")
    screenshot('app-change-confirmation')
    assert balance() == 30000, 'Preview must not commit tender'
    click('[data-modal-action=cancel]')
    assert balance() == 30000
    click('#payment-use-suggested')
    click('[data-modal-action=confirm_suggested]')
    wait("return !!document.querySelector('#new-transaction')")
    assert balance() == 29350
    click('#revert-last-transaction')
    wait("return !!document.querySelector('[data-modal-action=confirm]')")
    click('[data-modal-action=confirm]')
    wait('return !document.querySelector("#app-modal-root [role=dialog]")')
    assert balance() == 30000
    print('PASS: wallet creation, exact payment, change preview/cancel/commit, latest reversal')

    click('.tab-btn[data-tab=transactions]')
    assert js("return document.querySelector('#tab-transactions').innerText.includes('1990')")
    assert js("return document.querySelector('.history-summary').innerText.includes('324.50')")
    click('.tx-row')
    assert js("return getComputedStyle(document.querySelector('.tx-details-row.open')).display") == 'table-row'
    screenshot('app-history-dark-desktop')
    click('#open-settings')
    click('[data-settings-tab=data]')
    assert js("return document.querySelector('.settings-modal').innerText.includes('no time limit')")
    screenshot('app-backup-dark-desktop')
    with tempfile.TemporaryDirectory(prefix='kontana-downloads-') as downloads:
        command('POST', '/goog/cdp/execute', {'cmd': 'Browser.setDownloadBehavior', 'params': {'behavior': 'allow', 'downloadPath': downloads}})
        click('#export-json')
        click('#export-pdf')
        deadline = time.monotonic() + 15
        while time.monotonic() < deadline and not (list(Path(downloads).glob('*.json')) and list(Path(downloads).glob('*.pdf'))):
            time.sleep(.05)
        backup = next(Path(downloads).glob('*.json'))
        assert next(Path(downloads).glob('*.pdf')).read_bytes().startswith(b'%PDF')
        state = json.loads(backup.read_text())
        assert len(state['transactions']) == 2 and state['transactions'][0]['created_at'].startswith('1990')
        element = command('POST', '/element', {'using': 'css selector', 'value': '#import-json-file'})['element-6066-11e4-a52e-4f735466cecf']
        command('POST', '/element/' + element + '/value', {'text': str(backup), 'value': list(str(backup))})
        wait("return !!document.querySelector('[data-modal-action=replace]')")
        click('[data-modal-action=replace]')
        wait("return !!document.querySelector('[data-modal-action=confirm]')")
        click('[data-modal-action=confirm]')
        wait("return !!document.querySelector('[data-modal-action=ok]')")
        click('[data-modal-action=ok]')
        wait("return !!document.querySelector('#open-settings') && !document.querySelector('[role=dialog]')")
    assert balance() == 30000
    print('PASS: complete 1990 history, running ledger, JSON/PDF export, confirmed backup restore')

    calculation_fixture = js("return localStorage.getItem('kontana_state_v1')")
    js("""const s=JSON.parse(arguments[0]);const w=Object.values(s.wallets)[0];
      const counts={10000:1,2000:2,200:1,100:1};w.denominations.forEach(d=>d.count=counts[d.value_minor]||0);
      w.balance_minor=14300;s.settings.default_strategy='greedy';s.settings.coins_rule='off';s.settings.single_cover=true;
      s.settings.payment_strategies=true;s.settings.change_suggestions=true;s.settings.denomination_order='largest_first';
      s.transactions=[{id:'calculation-opening',wallet_id:w.id,currency:'EUR',type:'incoming',amount_minor:14300,delta_minor:14300,created_at:'1990-01-01T00:00:00Z'}];
      localStorage.setItem('kontana_state_v1',JSON.stringify(s));location.reload()""", calculation_fixture)
    wait("return !!document.querySelector('.inventory-card')")
    click('.tab-btn[data-tab=pay]')
    for strategy in ['greedy', 'lex', 'equalisation']:
        for order in ['largest_first', 'smallest_first']:
            for rule in ['off', 'avoid', 'prefer']:
                click('#open-settings')
                click('[data-settings-tab=assistance]')
                click(f'[data-strategy={strategy}]')
                click(f'[data-denom-order={order}]')
                click('[data-coins-toggle=off]' if rule == 'off' else '[data-coins-toggle=on]')
                if rule != 'off':
                    click(f'[data-coins-mode={rule}]')
                click('#settings-close')
                fill('#payment-amount', '12.50')
                assert js("return [...document.querySelectorAll('#tab-pay .payment-breakdown-inline .breakdown li')].map(e=>e.innerText)") == ['€20 × 1\n€20'], (strategy, order, rule)
                assert js("return document.querySelector('#tab-pay .allocation-summary').innerText.includes('€20')")
                assert js("return document.querySelector('#tab-pay').innerText.includes('€7.50')")
                assert balance() == 14300
    screenshot('app-corrected-1250-cover')
    click('#payment-use-suggested')
    wait("return !!document.querySelector('[data-modal-action=confirm_suggested]')")
    assert js("return document.querySelector('.modal-card').innerText.includes('€7.50')")
    assert balance() == 14300
    click('[data-modal-action=confirm_suggested]')
    wait("return !!document.querySelector('#new-transaction')")
    assert balance() == 13050
    assert js("const s=JSON.parse(localStorage.getItem('kontana_state_v1'));const t=s.transactions.at(-1);return t.amount_minor===1250 && t.delta_minor===-1250 && t.breakdown.length===1 && t.breakdown[0].value_minor===2000 && t.breakdown[0].count===1 && t.change_expected_minor===750 && t.change_received_minor===750 && t.change_breakdown.reduce((n,d)=>n+d.value_minor*d.count,0)===750")
    click('#revert-last-transaction')
    click('[data-modal-action=confirm]')
    wait('return !document.querySelector("#app-modal-root [role=dialog]")')
    assert balance() == 14300
    js("""const s=JSON.parse(arguments[0]);const w=Object.values(s.wallets)[0];
      const counts={5000:1,2000:3,500:2};w.denominations.forEach(d=>d.count=counts[d.value_minor]||0);
      w.balance_minor=12000;s.settings.default_strategy='lex';s.settings.coins_rule='off';s.settings.denomination_order='largest_first';
      s.transactions=[{id:'balance-opening',wallet_id:w.id,currency:'EUR',type:'incoming',amount_minor:12000,delta_minor:12000,created_at:'1990-01-01T00:00:00Z'}];
      localStorage.setItem('kontana_state_v1',JSON.stringify(s));location.reload()""", calculation_fixture)
    wait("return !!document.querySelector('.inventory-card')")
    click('.tab-btn[data-tab=pay]')
    fill('#payment-amount', '60.00')
    for strategy, expected in [('lex', ['€50 × 1\n€50', '€5 × 2\n€10']), ('equalisation', ['€20 × 3\n€60'])]:
        click('#open-settings')
        click('[data-settings-tab=assistance]')
        click(f'[data-strategy={strategy}]')
        click('#settings-close')
        assert js("return [...document.querySelectorAll('#tab-pay .payment-breakdown-inline .breakdown li')].map(e=>e.innerText)") == expected, strategy
        assert balance() == 12000
    js("localStorage.setItem('kontana_state_v1',arguments[0]);location.reload()", calculation_fixture)
    wait("return !!document.querySelector('.inventory-card')")
    print('PASS: distinct Preserve/Balance tie-breaks update immediately through actual strategy controls')
    print('PASS: EUR 143 → EUR 20 tender / EUR 7.50 change for all 18 strategy/order/coin combinations; commit EUR 130.50 and reversal verified')

    input_fixture = js("return localStorage.getItem('kontana_state_v1')")
    # Currency-specific input limits, using a temporary fixture in this profile.
    js("const s=JSON.parse(arguments[0]);const w=Object.values(s.wallets)[0];w.currency='JPY';localStorage.setItem('kontana_state_v1',JSON.stringify(s));location.reload()", input_fixture)
    wait("return !!document.querySelector('.inventory-card')")
    click('.tab-btn[data-tab=pay]')
    type_keys('#payment-amount', '1200')
    type_keys('#payment-amount', '.')
    assert js("return document.querySelector('#payment-amount').value") == '¥1200'
    assert js("return document.querySelector('#payment-amount').inputMode") == 'numeric'
    js("const s=JSON.parse(arguments[0]);s.settings.language='es';s.settings.appearance='light';s.settings.payment_strategies=false;localStorage.setItem('kt-language','es');window.__ktSetTheme('light');localStorage.setItem('kontana_state_v1',JSON.stringify(s));location.reload()", input_fixture)
    wait("return !!document.querySelector('.inventory-card')")
    click('.tab-btn[data-tab=pay]')
    type_keys('#payment-amount', '24,50')
    assert js("return document.querySelector('#payment-amount').value") == '€24,50'
    type_keys('#payment-amount', '9')
    assert js("return document.querySelector('#payment-amount').value") == '€24,50'
    js('window.scrollTo(0,0)')
    screenshot('app-pay-light-es-desktop')
    click('#mode-incoming')
    assert not js("return !!document.querySelector('#payment-amount')"), 'Count-first incoming uses the counted total'
    assert_payment_stacked()
    fill('input[data-alloc-denom="2000"]', '')
    type_keys('input[data-alloc-denom="2000"]', '12')
    assert js('return document.activeElement.dataset.allocDenom') == '2000'
    assert js("return document.querySelector('input[data-alloc-denom=\"2000\"]').value") == '12'
    fill('input[data-alloc-denom="2000"]', '1')
    click('#payment-coins')
    fill('input[data-alloc-denom="50"]', '')
    type_keys('input[data-alloc-denom="50"]', '3')
    assert js("return document.querySelector('.allocation-summary').innerText.includes('21,50')")
    click('#payment-bills')
    js('window.scrollTo(0,0)')
    screenshot('app-incoming-light-es-desktop')
    for theme in ['light', 'dark']:
        js('window.__ktSetTheme(arguments[0])', theme)
        for width in [1440, 390, 320]:
            viewport(width, 1100)
            fits()
            assert_payment_stacked()
            assert js("return [...document.querySelectorAll('.payment-breakdown-inline .denom-header-row p')].map(e=>e.innerText)") == ['Denominación', 'Cantidad', 'Subtotal']
        viewport(390, 844)
        js('window.scrollTo(0,0)')
        screenshot(f'app-incoming-{theme}-es-mobile')
    viewport(1440, 1100)
    js("localStorage.setItem('kontana_state_v1',arguments[0]);localStorage.setItem('kt-language','en');window.__ktSetTheme('dark');location.reload()", input_fixture)
    wait("return !!document.querySelector('.inventory-card')")
    print('PASS: JPY whole amounts, Spanish comma typing, count-first incoming layout in both themes at desktop/mobile widths')

    click('#tab-cash [data-wallet-action]')
    click('[data-modal-action=denoms]')
    wait("return !!document.querySelector('[data-modal-action=edit]')")
    click('[data-modal-action=edit]')
    wait("return !!document.querySelector('#cancel-edit-mode')")
    fill('#tab-cash input[data-denom="2000"]', '')
    type_keys('#tab-cash input[data-denom="2000"]', '12')
    assert js("return document.querySelector('#tab-cash input[data-denom=\"2000\"]').value") == '12'
    assert js("return document.activeElement.dataset.denom") == '2000'
    assert js("return document.querySelector('#finish-edit-mode').disabled")
    click('#cancel-edit-mode')
    assert balance() == 30000
    saved = js("return localStorage.getItem('kontana_state_v1')")
    js("""const s=JSON.parse(localStorage.getItem('kontana_state_v1'));const w=Object.values(s.wallets)[0];
      s.settings.app_mode='budget';s.settings.show_cents=true;w.count_mode='total';w.balance_minor=27500;
      w.budget={enabled:true,cadence:'weekly',envelopes:[{id:'food',name:'Food',target_minor:10000,tracking_level:'all'}]};
      s.transactions.push({id:'budget-spend',wallet_id:w.id,wallet_name:w.name,currency:w.currency,type:'spend',amount_minor:2500,delta_minor:-2500,envelope_id:'food',created_at:new Date().toISOString(),category:'food'});
      localStorage.setItem('kontana_state_v1',JSON.stringify(s));location.reload()""")
    wait("return !!document.querySelector('.envelope-progress')")
    assert js("return document.querySelector('.envelope-progress').getAttribute('aria-valuenow')") == '25'
    assert js("return document.querySelector('.envelope-remaining').innerText.includes('75.00')")
    screenshot('app-budget-dark-desktop')
    click('#budget-checkin-now')
    wait("return !!document.querySelector('[data-modal-action=confirm]')")
    click('[data-modal-action=confirm]')
    wait("return !!document.querySelector('[data-modal-action=ok]')")
    click('[data-modal-action=ok]')
    assert js("return JSON.parse(localStorage.getItem('kontana_state_v1')).checkins.length") == 1
    js("localStorage.setItem('kontana_state_v1',arguments[0]);location.reload()", saved)
    wait("return !!document.querySelector('.inventory-card')")
    print('PASS: count-edit focus/reconciliation/cancel, real envelope progress, Budget check-in')

    click('#open-settings')
    click('[data-settings-tab=general]')
    assert js("return document.querySelector('.app-open-source').innerText.includes('not available yet')")
    assert js("return document.querySelector('.app-open-source a').href") == 'https://github.com/plasticrutherfordium/getkontana'
    click('[data-appearance=light]')
    click('[data-language=es]')
    assert js('return document.documentElement.lang') == 'es'
    click('#settings-close')
    viewport(390, 844)
    fits()
    screenshot('app-cash-light-es-mobile')
    viewport(320, 760)
    fits()
    viewport(390, 844)
    assert js("return document.querySelector('.app-bottom-nav').innerText.includes('Movimientos')")
    click('#open-settings')
    screenshot('app-settings-light-es-mobile')
    click('#settings-close')
    visit('/es/')
    assert js('return document.documentElement.dataset.theme') == 'light'
    print('PASS: settings sections, Spanish navigation, shared light-theme persistence')

    visit('/es/app/')
    wait('return !!navigator.serviceWorker.controller')
    cached = command('POST', '/execute/async', {'script': "const done=arguments[0];caches.keys().then(keys=>caches.open(keys.filter(k=>k.startsWith('kontana-v')).at(-1))).then(c=>c.keys()).then(keys=>done(keys.map(k=>new URL(k.url).pathname)))", 'args': []})
    for asset in ['/app/', '/es/app/', '/fonts/fonts.css', '/app-phosphor.css', '/app/accessibility.js', '/app/ui/wallet-reorder.js', '/open-source/', '/es/open-source/', '/licenses/MPL-2.0.txt', '/licenses/THIRD_PARTY_NOTICES.txt']:
        assert asset in cached, 'Missing offline asset: ' + asset
    errors = [entry for entry in command('POST', '/log', {'type': 'browser'}) if entry['level'] == 'SEVERE']
    assert not errors, errors
    command('POST', '/goog/cdp/execute', {'cmd': 'Network.enable', 'params': {}})
    command('POST', '/goog/cdp/execute', {'cmd': 'Network.emulateNetworkConditions', 'params': {'offline': True, 'latency': 0, 'downloadThroughput': 0, 'uploadThroughput': 0}})
    visit('/es/app/')
    wait("return !!document.querySelector('.inventory-card')")
    assert balance() == 30000
    screenshot('app-offline-es-mobile')
    visit('/es/open-source/')
    assert js("return document.querySelector('.prose').innerText.includes('MPL-2.0')")
    screenshot('licensing-offline-es-mobile')
    command('POST', '/goog/cdp/execute', {'cmd': 'Network.emulateNetworkConditions', 'params': {'offline': False, 'latency': 0, 'downloadThroughput': -1, 'uploadThroughput': -1}})
    print('PASS: required assets cached, offline Spanish app reload, no online console errors')
    print('Screenshots: ' + str(artifacts))
finally:
    command('DELETE', '')
