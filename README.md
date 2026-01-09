# Ocean's 4 Cinematic Reel Generator

**Team:** Ocean's 4 Team, Thomas More  
**Project:** Final Product Project  
**Type:** Proof of Concept (POC)

Live app: http://165.232.82.22

## About This Project

This is our final year project where we built a tool that takes
your images and videos and turns them into cinematic social media reels.
You upload files, pick a filter and transition, optionally add music,
and boom you get a professional looking reel ready to post.

## What We Built

A web app that processes images and videos using FFmpeg to create reels
with cinematic filters (Deep Blue, Vintage, Biolume, Ultra Vivid),
smooth transitions (fade, crossfade), and background music that starts
at the good part of the song. The reel length adjusts automatically
based on how many files you upload so it matches social media 
best practices (10 to 15 seconds).

## Our Journey (aka what went wrong and right)

**What went right:**
FFmpeg integration worked better than expected once we figured out the filter chains. 
Dynamic duration calculation was surprisingly straightforward.

**What went wrong:**
File upload size limits hit us hard when testing with videos.
Port conflicts everywhere during development.
Mixed image and video processing needed special handling for transitions.
Progress percentages sometimes go over 100% but we shipped it anyway because it works.

## Tech Stack

**Frontend:** React, Vite  
**Backend:** Node.js, Express  
**Video Processing:** FFmpeg  
**File Upload:** Multer  
**Deployment:** Digital Ocean (Ubuntu 22.04)

## Features

Upload images and videos (jpg, png, mp4, mov, avi)  
Add background music (mp3, wav) that auto starts 10 seconds in  
Apply cinematic filters (Deep Blue for underwater, Vintage Explorer, Biolume glow, Ultra Vivid)  
Choose transitions between clips (fade, crossfade, or hard cuts)  
Smart duration (2 to 3 seconds per image depending on count, videos keep original length)  
Download your reel as MP4  
Mobile responsive design

## Video & Audio Size Limits

Max file size: 500MB per file
If you hit the limit just compress your video first

## Known Issues & Future Improvements

Progress bar sometimes shows over 100% (FFmpeg quirk, not critical)  
Crossfade only works for image only reels (videos force hard cuts)  
No preview before generating (you just gotta trust it)  
Could add more filters and transitions  
Maybe add text overlays in the future  
Error messages could be more helpful

## Environment Variables Needed

Backend needs a `.env` file in `/backend` folder:

```
NODE_ENV=development
PORT=3000
UPLOAD_DIR=uploads
OUTPUT_DIR=output
MAX_FILE_SIZE=524288000
```

Frontend works without env vars for local development

## Running Locally

**Backend:**
```
cd backend
npm install
npm run dev
```

**Frontend:**
```
cd frontend
npm install
npm start
```

Make sure you have FFmpeg installed:
```
brew install ffmpeg
```

Then open browser to http://localhost:5173

## Team

Ocean's 4 Team  
Thomas More  
2025

## License

MIT

---

Built with lots of coffee and Stack Overflow by students who learned FFmpeg the hard way! :)
