"""T4/T5: build data/video.json from the real word timings (data/alignment.json).

Every frame value used by the Remotion project comes from this file:
- words / sentences / caption pages (global frames)
- chapters (composition boundaries)
- scenes (start/end) and named cues (anchored to spoken words)
- sfx cue list (consumed by the offline audio mix, scripts/mix_audio.py)

Global time = voice time + HEAD (0.5 s of near-silence before "Listen.", 08 sec. 4).
"""
import json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
FPS = 30
HEAD = 0.5
TAIL_END = 193.0  # end-screen hold after the last word (185.2 s voice + head)

al = json.load(open(os.path.join(ROOT, 'data', 'alignment.json')))
W = al['words']


def norm(s):
    return re.sub(r"[^a-z0-9]", "", s.lower().replace('î', 'i'))


NW = [norm(w['text']) for w in W]
_cursor = [0]


def find(phrase, after=None):
    """index of the first word of `phrase`, searching from the cursor."""
    toks = [norm(t) for t in phrase.split()]
    start = _cursor[0] if after is None else after
    for i in range(start, len(NW) - len(toks) + 1):
        if NW[i:i + len(toks)] == toks:
            return i, i + len(toks) - 1
    raise SystemExit('phrase not found: ' + phrase)


def t2f(t):
    return int(round(t * FPS))


def ws(phrase, end=False, off=0.0):
    """global time (s) of the start (or end) of phrase."""
    a, b = find(phrase)
    return (W[b]['end'] if end else W[a]['start']) + HEAD + off


# ---------------------------------------------------------------- cues
# Cues are written in story order; the cursor walks forward through the script.
C = {}


def cue(name, phrase, end=False, off=0.0, advance=True):
    a, b = find(phrase)
    t = (W[b]['end'] if end else W[a]['start']) + HEAD + off
    C[name] = t2f(t)
    if advance:
        _cursor[0] = a
    return C[name]


def mid(name, a, b):
    C[name] = (C[a] + C[b]) // 2


C['start'] = 0
cue('listen', 'Listen')
cue('siren', 'A siren races')
cue('toward', 'toward you')
cue('moment', 'The moment it passes')
cue('passes', 'it passes')
cue('drops', 'note drops', end=False, off=0.25)
cue('tinyDrop', 'That tiny drop')
cue('clue', 'holds the clue')
cue('universe0', 'the whole universe')
cue('growing0', 'is growing', end=True)
# chapter 1
cue('picture', 'Picture the ambulance driver')
cue('toHer', 'To her')
cue('steady', 'one steady note')
cue('butYou', 'But you, on the')
cue('sidewalk', 'on the sidewalk')
cue('high', 'high as it comes')
cue('low', 'and low as it goes')
cue('sameSiren', 'Same siren')
cue('twoSounds', 'Two sounds')
cue('bothRight', "And you're both right")
cue('right', 'both right', end=True)
cue('whatChanged', 'So what changed')
cue('notSiren', 'Not the siren')
cue('something', 'Something in the air')
cue('air', 'the air between')
cue('ch1End', 'between you', end=True)
# chapter 2
cue('soundTravels', 'Sound travels in waves')
cue('ripples', 'like ripples on a pond')
cue('bug', 'Picture a bug')
cue('tapping', 'tapping the water')
cue('perfect', 'Perfect rings spread')
cue('swims', 'Now the bug swims')
cue('inFront', 'The rings in front')
cue('squeezed', 'squeezed together')
cue('behind', 'The rings behind')
cue('stretched', 'stretched apart')
cue('soundSame', 'Sound does the same')
cue('squeezedWaves', 'Squeezed waves reach')
cue('higher', 'sounds higher')
cue('stretchedWaves', 'Stretched waves arrive')
cue('lower', 'sounds lower')
cue('neverSpeed', 'The waves never speed up')
cue('spacing', 'Only their spacing changes')
cue('y1842', 'In eighteen forty-two')
cue('frail', 'a frail math professor')
cue('prague', 'in Prague')
cue('hisName', 'His name was')
cue('nearlyQuit', 'nearly quit')
cue('america', 'moved to America')
cue('threeYears', 'Three years later')
cue('dutch', 'a Dutch scientist')
cue('horns', 'put horn players')
cue('trainCar', 'open train car')
cue('people', 'People beside the track')
cue('bend', 'notes bend')
cue('twist1', "But here's the twist")
cue('didnt', "Doppler didn't name")
cue('heNamed', 'He named it after')
cue('stars1', 'light of stars')
cue('ch2End', 'light of stars', end=True)
# chapter 3
cue('lightWave', 'Light is a wave too')
cue('spacingColor', 'spacing means color')
cue('squeezeWaves', 'Squeeze the waves')
cue('blue', 'toward blue')
cue('stretchThem', 'Stretch them')
cue('red1', 'toward red')
cue('redshift', "That's a redshift")
cue('guessedWrong', 'Doppler guessed wrong')
cue('tooSmall', 'The shift was far too small')
cue('predicted', 'But he predicted')
cue('measure', 'to measure how stars move')
cue('theyDid', 'They did')
cue('barcode', 'Starlight carries a barcode')
cue('atoms', 'set by its atoms')
cue('slides', 'If the barcode slides')
cue('movingAway', 'the source is moving away')
cue('tens', 'In the nineteen tens')
cue('slipher', 'Vesto Slipher read')
cue('faint', 'in faint spirals')
cue('andromeda', 'Andromeda was coming')
cue('kms300', 'about three hundred')
cue('nearlyAll', 'But nearly all the others')
cue('rushing', 'rushing away')
cue('why', 'Why would almost everything')
cue('flee', 'flee from us')
cue('ch3End', 'flee from us', end=True)
# chapter 4
cue('enter', 'Enter Edwin Hubble')
cue('hubble', 'Edwin Hubble')
cue('y1923', 'In nineteen twenty-three')
cue('telescope', 'most powerful telescope')
cue('proved', 'he proved Andromeda')
cue('wholeGalaxy', 'a whole galaxy')
cue('farBeyond', 'far beyond our own')
cue('next', 'Next, he measured')
cue('howFar', 'how far away')
cue('y1929', 'In nineteen twenty-nine')
cue('distances', 'his distances')
cue('speeds', 'their speeds')
cue('mostSlipher', "most of them Slipher's")
cue('pattern', 'A pattern jumped out')
cue('farther', 'The farther a galaxy is')
cue('faster', 'the faster it moves away')
cue('notJust', 'Not just from us')
cue('eachOther', 'From each other')
cue('expanding', 'The universe is expanding')
cue('belgian', 'A Belgian priest')
cue('lemaitre', 'Georges')
cue('twoYears', 'two years earlier')
cue('hubblesChart', "But Hubble's chart")
cue('convinced', 'convinced astronomers')
cue('twist2', 'And one last twist')
cue('farGalaxies', "Far galaxies aren't")
cue('sirensStreet', 'like sirens down a street')
cue('spaceItself', 'Space itself is stretching')
cue('dough', 'like rising dough')
cue('raisins', 'pulling raisins apart')
cue('theirLight', 'Their light stretches')
cue('towardRed2', 'toward red')
cue('ch4End', 'toward red', end=True)
# close
cue('soNext', 'So the next time')
cue('dropsNote', 'drops its note')
cue('asPasses', 'as it passes')
cue('listen2', 'listen')
cue('hearing', "You're hearing the same clue")
cue('universe2', 'the universe is growing')
cue('lastWord', 'is growing', end=True)
C['end'] = t2f(TAIL_END)

# ---------------------------------------------------------------- chapters
# boundaries sit in the pause between the last word of one chapter and the first of the next
def gap(a_end, b_start):
    return (C[a_end] + C[b_start]) // 2


CH = [
    dict(id='Ch0-ColdOpen', title='Cold open', start=0, end=gap('growing0', 'picture')),
]
CH.append(dict(id='Ch1-Siren', title='1 · One Siren, Two Sounds', start=CH[-1]['end'], end=gap('ch1End', 'soundTravels')))
CH.append(dict(id='Ch2-Ripples', title='2 · Ripples', start=CH[-1]['end'], end=gap('ch2End', 'lightWave')))
CH.append(dict(id='Ch3-Light', title='3 · Light Has a Siren Too', start=CH[-1]['end'], end=gap('ch3End', 'enter')))
CH.append(dict(id='Ch4-Universe', title='4 · The Running Universe', start=CH[-1]['end'], end=gap('ch4End', 'soNext')))
CH.append(dict(id='Ch5-Close', title='Close', start=CH[-1]['end'], end=C['end']))
for k, ch in enumerate(CH):
    C['ch%d' % k] = ch['start']

# ---------------------------------------------------------------- scenes
# (id, chapter, start cue, end cue, beats 07, shot, environment, camera, transition-in)
S = [
    ('s0_void', 0, 'start', 'siren', '1', 'CU', 'Black void + ear', 'slow push-in', 'fade from black'),
    ('s0_street', 0, 'siren', 'tinyDrop', '2-3', 'WS', 'Sunset Street (dusk)', 'pan follows ambulance, handheld', 'ring match-cut'),
    ('s0_tilt', 0, 'tinyDrop', 'universe0', '4', 'WS->sky', 'Street -> sky', 'whip-tilt up', 'continuous'),
    ('s0_space', 0, 'universe0', 'ch1', '5', 'WS', 'Deep Space', 'slow drift + push', 'rings become stars'),
    ('s1_cab', 1, 'ch1', 'toHer', '6', 'MS', 'Inside the Cab', 'gentle push, road bump shake', 'hard cut'),
    ('s1_roof', 1, 'toHer', 'butYou', '7', 'INS/MS', 'Ambulance side, scrolling street', 'track with vehicle', 'hard cut'),
    ('s1_split', 1, 'butYou', 'whatChanged', '8-10', 'split', 'Cab | Sidewalk', 'split drift, divider wipe', 'split wipe'),
    ('s1_notsiren', 1, 'whatChanged', 'something', '11', 'MS', 'Street, parked ambulance roof', 'punch-in', 'hard cut'),
    ('s1_air', 1, 'something', 'ch2', '12', 'low WS', 'Street ground level', 'drop low + slow dolly', 'camera drop'),
    ('s2_pond', 2, 'ch2', 'bug', '13', 'TD', 'Pond top-down', 'slow push-in', 'ring match-cut'),
    ('s2_still', 2, 'bug', 'swims', '14-15', 'TD', 'Pond', 'settle + hold drift', 'continuous'),
    ('s2_swim', 2, 'swims', 'soundSame', '16-18', 'TD', 'Pond', 'pan with Skipper', 'continuous'),
    ('s2_compare', 2, 'soundSame', 'squeezedWaves', '19', 'split', 'Pond | Street', 'split slide-in', 'slide split'),
    ('s2_ear', 2, 'squeezedWaves', 'neverSpeed', '20-21', 'INS', 'Ear insert, abstract', 'slow push', 'iris from ear'),
    ('s2_speed', 2, 'neverSpeed', 'y1842', '22', 'diagram', 'Diagram stage', 'lateral track', 'hard cut'),
    ('s2_study', 2, 'y1842', 'hisName', '23', 'MS', 'Prague Study 1842', 'push-in', 'ripple -> candle glow'),
    ('s2_suitcase', 2, 'hisName', 'threeYears', '24', 'MS sepia', 'Study memory (sepia)', 'slow drift', 'sepia dissolve'),
    ('s2_train', 2, 'threeYears', 'people', '25', 'WS', 'Dutch Railway 1845', 'pan with train', 'whip pan'),
    ('s2_observers', 2, 'people', 'twist1', '26', 'MS', 'Railway trackside', 'low angle, train passes', 'hard cut'),
    ('s2_twist', 2, 'twist1', 'didnt', '27', 'sting', 'Twist page-curl', 'none (graphic)', 'page curl'),
    ('s2_paper', 2, 'didnt', 'ch3', '28', 'CU->window', 'Study, title page', 'tilt to window, push through', 'page curl out'),
    ('s3_lab', 3, 'ch3', 'squeezeWaves', '29', 'WS', 'Light Lab', 'drift', 'push-through stars'),
    ('s3_blue', 3, 'squeezeWaves', 'stretchThem', '30', 'WS', 'Light Lab', 'track star', 'continuous'),
    ('s3_galaxy', 3, 'stretchThem', 'guessedWrong', '31-32', 'MS', 'Deep space (lab dissolves)', 'push then pull', 'star becomes galaxy'),
    ('s3_toosmall', 3, 'guessedWrong', 'predicted', '33', 'MS', 'Prague Study', 'push to window', 'hard cut'),
    ('s3_quill', 3, 'predicted', 'barcode', '34-35', 'MS->WS', 'Study -> night sky', 'follow quill arrow', 'continuous'),
    ('s3_barcode', 3, 'barcode', 'tens', '36-37', 'INS', 'Light Lab barcode', 'slow push', 'hard cut'),
    ('s3_dome', 3, 'tens', 'faint', '38a', 'WS', 'Lowell dome, pine hill, night', 'crane-in to slit', 'barcode wipe'),
    ('s3_slipher', 3, 'faint', 'andromeda', '38b', 'MS', 'Inside dome', 'push', 'hard cut'),
    ('s3_andromeda', 3, 'andromeda', 'nearlyAll', '39', 'WS', 'Deep space', 'push as it approaches', 'plate -> sky'),
    ('s3_map', 3, 'nearlyAll', 'ch4', '40-41', 'WS', 'Sky map', 'pull back', 'pull back'),
    ('s4_dome', 4, 'ch4', 'y1923', '42', 'low WS', 'Mount Wilson dome', 'tilt up', 'hard cut'),
    ('s4_plate', 4, 'y1923', 'proved', '43a', 'INS', 'Glass plate light table', 'slow push', 'hard cut'),
    ('s4_scale', 4, 'proved', 'next', '43b', 'WS', 'Deep space scale bar', 'pull to wide', 'plate -> space'),
    ('s4_tapes', 4, 'next', 'y1929', '44', 'WS', 'Deep space galaxy row', 'lateral track', 'continuous drift'),
    ('s4_chart', 4, 'y1929', 'notJust', '45-47', 'MS', 'Chart Room', 'push, punch-in on farther', 'chalk wipe'),
    ('s4_grid', 4, 'notJust', 'expanding', '48', 'WS', 'Expansion sheet', 'slight rotate', 'hard cut'),
    ('s4_peak', 4, 'expanding', 'belgian', '49', 'WS', 'Galaxy field', 'fast pull back', 'scale-through'),
    ('s4_lemaitre', 4, 'belgian', 'twist2', '50-51', 'split', 'Study 1927 | Chart room 1929', 'drift', 'panel slide'),
    ('s4_twist', 4, 'twist2', 'farGalaxies', '52', 'sting', 'Twist page-curl', 'none (graphic)', 'page curl'),
    ('s4_road', 4, 'farGalaxies', 'spaceItself', '53', 'WS', 'Starry road', 'track tiny ambulance', 'page curl out'),
    ('s4_dough', 4, 'spaceItself', 'theirLight', '54', 'MS', 'Kitchen counter -> space', 'push, dissolve', 'hard cut'),
    ('s4_ray', 4, 'theirLight', 'ch5', '55', 'WS', 'Stretching space sheet', 'lateral track along ray', 'dough -> space'),
    ('s5_street', 5, 'ch5', 'hearing', '56', 'WS', 'Sunset Street (dusk)', 'handheld, pan with ambulance', 'match-cut ring'),
    ('s5_sky', 5, 'hearing', 'end', '57', 'WS->sky', 'Street -> night sky', 'crane-up, final hold', 'continuous'),
]
scenes = []
for sid, ch, a, b, beats, shot, env, cam, tr in S:
    scenes.append(dict(id=sid, chapter=ch, start=C[a], end=C[b], beats=beats, shot=shot, env=env, camera=cam, transitionIn=tr))
for i in range(1, len(scenes)):
    assert scenes[i]['start'] == scenes[i - 1]['end'], (scenes[i - 1]['id'], scenes[i]['id'])
    assert scenes[i]['end'] > scenes[i]['start'], scenes[i]['id']

# ---------------------------------------------------------------- captions
# Pages of 2-5 words, broken at punctuation; never across sentences.
words = []
for i, w in enumerate(W):
    words.append(dict(i=i, text=w['text'], s=t2f(w['start'] + HEAD), e=max(t2f(w['end'] + HEAD), t2f(w['start'] + HEAD) + 2), ch=w['chapter']))
sentences = []
cur = None
for i, w in enumerate(W):
    if cur is None or w['sentence'] != cur['text'] or i == 0 or W[i - 1]['sentence'] != w['sentence']:
        if cur is None or W[i - 1]['sentence'] != w['sentence']:
            cur = dict(text=w['sentence'], first=i, last=i, ch=w['chapter'])
            sentences.append(cur)
    cur['last'] = i
for s in sentences:
    s['s'] = words[s['first']]['s']
    s['e'] = words[s['last']]['e']

pages = []
NOEND = {'the', 'a', 'an', 'of', 'to', 'in', 'on', 'at', 'by', 'its', 'their', 'his', 'her', 'your', 'and', 'but', 'so', 'that', 'like', 'with', 'from', 'far', 'most', 'one', 'how', 'is', 'was', 'were', 'eighteen', 'nineteen', 'three', 'Vesto', 'Edwin', 'Christian', 'Georges', 'more', 'less', 'whole', 'math', 'too', 'next', 'open', 'nearly'}
GOODSTART = {'that', 'like', 'so', 'and', 'but', 'while', 'with', 'to', 'in', 'about', 'far', 'most', 'from', 'set', 'toward', 'pulling', 'beside', 'after'}


def split_clause(ix):
    """DP split of a clause into chunks of 1-5 words (prefer 3-4, phrase-aware)."""
    n = len(ix)
    best = [0.0] + [1e9] * n
    back = [0] * (n + 1)
    for j in range(1, n + 1):
        for k in range(max(0, j - 5), j):
            size = j - k
            c = {1: 6.0, 2: 1.2, 3: 0.0, 4: 0.2, 5: 1.5}[size]
            last = re.sub(r"[^A-Za-z']", '', words[ix[j - 1]]['text'])
            if j < n and last.lower() in NOEND or last in NOEND:
                c += 4.0 if j < n else 0.0
            if j < n:
                nxt = re.sub(r"[^A-Za-z']", '', words[ix[j]]['text']).lower()
                if nxt in GOODSTART:
                    c -= 0.8
            if best[k] + c < best[j]:
                best[j] = best[k] + c; back[j] = k
    cuts = []
    j = n
    while j > 0:
        cuts.append((back[j], j)); j = back[j]
    return [ix[a:b] for a, b in reversed(cuts)]


for s in sentences:
    idx = list(range(s['first'], s['last'] + 1))
    clauses, cl = [], []
    for i in idx:
        cl.append(i)
        if re.search(r"[,;:]$", words[i]['text']):
            clauses.append(cl); cl = []
    if cl:
        clauses.append(cl)
    # merge a 1-word clause into its neighbour ("Listen." stays alone if it is the whole sentence)
    merged = []
    for c in clauses:
        if merged and (len(c) == 1 or len(merged[-1]) == 1) and len(merged[-1]) + len(c) <= 5:
            merged[-1] = merged[-1] + c
        else:
            merged.append(c)
    for c in merged:
        for chunk in split_clause(c):
            pages.append(dict(w=chunk[:], s=words[chunk[0]]['s'], ch=s['ch']))
for k, p in enumerate(pages):
    last = words[p['w'][-1]]['e']
    nxt = pages[k + 1]['s'] if k + 1 < len(pages) else last + 30
    # hold the page until the next page starts if the gap is short (< 0.8 s), else 12 frames after the last word
    p['e'] = nxt if nxt - last < 24 else last + 12
    p['text'] = ' '.join(words[i]['text'] for i in p['w'])

# ---------------------------------------------------------------- sfx cues
# (cue frame, file key, gain dB, offset frames). Files are resolved by scripts/mix_audio.py.
X = []


def sfx(at, key, db=-14.0, off=-2):
    X.append(dict(f=(C[at] if isinstance(at, str) else at) + off, key=key, db=db))


sfx('listen', 'bloom', -16, 0); sfx(C['listen'] + 22, 'bloom', -19, 0)
sfx(C['siren'] - 6, 'siren_pass', -9, 0)
sfx('passes', 'whoosh_fast', -18)
sfx('tinyDrop', 'whoosh_up', -15, -4)
sfx('universe0', 'shimmer', -17)
sfx('ch1', 'sign_creak', -17, 6)
sfx('toHer', 'siren_steady', -22, 0)
sfx('sameSiren', 'pop', -13); sfx('twoSounds', 'pop2', -13)
sfx('bothRight', 'ding', -15, 6)
sfx('whatChanged', 'question', -17, 4); sfx('notSiren', 'bonk', -13, 8)
sfx('something', 'whoosh_low', -20)
sfx('ch2', 'water_bloop', -15, 4)
sfx('bug', 'skitter', -19, 6)
sfx('swims', 'skitter', -19, 2)
sfx('squeezed', 'tick', -16); sfx('stretched', 'tick', -16)
sfx('soundSame', 'whoosh_fast', -18)
sfx('neverSpeed', 'needle', -15, 6)
sfx('y1842', 'match', -16, -4); sfx(C['frail'] + 8, 'cough', -20, 0)
sfx('nearlyQuit', 'latch', -15, 0); sfx(C['america'] + 10, 'thud', -15, 0)
sfx('threeYears', 'whoosh_mid', -16, -4)
sfx(C['threeYears'] + 10, 'whistle', -20, 0)
sfx('people', 'horns_pass', -15, -10)
sfx('twist1', 'twist', -12, -3)
sfx('heNamed', 'shimmer', -18, 0)
sfx(C['ch2End'] + 8, 'glass_shimmer', -16, 0)
sfx('ch3', 'neon', -15, 6)
sfx('stretchThem', 'sweep', -16, 0)
sfx('redshift', 'pop', -16, 2)
sfx('tooSmall', 'squeak', -18, 10)
sfx('predicted', 'whoosh_soft', -19, 14)
sfx('theyDid', 'stamp', -12, 0)
sfx('slides', 'slide', -16, 2)
sfx('tens', 'crickets_dome', -100, 0)  # placeholder marker (ambience handles crickets)
sfx('faint', 'clink', -15, 10)
sfx('andromeda', 'whoosh_rise', -15, 0)
sfx('nearlyAll', 'whoosh_out', -18, 4)
sfx('enter', 'rumble', -13, -6)
sfx(C['y1923'] + 20, 'blip', -17, 0); sfx(C['y1923'] + 38, 'blip', -17, 0); sfx(C['y1923'] + 56, 'blip', -17, 0)
sfx('next', 'zip', -16, 4)
sfx('y1929', 'card_slide', -15, 0)
sfx('pattern', 'chalk_line', -17, 0)
sfx('notJust', 'stretch', -16, 0)
sfx('expanding', 'deep_whoosh', -10, -6)
sfx('belgian', 'whoosh_soft', -18, -2)
sfx('hubblesChart', 'pop', -18, 8)
sfx('twist2', 'twist', -12, -3)
sfx('farGalaxies', 'siren_blip', -18, 10)
sfx('sirensStreet', 'nope', -15, 6)
sfx('spaceItself', 'dough', -17, 0)
sfx('theirLight', 'glide', -16, 0)
sfx(C['ch5'] + 6, 'siren_pass_soft', -14, 0)
sfx('hearing', 'sparkle', -17, 10)
sfx(C['lastWord'] + 20, 'sparkle', -18, 0)
X = [x for x in X if x['db'] > -60]

out = dict(
    fps=FPS, width=1920, height=1080, head=HEAD, durationInFrames=C['end'],
    voice=dict(file='audio/mix.wav', part2StartVoice=al['part2_start'], voiceDuration=79.307771 + 106.370625),
    chapters=CH, cues=C, scenes=scenes, words=words,
    sentences=[dict(text=s['text'], s=s['s'], e=s['e'], ch=s['ch']) for s in sentences],
    pages=pages, sfx=X,
)
json.dump(out, open(os.path.join(ROOT, 'data', 'video.json'), 'w'), indent=1)
print('frames', C['end'], 'scenes', len(scenes), 'pages', len(pages), 'sfx', len(X))
for ch in CH:
    print(ch['id'], ch['start'], ch['end'], '%.2fs' % ((ch['end'] - ch['start']) / FPS))
lens = [(s['end'] - s['start']) / FPS for s in scenes]
print('shot len min %.2f max %.2f mean %.2f' % (min(lens), max(lens), sum(lens) / len(lens)))
for s in scenes:
    print('%-14s %5d %5d %5.2fs' % (s['id'], s['start'], s['end'], (s['end'] - s['start']) / FPS))
