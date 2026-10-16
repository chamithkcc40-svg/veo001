# 05 - Voiceover for ElevenLabs Eleven v4 (paste-ready)

Tags checked against ElevenLabs' Audio Tags list for Eleven v4 (https://elevenlabs.io/blog/elevenlabs-audio-tags-list, accessed 2026-10-16). That page says tags are natural-language cues, carry forward until the next tag, and can be combined with commas. Every tag below is either on the list (whispers/softly/quietly/slowly style delivery tags, plus emotion words) or a plain-language combination written the way the page shows. Test Part 1's first three sentences before generating everything.

- Model: Eleven v4 (`eleven_v4`) in the Text to Speech app.
- Plan: free. Per-generation limit on the website: 2,500 characters (free) / 5,000 (paid), per the ElevenLabs Help Center (accessed 2026-10-16). Part size used: 2,300 characters max, tags and IPA included.
- The full voiceover is 1383 + 1817 = 3200 characters, which is over 2,300, so it is split at the Chapter 2 / Chapter 3 boundary into 2 parts.
- Pauses come from punctuation only (periods, commas). No pause tags are used.
- The words match 03-script.md exactly. The only differences are the audio tags and the IPA for Slipher and Lemaître.

## Part 1 of 2 - Cold open, Chapter 1, Chapter 2
Characters: 1383 (tags included) · 221 spoken words · estimated 88 s at 2.5 words/s

```
[hushed, intrigued] Listen. A siren races toward you. The moment it passes, its note drops. [awed] That tiny drop holds the clue that told us the whole universe is growing. [warm, playful] Picture the ambulance driver. To her, the siren plays one steady note. But you, on the sidewalk, hear it high as it comes, and low as it goes. Same siren. Two sounds. And you're both right. [curious] So what changed? Not the siren. Something in the air between you. [calm, clear] Sound travels in waves, like ripples on a pond. Picture a bug sitting still, tapping the water. Perfect rings spread out evenly. [lively] Now the bug swims forward while it taps. The rings in front get squeezed together. The rings behind get stretched apart. [clear, confident] Sound does the same. Squeezed waves reach your ear more often, so the pitch sounds higher. Stretched waves arrive less often, so it sounds lower. The waves never speed up. Only their spacing changes. [gentle, storytelling] In eighteen forty-two, a frail math professor in Prague worked this out. His name was Christian Doppler, and he had once nearly quit and moved to America. [brightening] Three years later, a Dutch scientist put horn players on an open train car. People beside the track heard the notes bend. [intrigued] But here's the twist. Doppler didn't name his paper after sound. He named it after the colored light of stars.
```

## Part 2 of 2 - Chapter 3, Chapter 4, Close
Characters: 1817 (tags and IPA included) · 271 spoken words · estimated 108 s at 2.5 words/s
Starts with [intrigued, softly] to pick up the [intrigued] mood Part 1 ends on.

```
[intrigued, softly] Light is a wave too, and for light, spacing means color. [clear] Squeeze the waves, and light shifts toward blue. Stretch them, and it shifts toward red. That's a redshift. [wry, gentle] Doppler guessed wrong about star colors. The shift was far too small to notice. [warm, proud] But he predicted astronomers would one day use it to measure how stars move. They did. [curious] Starlight carries a barcode of dark lines, set by its atoms. If the barcode slides toward red, the source is moving away. [storytelling] In the nineteen tens, Vesto /ˈslaɪfər/ read those barcodes in faint spirals in the sky. Andromeda was coming toward us, about three hundred kilometers every second. [tense, building] But nearly all the others were rushing away. Why would almost everything flee from us? [dramatic] Enter Edwin Hubble. In nineteen twenty-three, with the most powerful telescope of its day, he proved Andromeda was a whole galaxy, far beyond our own. Next, he measured how far away other galaxies were. [building suspense] In nineteen twenty-nine, he set his distances beside their speeds, most of them /ˈslaɪfərz/. A pattern jumped out. [awed, emphatic] The farther a galaxy is, the faster it moves away. Not just from us. From each other. The universe is expanding. [measured, fair] A Belgian priest, Georges /ləˈmɛtrə/, had proposed this two years earlier. But Hubble's chart is what convinced astronomers. [hushed, intrigued] And one last twist. Far galaxies aren't really speeding through space like sirens down a street. [awed, slowly] Space itself is stretching, like rising dough pulling raisins apart. Their light stretches with it, toward red. [warm, reflective] So the next time a siren drops its note as it passes, listen. You're hearing the same clue that told us the universe is growing.
```

Total: 492 spoken words, about 197 s (3:17). Actual speed depends on the voice; measure the two files after generating them.

## Mood arc (where each tag sits)
hushed/intrigued (cold open) -> awed (the promise) -> warm/playful (driver vs. listener) -> curious (the open loop) -> calm/clear, then lively (the pond) -> clear/confident (the rule) -> gentle storytelling (Doppler) -> brightening (the train) -> intrigued (midpoint twist) || intrigued/soft (light) -> clear -> wry (Doppler's mistake) -> warm/proud (his prediction) -> curious (the barcode) -> storytelling (Slipher) -> tense/building (the question) -> dramatic (Hubble) -> building suspense -> awed/emphatic (the law, the peak) -> measured/fair (Lemaître) -> hushed/intrigued (last twist) -> awed/slow (space stretching) -> warm/reflective (close).

## Voice recommendation
A warm, mid-low narrator voice, male or female, with a clear storytelling tone and a little smile in it, like a friendly science-museum guide rather than a movie-trailer voice. Neutral American or British English. Search the Voice Library for "documentary narrator warm" or "storyteller calm" and pick one marked for narration. Use the same voice and the same settings for both parts.

## Settings (Eleven v4 has only Stability and Similarity)
- Stability: lower values give a more expressive read with more variation between takes. Higher values give a steadier read that stays consistent across parts but can go flat. Start near the middle, then generate the first three sentences of Part 1 and adjust. If the tags barely change the delivery, lower it. If the two parts sound like different people, or a take drifts, raise it. These are starting points to test, not verified numbers.
- Similarity: keep the default unless the voice sounds unlike its preview.
- Style, Speed, and SSML don't exist on Eleven v4 (per the ElevenLabs Eleven v4 docs). Fix pacing with punctuation, never with speed.

## Pronunciation table
| Term | IPA (inline in the voiceover) | Plain respelling (fallback) |
|---|---|---|
| Slipher | /ˈslaɪfər/ | SLY-fer |
| Slipher's | /ˈslaɪfərz/ | SLY-ferz |
| Lemaître | /ləˈmɛtrə/ | luh-MET-ruh |
| Georges | (not inlined) /ʒɔrʒ/ | ZHORZH |
| Doppler | (not inlined) /ˈdɒplər/ | DOP-ler |
| Andromeda | (not inlined) /ænˈdrɒmɪdə/ | an-DROM-ih-duh |

Notes: the pronunciation "sly-fer" for Slipher is reported by the Astronomy Magazine history post ("evidently pronounced sly-fer"). That source is secondary, so check it by ear. If the IPA is read out oddly, replace the IPA with the respelling (for example "Vesto SLY-fer") in that sentence only.

## Re-generation guide (fix one weak sentence without redoing a part)
1. Copy only the weak sentence, plus the sentence before it for context, and paste it into a new generation. Use the same voice and settings, and keep the mood tag that applies there (copy the last tag before that sentence, even if it sits earlier in the paragraph).
2. Generate 2-3 takes and pick the one whose tone matches the surrounding audio.
3. In your editor, cut out the old sentence at the sentence-end silences and drop in the new take. Trim the extra context sentence.
4. If the emphasis is wrong, capitalize the one key word (Eleven v4 reads caps as emphasis) or move it to the end of the sentence. If the pace is wrong, adjust commas and periods. If a name is wrong, switch IPA to respelling or the other way round.
5. Keep the words identical to 03-script.md. If you change a word, update 03-script.md and the captions too.
6. Hook: generate the first two sentences of Part 1 three or more times and keep the cleanest, most intriguing read.
