/*
 * ─────────────────────────────────────────────────────────────
 *  GEORGE OS · PROJECT DATABASE
 * ─────────────────────────────────────────────────────────────
 *  Everything in the "My Work" explorer is generated from this file.
 *  To add a project, copy any entry below and edit it.
 *
 *  Fields
 *    id        unique, lowercase, no spaces
 *    folder    one of the folder ids in FOLDERS
 *    title     display name (also the window title)
 *    file      the "filename" shown in the explorer (optional, made from title)
 *    icon      icon file in /icons or /images (optional, uses folder default)
 *    year      "2026", "2025–Pres", ...
 *    role      your credit on the project
 *    with      collaborators (optional)
 *    body      paragraphs (array of strings)
 *    bullets   optional list
 *    media     array of:
 *                { type: 'image',   src: 'art/x.jpg', caption: '' }
 *                { type: 'video',   src: 'art/x.mp4', poster: 'art/x.poster.jpg', caption: '' }
 *                { type: 'youtube', id: 'dQw4w9WgXcQ', caption: '' }      ← paste the YouTube ID
 *                { type: 'vimeo',   id: '123456789', caption: '' }
 *    links     array of { label: 'Visit site', url: 'https://…' }
 *    launch    optional: id of a launcher app (see apps.js LAUNCHERS) to open
 *              the live piece in a window instead of the project sheet
 * ─────────────────────────────────────────────────────────────
 */

export const FOLDERS = [
  { id: 'installations', name: 'Installations & Public Projects', icon: 'icons/install.png' },
  { id: 'animation',     name: 'Music Videos & Animation',        icon: 'icons/cube.png' },
  { id: 'interactive',   name: 'Games & Interactive Art',         icon: 'icons/game.png' },
  { id: 'type',          name: 'Type Design',                     icon: 'icons/font.png' },
  { id: 'design',        name: 'Posters, Identity & Merch',       icon: 'icons/poster.png' },
  { id: 'music',         name: 'Music, Curation & Events',        icon: 'icons/music.png' },
  { id: 'community',     name: 'Community Projects',              icon: 'icons/people.png' },
];

export const PROJECTS = [
  /* ── INSTALLATIONS & PUBLIC PROJECTS ─────────────────────── */
  {
    id: 'big-sun-wall', folder: 'installations',
    title: 'Big Sun Wall', year: '2026', role: 'Artist & Developer',
    body: [
      'A crowd-sourced digital graffiti wall for the Big Sun festival in Winnipeg. Festival-goers scanned a QR code on posters around the venue, painted a tag in a retro “Paint”-style app on their phone, and watched it ignite in neon on a projection above the bar, about two and a half storeys tall (roughly 7.5 m × 13 m).',
      'I designed and coded the full system: the phone painting app, the real-time server, a moderation queue, and the wall itself, and ran it live on the night.',
      'Below: the phone painting app, styled after Windows 95 Paint.',
    ],
    media: [], links: [],
  },
  {
    id: 'imabox', folder: 'installations',
    title: 'IMABOX', year: '2026', role: '3D Artist, Rigger & AR Developer', with: 'Bîstyek (painter)',
    body: [
      'Bîstyek’s paintings of displacement and resilience, brought into augmented reality. The central exhibit at Market Square for Nuit Blanche Winnipeg 2026: viewers scan a QR code and the work appears in their space on any Android or iOS phone, with no app required.',
      'I modelled the figures from his paintings, rigged and weight-painted them, cleaned up the animation (animated by another collaborator), rendered material for a promotional video, and built the web-AR experience. An ongoing collaboration with an artist featured at the Winnipeg Art Gallery (WAG).',
    ],
    media: [], links: [{ label: 'Try the AR experience', url: 'https://imabox-ar.github.io/' }],
  },
  {
    id: 'hocketus', folder: 'installations',
    title: 'Hocketus', year: '2026', role: 'Projection Systems Developer', with: 'Savant Flaneur',
    body: [
      'Live projection for Savant Flaneur’s album release. In the avant-garde chamber collective’s show, rotating pairs of guest musicians played through the album’s MaxMSP patches, which force players to interrupt and cooperate.',
      'Instead of a conventional visualizer, my live system reads both players’ audio and draws their relationship: who takes ground, who ducks, how fast the floor changes hands, and who gets cut off. Amber and cyan territories meet at a shifting membrane, and white light appears only when the two players sound together. Track changes cued over OSC/MIDI shift the palette for each piece.',
    ],
    tags: ['Python', 'NumPy', 'Pygame', 'OSC/MIDI'],
    media: [], links: [],
  },
  {
    id: 'glitch-lich', folder: 'installations', icon: 'icons/game.png',
    title: 'Glitch Lich Revolution', year: '2025', role: 'Sole Software Developer',
    with: 'Phoenix Hourie (artwork), Carter Lowe / DEAFWIZRD (music); curated by Justin Bear L’Arrivee',
    body: [
      'A live breakcore performance built around a Dance Dance Revolution-inspired game. Four players on dance pads battle on a massive on-stage screen during DEAFWIZRD’s set. In the game’s anti-colonial lore, Two-Spirit defenders, keepers of ancestral languages, songs and dances, storm the forts of an undead cyborg Queen Victoria.',
      'Shown at Urban Shaman Gallery and at HYPER ART, Nuit Blanche Winnipeg 2025. All software written in Unity (C#), with 3D assets modelled in Blender.',
    ],
    tags: ['Unity', 'C#', 'Blender'],
    media: [], links: [],
  },

  /* ── MUSIC VIDEOS & ANIMATION ────────────────────────────── */
  {
    id: 'cab', folder: 'animation', icon: 'icons/video.png',
    title: 'Tired Cossack – “Cab”', file: 'Cab.mp4', year: '2026', role: 'Director & 3D Animator',
    body: [
      'Full-length official music video for the Winnipeg band, from the album ZIMA. Set in a forest, with every scene modelled and animated in Blender.',
      'Released August 2026; 79,000 views on YouTube by October 2026.',
    ],
    media: [ /* { type: 'youtube', id: 'PASTE_ID_HERE' } */ ], links: [],
  },
  {
    id: 'fixie', folder: 'animation', icon: 'icons/video.png',
    title: 'Nadarak – “Fixie”', file: 'Fixie.mp4', year: '2026', role: '3D Animator',
    body: ['Music video for the British Columbia artist, styled as a 1990s PlayStation-era racing game.'],
    media: [], links: [],
  },
  {
    id: 'radagast-animations', folder: 'animation', icon: 'icons/video.png',
    title: 'Radagast – three animations', file: 'Radagast.mp4', year: '2026', role: '3D Animator',
    body: ['Three collaborative animations set to original music by the international dungeon-synth composer.'],
    media: [], links: [],
  },
  {
    id: 'winnipeg-haunts', folder: 'animation',
    title: 'Winnipeg Haunts', year: '2025–Pres', role: '3D Animator',
    body: ['An ongoing series of low-poly, PlayStation-style animations of beloved Winnipeg spots, all modelled, textured and rendered in Blender.'],
    bullets: [
      'Park Alley: a 90s/00s bowling animation punning on the 1919 General “STRIKE!”',
      'Hoagie Boys: the storefront turns into a hoagie.',
      'Eye and Ear Control Records: a visualizer and instructional “walkthrough” of how to enter the store.',
      'Public Domain: a moody, detailed study of the venue’s facade.',
    ],
    media: [], links: [],
  },
  {
    id: 'pbs', folder: 'animation', icon: 'icons/video.png',
    title: 'Public Domain “PBS” events', file: 'PBS_loop.mp4', year: '2025', role: '3D Animator',
    body: ['Looping GameCube-style animation for the venue’s recurring event series.'],
    media: [{ type: 'video', src: 'art/PublicDomain.mp4', poster: 'art/PublicDomain.poster.jpg', caption: 'PBS loop' }],
    links: [],
  },
  {
    id: 'fantasy-club', folder: 'animation', icon: 'icons/cube.png',
    title: 'Fantasy Club Books', year: '2025', role: '3D Animator', with: 'Basement Lagoon (Austin Boulton)',
    body: ['Brought an original character by local artist Basement Lagoon (Austin Boulton) to life as an animated low-poly 3D model.'],
    media: [], links: [],
  },
  {
    id: 'moyamoya-visualizers', folder: 'animation',
    title: 'MOYAMOYA visualizers', year: '2024–Pres', role: 'Animator & Sound Designer',
    body: ['Visualizers for the band’s single releases, and 3D animations with original sound design and voice-over monologues used as a core part of the live show.'],
    media: [
      { type: 'video', src: 'art/Skullsmash.mp4', poster: 'art/Skullsmash.poster.jpg' },
      { type: 'video', src: 'art/autoamputation.mp4', poster: 'art/autoamputation.poster.jpg' },
      { type: 'video', src: 'art/ComputerChip.mp4', poster: 'art/ComputerChip.poster.jpg' },
      { type: 'video', src: 'art/SKULLVID_processed_blownout.mp4', poster: 'art/SKULLVID_processed_blownout.poster.jpg' },
    ],
    links: [],
  },

  /* ── GAMES, INTERACTIVE ART & CREATIVE CODE ──────────────── */
  {
    id: 'folklore-game', folder: 'interactive', icon: 'icons/game.png',
    title: 'German folklore video game', year: '2026–Pres', role: '3D Artist, Programmer & Game Designer', with: 'Radagast',
    body: ['A stylized first-person adventure built from real imagery of German landscapes and folk culture, with music and story by Radagast. Puzzles and decision-based storytelling rather than combat. In development.'],
    media: [], links: [],
  },
  {
    id: 'luana-moth', folder: 'interactive', icon: 'images/moth.png', launch: 'moth',
    title: 'Luana Moth ARG', file: 'Luana_Moth.exe', year: '2025', role: 'Sole Developer & Game Designer',
    body: ['A narrative alternate reality game for the musician, including an “in-universe” browser game (Project Quassia: Invitation) built in Phaser.js with 2D pixel art and lore puzzles.'],
    links: [{ label: 'luanamoth.com', url: 'https://luanamoth.com' }],
  },
  {
    id: 'georgeos', folder: 'interactive', icon: 'icons/app.png',
    title: 'GeorgeOS', file: 'GeorgeOS.exe', year: '2025', role: 'Artist & Developer',
    body: ['A portfolio as artwork: a fully working Windows 95-style desktop with a Start menu, movable windows, and hidden puzzles that guide visitors through the work non-linearly.', 'You are here. (Have you tried the Help file?)'],
    links: [],
  },
  {
    id: 'where-i-cannot-find-him', folder: 'interactive', icon: 'images/job.png', launch: 'lichtung',
    title: 'Where I Cannot Find Him', file: 'text_dissolution.exe', year: '2025', role: 'Artist & Developer',
    body: ['A creative-code piece in which the text itself is the medium: an interactive exegesis on the Book of Job, after a Žižekian reading of suffering.'],
    links: [{ label: 'Open in new tab', url: 'https://lichtung1.github.io/Where-I-Cannot-Find-Him-V2/' }],
  },
  {
    id: 'moyamoya-arg', folder: 'interactive', icon: 'images/MMOS.png', launch: 'mmos',
    title: 'MOYAMOYA ARG', file: 'MMOS.exe', year: '2024', role: 'Artist & Developer',
    body: ['A “possessed computer” escape-room game: visitors explore a command-line interface to uncover puzzles, lore and band content.'],
    links: [{ label: 'moyamoya.ca', url: 'https://moyamoya.ca' }],
  },
  {
    id: 'cep-bbs', folder: 'interactive', icon: 'images/brain.png', launch: 'cep',
    title: 'CEP BBS', file: 'CEP.BAT', year: '', role: 'Artist & Developer',
    body: ['The next chapter of the MOYAMOYA ARG: a dial-up Bulletin Board System presenting lore as “digital found footage”.'],
    links: [{ label: 'cep.moyamoya.ca', url: 'https://cep.moyamoya.ca' }],
  },

  /* ── TYPE DESIGN ─────────────────────────────────────────── */
  {
    id: 'loewen-type', folder: 'type', icon: 'icons/font.png',
    title: 'Loewen Guitars typeface', file: 'Shay.otf', year: '2025–26', role: 'Type Designer',
    body: [
      'A complete ornamental display typeface, commissioned by luthier Loewen Guitars and translated from historical needlework patterns into a scroll-filled alphabet.',
      'The work treats old stitch charts as an early form of pixel art, carrying a hand-craft grid tradition into digital type.',
    ],
    media: [], links: [],
  },
  {
    id: 'wolfe-type', folder: 'type', icon: 'icons/font.png',
    title: 'Dorothy Wolfe typeface', file: 'Dorthy_Wolfe.otf', year: '2025–26', role: 'Type Designer',
    body: [
      'A blackletter display alphabet for fashion designer Dorothy Wolfe, translated from historical needlework patterns into cross-stitch capitals.',
      'The work treats old stitch charts as an early form of pixel art, carrying a hand-craft grid tradition into digital type.',
    ],
    media: [], links: [],
  },

  {
    id: 'ecco-type', folder: 'type', icon: 'icons/font.png',
    title: 'ECCO Epilogue typeface (Luana Moth)', file: 'ECCO_Epilogue.otf', year: '2025–26', role: 'Type Designer',
    body: [
      'A chunky pixel typeface made for the Luana Moth universe: full upper and lower case, numerals and punctuation, built on a strict grid like the type of an old computer game.',
      'Used across the Luana Moth ARG and Project Quassia: Invitation.',
    ],
    media: [], links: [],
  },

  /* ── POSTERS, IDENTITY & MERCH ───────────────────────────── */
  {
    id: 'gig-posters', folder: 'design', icon: 'icons/poster.png',
    title: 'Gig posters', year: '2025–26', role: 'Designer & 3D Artist',
    body: ['Selected gig posters, 3D-rendered, then printed and posted around Winnipeg.'],
    bullets: [
      '2026 · Holy Void, Par Asito, Nex, Strawberry Punch · West End Cultural Centre, Oct 30',
      '2026 · dr.ift · Sidestage, May 15',
      '2026 · MOYAMOYA, Kandekt · Public Domain, March 21',
      '2026 · Radagast, Desolation Plains, Mutable Body · Public Domain, Jan 17. Presented by Eye and Ear Control Records and Send & Receive; a wireframe knight “summoned from the command line” (Blender, Photoshop)',
      '2026 · At Last, Detective!, dr.ift, Laughing Court · The Handsome Daughter, July 25',
      '2026 · Bike, Walk, Run or Roll-a-thon · community fundraiser graphics',
      '2025 · DEAFWIZRD · Into the Music, July 18 (free, all ages)',
      '2025 · MOYAMOYA, Luana Moth, Justin Bear, DEAFWIZRD · Public Domain, June 20',
    ],
    media: [],
    links: [],
  },
  {
    id: 'logos', folder: 'design', icon: 'icons/image.png',
    title: 'Logos & identity', year: '2024–Pres', role: 'Designer',
    bullets: [
      '2026 · Glitch Witch (DJ): logo',
      '2025 · Hardcore Painting (painting company): logo',
      '2024–Pres · MOYAMOYA: single and release artwork, visual identity',
    ],
    media: [{ type: 'image', src: 'art/Cassette_V3.jpg', caption: 'Cassette artwork' }],
    links: [],
  },
  {
    id: 'moyamoya-merch', folder: 'design', icon: 'icons/image.png',
    title: 'MOYAMOYA merchandise', year: '2024–Pres', role: 'Designer',
    body: ['Designed all band merchandise, including shirts and long-sleeves. Two sold-out print runs.'],
    media: [
      { type: 'image', src: 'art/MOYALONGSLEEVE.jpg', caption: 'Long-sleeve' },
    ],
    links: [],
  },
  {
    id: 'void-interface', folder: 'design', icon: 'icons/doc.png',
    title: 'VOID INTERFACE Operations Manual', file: 'OwB-mk1_Manual.doc', year: '2025', role: 'Writer & Designer',
    body: ['VOID INTERFACE [MODEL: OwB-mk1] Operations Manual. A 10-page zine and “technical manual” for a 3-voice synth that fans could use to play along with the band’s set, expanding the lore of V01D R4ST3R and MOYAMOYA.'],
    media: [], links: [],
  },

  /* ── MUSIC, CURATION & EVENTS ────────────────────────────── */
  {
    id: 'moyamoya-band', folder: 'music', icon: 'images/MMOS.png',
    title: 'MOYAMOYA', year: '2024–Pres', role: 'Bassist, Co-songwriter, Art Director & Manager',
    body: [
      'I co-write the band’s music as part of a collaborative writing process, compose the interludes in our set, and recorded and produced one of our songs.',
      'I perform with the band and run much of its creative and business side: organizing and promoting shows, booking lineups, designing and putting up posters, and selling tickets; creating all album art, visualizers, live animations and merchandise; and managing merch sales and the band’s bank account.',
    ],
    links: [{ label: 'moyamoya.ca', url: 'https://moyamoya.ca' }],
  },
  {
    id: 'curated-shows', folder: 'music', icon: 'icons/poster.png',
    title: 'Curated shows at Public Domain', year: '2025–Pres', role: 'Curator, Promoter & Designer',
    body: ['Organized and promoted a live bill with MOYAMOYA, Luana Moth, Justin Bear and DEAFWIZRD (June 20, 2025), and with MOYAMOYA, KANDEKT and Beth (March 21, 2026), including all print and digital promotion.'],
    links: [],
  },
  {
    id: 'composer', folder: 'music', icon: 'icons/music.png',
    title: 'Composer & producer', year: 'Ongoing', role: 'Composer, Producer & Multi-instrumentalist',
    body: ['I write classically inspired music and produce jungle, breakcore and drum and bass in Ableton Live and Reaper, with several recording projects on the go. I play classical guitar, guitar and bass, and I’m studying composition, with a focus on counterpoint and music for video games.'],
    links: [],
  },

  /* ── COMMUNITY ───────────────────────────────────────────── */
  {
    id: 'rollathon', folder: 'community', icon: 'icons/people.png',
    title: 'Bike, Walk, Run or Roll-a-thon', year: '2026', role: 'Designer & Full-Stack Developer (volunteer)',
    body: [
      'I volunteered to build the full online system, front and back end, plus the graphics, for a fundraiser sending a friend to Spain for emergency surgery: participant sign-up, pledges and donations, live tracking of totals, and automated emails to supporters.',
      'Dozens of participants raised tens of thousands of dollars.',
    ],
    links: [],
  },
];
