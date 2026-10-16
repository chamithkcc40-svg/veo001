"""T5: write STORYBOARD.md from data/video.json + the per-scene plan below."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE); TOPIC = os.path.dirname(ROOT)
V = json.load(open(os.path.join(ROOT, 'data', 'video.json')))
F = V['fps']

PLAN = {
 's0_void': ("\"Listen.\"", "Pip (ear CU only, right-to-left profile), ears perk", "L1 black-violet void, L2 faint dust, L3 white rings from centre, L4 Pip ear entering from left, L5 grain/vignette", "", "", "bloom x2 on ring births"),
 's0_street': ("\"A siren races toward you. The moment it passes, its note drops.\"", "Pip on sidewalk (left third): cups ears, eyes track R->L, mouth 'ooo' at pass; generic ambulance races R->L", "L1 dusk sky gradient + sun, L2 far skyline silhouettes (blur 4), L3 rowhouses with flickering windows, L4 street + lamp post, L5 foreground hedge silhouettes (blur 8), clouds drift, birds", "", "Pitch Line above Pip: tight BLUE -> wide RED with a downward step", "siren pass-by synced so pitch drop lands on the pass frame; whoosh"),
 's0_tilt': ("\"That tiny drop holds the clue...\"", "Pip small, looking up", "street layers slide down at parallax rates, sky -> violet -> starfield", "", "", "whoosh up"),
 's0_space': ("\"...that told us the whole universe is growing.\"", "-", "L1 night, L2 nebula fog, L3 star dust (seeded), L4 galaxy field drifting apart, L5 hero Glowing Galaxy centre-right", "ONE SIREN. ONE UNIVERSE. (small, bottom-left)", "hero galaxy edge tint red + 'colours exaggerated'", "shimmer"),
 's1_cab': ("\"Picture the ambulance driver.\"", "Nell MS, hands on wheel, calm blink, small nod", "cab interior, dashboard, windshield street streaming past (3 parallax bands), dangling tag swings", "Chapter card '1 · ONE SIREN, TWO SOUNDS' on a swinging street sign", "", "sign creak"),
 's1_roof': ("\"To her, the siren plays one steady note.\"", "Nell in window, nods", "ambulance side view centred, street + houses scrolling (vehicle-follow)", "", "even WHITE rings around the cab (moving with the cab = Nell's frame); flat Pitch Line by Nell's ear", "muffled steady siren"),
 's1_split': ("\"But you, on the sidewalk... Same siren. Two sounds. And you're both right.\"", "LEFT Nell (steady); RIGHT Pip, ambulance passes; both thumbs-up on 'both right'", "two worlds side by side, divider pill", "SAME SIREN (divider) / TWO SOUNDS; divider wipes away", "LEFT even white Pitch Line; RIGHT tight BLUE then wide RED", "pop x2, ding"),
 's1_notsiren': ("\"So what changed? Not the siren.\"", "-", "parked ambulance roof close, street behind (blur)", "big '?' bounce, then red X + 'NOT THE SIREN'", "", "question boing, bonk"),
 's1_air': ("\"Something in the air between you.\"", "Pip (small, right) and ambulance (left) at ground level", "ground-level street, air shimmer band, dust motes", "", "faint rings in the air between them", "low whoosh"),
 's2_pond': ("\"Sound travels in waves, like ripples on a pond.\"", "-", "TD pond: L1 deep water gradient, L2 caustic stripes, L3 lily pads, L4 reeds at frame edge (blur), L5 drifting leaves", "Chapter card '2 · RIPPLES' as a ring of letters", "", "water bloop"),
 's2_still': ("\"Picture a bug sitting still, tapping the water. Perfect rings spread out evenly.\"", "Skipper lands (squash), taps one leg per ring, scarf flutter", "pond", "", "RIPPLE A: stationary source, equal white rings, constant speed", "plip per tap"),
 's2_swim': ("\"Now the bug swims forward... squeezed together... stretched apart.\"", "Skipper swims right, looks back on 'behind'", "pond, camera pans with Skipper", "", "RIPPLE B: each ring centred where emitted; BLUE ahead, RED behind; spacing brackets", "skitter, tick x2"),
 's2_compare': ("\"Sound does the same.\"", "-", "split: pond rings | street ambulance rings", "", "identical ring patterns", "whoosh"),
 's2_ear': ("\"Squeezed waves reach your ear more often... Stretched waves arrive less often...\"", "Pip ear INS at frame right", "abstract soft gradient, rings arriving from left", "", "hits-per-second tick bar; Pitch Line tight then wide", "clicks per ring hit (fast, then slow)"),
 's2_speed': ("\"The waves never speed up. Only their spacing changes.\"", "-", "diagram stage", "SAME SPEED · DIFFERENT SPACING", "two ring trains, two speedometers same needle, spacing brackets glow", "needle tick"),
 's2_study': ("\"In eighteen forty-two, a frail math professor in Prague worked this out.\"", "Doppler writing by candle, soft cough", "L1 night window + spires, L2 wall, L3 shelves, L4 desk + candle, L5 foreground papers (blur); candle flicker, dust in light", "Timeline ribbon 1842; tag 'Christian Doppler · Prague · 1842'", "", "match strike, cough"),
 's2_suitcase': ("\"His name was Christian Doppler, and he had once nearly quit and moved to America.\"", "Doppler closes suitcase, looks at ship in window, sets it down", "study in sepia", "", "", "latch, thud"),
 's2_train': ("\"Three years later, a Dutch scientist put horn players on an open train car.\"", "Buys Ballot waves flag; 3 horn players sway and blow", "L1 spring sky, L2 far hills (atmos), L3 windmill + trees, L4 fields + track, L5 grass tufts (blur); steam puffs", "Timeline 1845; tag 'Buys Ballot · near Utrecht · 1845'", "", "whistle, chuffs"),
 's2_observers': ("\"People beside the track heard the notes bend.\"", "observers cup ears", "trackside, car passes L->R", "", "rings BLUE ahead/RED behind, Pitch Lines tight -> wide", "horns pass-by"),
 's2_twist': ("\"But here's the twist.\"", "-", "page curl with spiral icon", "", "", "page-curl fwip + harp; music drops out"),
 's2_paper': ("\"Doppler didn't name his paper after sound. He named it after the colored light of stars.\"", "Doppler looks up at window", "study CU title page, window with one bluish and one reddish star", "'On the coloured light of the double stars...'", "", "glassy shimmer on push-through"),
 's3_lab': ("\"Light is a wave too, and for light, spacing means color.\"", "-", "Light Lab: studio gradient, floor glow, floating rainbow strip, dust", "Chapter card '3 · LIGHT HAS A SIREN TOO' neon tube", "wave line whose wiggle spacing maps to rainbow colour", "neon buzz"),
 's3_blue': ("\"Squeeze the waves, and light shifts toward blue.\"", "-", "Light Lab", "", "star moves toward viewer-right; front rings tighten BLUE", ""),
 's3_galaxy': ("\"Stretch them, and it shifts toward red. That's a redshift.\"", "-", "space", "REDSHIFT from red rings; 'colours exaggerated'", "Glowing Galaxy BLUE -> cream -> RED, scale -10%", "sweep, pop"),
 's3_toosmall': ("\"Doppler guessed wrong about star colors. The shift was far too small to notice.\"", "Doppler sheepish shrug", "study window, magnifier", "'too small'", "true-scale stars barely change", "squeak"),
 's3_quill': ("\"But he predicted astronomers would one day use it... They did.\"", "Doppler writes, small smile", "study -> night sky -> telescope icon", "stamp check", "", "whoosh, stamp thunk"),
 's3_barcode': ("\"Starlight carries a barcode... If the barcode slides toward red, the source is moving away.\"", "-", "Light Lab barcode", "LAB strip label", "rainbow strip, 4 lines, atom tethers, shift arrow, tiny galaxy drifts away", "slide"),
 's3_dome': ("\"In the nineteen tens, Vesto Slipher read those barcodes...\"", "-", "Lowell-style dome on pine hill, night: sky, far ridge, pines, dome, foreground pines; stars twinkle", "Timeline 1912-1914; tag 'Vesto Slipher · Lowell Observatory · 1912-1914'", "", "crickets"),
 's3_slipher': ("\"...in faint spirals in the sky.\"", "Slipher at eyepiece, holds up glass plate, eyebrows", "dome interior, red lamp", "", "plate shows faint spiral + barcode", "glass clink"),
 's3_andromeda': ("\"Andromeda was coming toward us, about three hundred kilometers every second.\"", "-", "space", "ANDROMEDA · approaching · ~300 km/s", "tilted spiral glides toward camera, lines slide BLUE, glow blue; 'colours exaggerated'", "low rising whoosh"),
 's3_map': ("\"But nearly all the others were rushing away. Why would almost everything flee from us?\"", "Pip in corner, puzzled", "sky map", "~15 spirals by 1914 · nearly all receding; US marker", "15 spirals, all but 2 RED drifting outward with tags", "staggered whooshes; suspended chord"),
 's4_dome': ("\"Enter Edwin Hubble.\"", "Hubble steps into light pool, looks up", "low-angle giant telescope, dome slit opening", "Chapter card '4 · THE RUNNING UNIVERSE' letters spreading; tag 'Edwin Hubble · Mount Wilson · 1923 / 1929'", "", "dome rumble"),
 's4_plate': ("\"In nineteen twenty-three, with the most powerful telescope of its day,\"", "Hubble's hand marks plate", "light table glass plate", "Timeline 1923", "star blinks bright-dim-bright", "blip x3"),
 's4_scale': ("\"he proved Andromeda was a whole galaxy, far beyond our own.\"", "-", "space", "scale bar", "Milky Way left, Andromeda pushed far right, gap widens", ""),
 's4_tapes': ("\"Next, he measured how far away other galaxies were.\"", "-", "space galaxy row", "", "measuring-tape distance tags extend (no numbers)", "zip x3"),
 's4_chart': ("\"In nineteen twenty-nine... A pattern jumped out. The farther a galaxy is, the faster it moves away.\"", "Hubble steps back from chart", "chalkboard room", "HUBBLE: DISTANCES / SLIPHER: SPEEDS (most of them); Timeline 1929; 'after Hubble 1929, PNAS · 24 galaxies · schematic'; 'Virgo galaxies ~1,000 km/s'", "24 dots, rising line; dots become galaxies with red arrows growing with distance", "card slide, 24 chalk taps, chalk line"),
 's4_grid': ("\"Not just from us. From each other.\"", "-", "expansion sheet", "", "5x3 grid scales evenly; gold ring on one galaxy then another, arrows point away", "elastic stretch"),
 's4_peak': ("\"The universe is expanding.\"", "-", "galaxy field pull back", "THE UNIVERSE IS EXPANDING (gold)", "glows redder with distance; 'colours exaggerated'", "deep whoosh, music peak"),
 's4_lemaitre': ("\"A Belgian priest, Georges Lemaître... But Hubble's chart is what convinced astronomers.\"", "Lemaître writes, offers page; silhouetted astronomers nod", "left panel study, right chart", "Georges Lemaître · 1927; 1927 and 1929 markers both glow", "", "whoosh, pop"),
 's4_twist': ("\"And one last twist.\"", "-", "page curl", "", "", "page-curl + harp; music to soft pad"),
 's4_road': ("\"Far galaxies aren't really speeding through space like sirens down a street.\"", "tiny ambulance", "starry road", "gentle X", "", "siren blip, nope buzz"),
 's4_dough': ("\"Space itself is stretching, like rising dough pulling raisins apart.\"", "-", "kitchen: tile wall, window, counter, bowl, dough; dissolves to space sheet", "", "raisins = mini galaxies spread without moving through dough", "dough bubble"),
 's4_ray': ("\"Their light stretches with it, toward red.\"", "-", "space sheet", "'colours exaggerated'", "wavy ray from far galaxy to Milky Way, wiggles widen, colour blue -> cream -> RED", "falling sine glide"),
 's5_street': ("\"So the next time a siren drops its note as it passes, listen.\"", "Pip hears ambulance pass, smiles knowingly", "dusk street (same kit as cold open, later light)", "", "rings blue then red; Pitch Line drops", "soft siren pass-by"),
 's5_sky': ("\"You're hearing the same clue that told us the universe is growing.\"", "Pip looks up", "crane-up to night sky; final starfield hold with clear upper corners", "LISTEN FOR THE DROP (small)", "red rings drift up and become galaxies", "sparkle tail"),
}

L = ['# Storyboard (timed) - doppler-effect-redshift', '',
     'Generated by remotion/scripts/storyboard_md.py from remotion/data/video.json (real word timings, 0.5 s head). 30 fps. Frames are global.', '',
     '| Chapter | Comp id | Start f | End f | Seconds |', '|---|---|---|---|---|']
for c in V['chapters']:
    L.append('| %s | `%s` | %d | %d | %.2f |' % (c['title'], c['id'], c['start'], c['end'], (c['end'] - c['start']) / F))
L += ['', 'Total: %d frames = %.2f s.' % (V['durationInFrames'], V['durationInFrames'] / F), '']
cur = -1
for s in V['scenes']:
    if s['chapter'] != cur:
        cur = s['chapter']; L += ['', '## ' + V['chapters'][cur]['title'], '']
    line, chars, env, text, info, sfx = PLAN[s['id']]
    L.append('### %s  (beats %s)  f%d-%d  %.2f-%.2f s  [%.2f s]' % (s['id'], s['beats'], s['start'], s['end'], s['start'] / F, s['end'] / F, (s['end'] - s['start']) / F))
    L.append('- VO: ' + line)
    L.append('- Shot: %s. Camera: %s. Transition in: %s.' % (s['shot'], s['camera'], s['transitionIn']))
    L.append('- Characters/poses: ' + chars)
    L.append('- Environment layers: ' + env)
    if text: L.append('- On-screen text: ' + text)
    if info: L.append('- Info-visual: ' + info)
    if sfx: L.append('- SFX: ' + sfx)
    L.append('')
L += ['## Caption pages', '%d pages of 2-5 words (data/video.json `pages`), one line, never across sentences.' % len(V['pages']), '',
      '## SFX cues', '%d cues in data/video.json `sfx` (frame, key, gain). Mixed offline by scripts/mix_audio.py.' % len(V['sfx'])]
open(os.path.join(TOPIC, 'STORYBOARD.md'), 'w').write('\n'.join(L) + '\n')
print('ok', len(L))
