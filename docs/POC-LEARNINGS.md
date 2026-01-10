# POC Learnings Summary

## What Worked Really Well

**FFmpeg is powerful**
We used FFmpeg to automatically generate videos from images and other videos. It worked great for our needs. The filter chains let us add effects, transitions, and audio all in one command. Pretty impressive actually.

**React state management was straightforward**
Managing file uploads with useState hooks was easy enough. The FormData API handled multipart uploads without much hassle. Error handling with try/catch kept things clean.

**File upload limits work when aligned**
Had to set 500MB limit in three places (multer, express body parser, nginx). Once we figured that out everything uploaded fine. Important learning there.

**Modular backend structure**
Separating routes, controllers, and services made debugging way easier. When something broke we knew exactly where to look. Would do this again for sure.

## Hardest Parts

**CORS errors everywhere at first**
Took ages to figure out we needed to allow both localhost:5173 and the production IP in express cors config. Super frustrating at the start.

**FFmpeg syntax is cryptic**
Learning filter complex chains was rough. Lots of trial and error. The documentation exists but its not exactly beginner friendly. Had to read stack overflow a lot.


## Future Difficulties We Can See Coming

**Multi dive story mode will be complex**
Combining multiple dives with GPS maps and timelines sounds cool 
but the ffmpeg logic will be way harder. 
Probably need separate service just for that.

**Real time video preview before generation**
Users want to see what the reel looks like before clicking generate. 
This means running ffmpeg twice or building preview tool.

**Storage costs will add up fast**
500MB per upload times thousands of users equals huge cloud storage bills. 
Need compression strategy and maybe delete old files after 30 days.

**Mobile upload on slow internet**
500MB uploads take forever on slow connections. 
Need chunked uploads with resume capability. 
More complex than current setup.

## Key Technical Learnings

**Multer parses multipart form data**
Before this project we didnt really understand what multer does. 
Its middleware that intercepts file uploads and saves them to disk. 
Simple but essential.

**Filter chains are mathematical operations**
Cinematic filters arent magic, theyre just maths. 
Adjusting RGB curves, saturation, contrast. 
Understanding the numbers helped debug filter issues.

**Promises wrap asynchronous FFmpeg**
FFmpeg runs as child process. 
Wrapping it in Promise lets us use async/await in controller. Clean pattern.

**Browser cache is aggressive**
Hard refresh with Ctrl+Shift+R needed after every frontend rebuild 
during deployment. Otherwise browser loads old javascript from cache.

**Transitions are pixel interpolation over time**
Crossfade blends pixel values from clip A and clip B. 
Fade multiplies brightness by changing number. 
Its all maths underneath. Pretty cool actually.

## Tech Stack Choices Explained

**Why FFmpeg not cloud AI API**
FFmpeg is free and runs on our server. 
Cloud APIs cost money per request. 
For POC we wanted zero ongoing costs. FFmpeg gave us enough control.

**Why Vite not Create React App**
Vite is way faster for dev server hot reload. 
CRA is deprecated anyway. No brainer choice there.

## What We Would Do Differently Next Time

**Start with cloud storage from day one**
Filesystem storage works for POC but we knew it wouldnt scale. 
Should have used Digital Ocean Spaces from start. 
Would save migration headache later.

**Add logging earlier**
Console.log helped debug but proper logging library like Winston 
would have been better. Especially for tracking FFmpeg errors.

**Write tests for critical paths**
No tests in POC. Bad practice. At minimum should have tested file 
upload validation and FFmpeg command building.

**Design database schema upfront**
We have no database yet. When we add users and saved reels 
we will need proper schema. Should have planned this earlier.
