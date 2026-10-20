# GeorgeOS

Portfolio of George Dyck (V01D R4ST3R) as a Windows 98-style desktop. Plain HTML/CSS/JS with no build step, so it works as-is on GitHub Pages.

UI widgets come from [98.css](https://jdan.github.io/98.css/) (MIT, vendored in `/vendor`).

## Adding or editing a project

Everything in **My Work** (and the Start → My Work menu) comes from `js/data/projects.js`.
Copy an entry and edit it. To add a YouTube video, put this in the project's `media` list:

```js
{ type: 'youtube', id: 'VIDEO_ID', caption: 'Official video' }
```

Images and videos: `{ type: 'image', src: 'art/file.jpg' }` / `{ type: 'video', src: 'art/file.mp4', poster: 'art/file.poster.jpg' }`.

## Easiest: drop files into work/<project>/

Every project has a folder in `work/` (e.g. `work/fixie/`). Name files `1.jpg`…`8.jpg` (or .png), `1.mp4`…`4.mp4`,
and/or add a `youtube.txt` with YouTube links. They appear on that project's page automatically, with no code changes.

## Adding media to the Art / Photos folders

Add the file, then add an entry to `js/data/files.js`. Keep files web-sized. These are the commands used for the current media:

```sh
# video → ~3 Mbps H.264, streams before fully downloaded
ffmpeg -i in.mp4 -vf scale=1080:-2 -c:v libx264 -preset slow -crf 25 -maxrate 3500k -bufsize 7000k \
       -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 128k art/out.mp4
ffmpeg -ss 3 -i art/out.mp4 -frames:v 1 -vf scale=240:-2 art/out.poster.jpg        # thumbnail
# image
magick in.png -resize '1600x1600>' -strip -quality 85 art/out.jpg
magick art/out.jpg -thumbnail '240x240^' -gravity center -extent 240x240 thumbs/out.jpg
```

## Layout

```
index.html
css/style.css          layout, custom components, hacker theme, mobile
js/main.js             entry point
js/desktop.js          desktop icons, Start menu, shutdown, boot
js/wm.js               window manager (drag, resize, focus, taskbar)
js/apps.js             Explorer, project sheets, media viewer, Notepad, launchers, settings, CV
js/puzzles.js          the hidden ARG: Help → Run → Find → Firewall.exe
js/data/projects.js    ← all portfolio content
js/data/content.js     Notepad documents (Welcome, OPERATOR.LOG, Help, notes)
js/data/files.js       Art & Photos folder contents
icons/                 pixel icons for file types
work/<project-id>/      drop-in media for each project (see above)
docs/George_Dyck_Artist_CV.pdf, George_Dyck_Academic_CV.pdf
```

To run locally, start `python3 -m http.server`, then open http://localhost:8000. ES modules don't load from `file://`.
