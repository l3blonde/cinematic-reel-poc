# Bullet 6: Add Cinematic Filters

## Goal
Apply cinematic color grading filters (Deep Blue, Vintage Explorer, Biolume, Ultra Vivid, None) to videos using FFmpeg color adjustment filters for professional underwater documentary effects.

## Test
1. Open browser to `http://localhost:5173`
2. Upload 2-3 images
3. Select "Deep Blue" filter from dropdown
4. Click "Create My Reel"
5. Verify video has blue underwater tint with enhanced contrast
6. Test each filter option and compare visual differences

---

## 1. Folder Structure

```
backend/
-- config/
---- filters.js         
-- services/
---- videoService.js  
```

**What each file does:**
- **filters.js**: Configuration object with 5 filter presets, each containing name, description, and FFmpeg filter string
- **videoService.js**: Modified to inject filter strings into FFmpeg scale filter chain

---

## 2. Pseudocode

```
DEFINE Filters Configuration:
  FOR EACH filter preset (deepBlue, vintageExplorer, biolume, ultraVivid, none):
    Store name, description, FFmpeg filter string
  END FOR

UPDATE Video Generation:
  GET filter name from request
  LOOKUP filter object from filters.js
  
  FOR EACH input file:
    Build base scale filter: "scale=1280:720, pad, setsar"
    IF filter has FFmpeg string:
      APPEND filter string: "base_filter,eq=contrast=1.2:saturation=1.3,..."
    END IF
    ADD fps normalization
    Label output: [v0], [v1], [v2]...
  END FOR
  
  CONCAT or CROSSFADE all labeled outputs
  RENDER final video with filters applied
```

---

## 3. Step-by-Step Implementation

### Step 1: Create Filter Configuration

**File:** `backend/config/filters.js`

```javascript
const FILTERS = {
  none: {
    name: "None",
    description: "Original colors, no filter",
    ffmpegFilter: null,
  },
  deepBlue: {
    name: "Deep Blue",
    description: "Enhanced blues, high contrast underwater look",
    ffmpegFilter: "eq=contrast=1.2:brightness=0.05:saturation=1.3,colorbalance=bs=0.3:bm=0.2",
  },
  vintageExplorer: {
    name: "Vintage Explorer",
    description: "70s documentary film grain and color",
    ffmpegFilter:
      "colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131,eq=contrast=0.9:saturation=0.8,noise=alls=10:allf=t+u",
  },
  biolume: {
    name: "Biolume",
    description: "Glowing bioluminescent effect",
    ffmpegFilter:
      "eq=contrast=1.4:brightness=-0.1:saturation=1.5,colorbalance=bs=0.4:gs=0.2:bm=0.3:gm=0.1,gblur=sigma=0.5",
  },
  ultraVivid: {
    name: "Ultra Vivid",
    description: "BBC-style saturated colors",
    ffmpegFilter: "eq=contrast=1.3:saturation=1.8:gamma=1.1,vibrance=intensity=0.5",
  },
}

module.exports = { FILTERS }
```

### Step 2: Update Video Service to Apply Filters

**File:** `backend/services/videoService.js` (partial update)

```javascript
const { FILTERS } = require("../config/filters")


const generateReel = async (files, options = {}) => {
  
  const filterType = options.filter || "none"
  const filterString = FILTERS[filterType]?.ffmpegFilter || ""


  files.forEach((_, i) => {
    let scaleFilter = `[${i}:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setsar=1`

    if (filterString) {
      scaleFilter += `,${filterString}`
    }

    scaleFilter += `,fps=30[v${i}]`
    filterComplex.push(scaleFilter)
  })

}
```

## 4. Understanding FFmpeg Filter Chains

### Visual Representation

```
Input Image → [0:v] → Scale → Pad → SetSAR → Filter (deepBlue) → FPS → [v0] → Concat → Output
                                                      ↓
                                           eq=contrast=1.2,
                                           brightness=0.05,
                                           saturation=1.3,
                                           colorbalance=bs=0.3
```
---

## 6. Testing

### Test 1: Verify Filter Config Loads

```bash
# In Node REPL
node
> const { FILTERS } = require('./backend/config/filters')
> console.log(FILTERS.deepBlue)
# Should show: { name: 'Deep Blue', description: '...', ffmpegFilter: '...' }
> console.log(Object.keys(FILTERS))
# Should show: [ 'none', 'deepBlue', 'vintageExplorer', 'biolume', 'ultraVivid' ]
```

### Test 2: Test Each Filter via API

```bash
# Deep Blue
curl -X POST http://localhost:3000/api/v1/reels \
  -H "Content-Type: application/json" \
  -d '{"files":["image1.jpg","image2.jpg"],"filter":"deepBlue"}'

# Vintage Explorer
curl -X POST http://localhost:3000/api/v1/reels \
  -H "Content-Type: application/json" \
  -d '{"files":["image1.jpg","image2.jpg"],"filter":"vintageExplorer"}'

# Download and compare videos side-by-side
```

### Test 3: Test Frontend Integration

1. Open `http://localhost:5173`
2. Upload 3 images
3. Select "Deep Blue" → Create → Verify blue tint
4. Create Another Reel
5. Select "Vintage Explorer" → Create → Verify sepia/grain
6. Repeat for all 5 filters
7. Compare visual differences
