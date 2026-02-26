# Quick Start Guide - GR-55 Web Editor

Get up and running with the GR-55 Web Editor in 5 minutes!

---

## Step 1: Check Requirements

**Hardware:**
- ✅ Roland GR-55 Guitar Synthesizer
- ✅ USB cable (USB-B for GR-55, USB-A or USB-C for computer)
- ✅ Computer with USB port

**Browser (one of):**
- ✅ Chrome 102 or later (recommended)
- ✅ Edge 102 or later
- ✅ Safari 15.2 or later
- ✅ Firefox 111 or later

---

## Step 2: Install & Run

**Option A: Run from source**
```bash
git clone https://github.com/yourusername/gr55-web-editor.git
cd gr55-web-editor
npm install
npm start
```
Then open http://localhost:4200

**Option B: Use hosted version**
- Visit https://yourdomain.com/gr55-editor (if deployed)

---

## Step 3: Connect Your GR-55

1. **Physical connection:**
   - Connect GR-55 to computer with USB cable
   - Power on GR-55
   - Wait for USB initialization (~5 seconds)

2. **Web MIDI connection:**
   - Click **"Connect to GR-55"** button on home page
   - Browser shows MIDI device picker dialog
   - Select **"GR-55"** or **"GR-55 MIDI 1"**
   - Click **"Allow"** or **"Connect"**

3. **Verify connection:**
   - Green indicator appears: "Connected to GR-55"
   - Editor and Library links become active

**Troubleshooting:** If no devices appear, see [troubleshooting.md](troubleshooting.md)

---

## Step 4: Edit a Patch

1. **Navigate to editor:**
   - Click **"Editor"** in main navigation
   - Current patch loads automatically

2. **Explore tabs:**
   - **Common:** Patch name, level, tempo, tuning
   - **PCM Tone 1 & 2:** 896 sounds each (1,792 combinations!)
   - **Modeling:** 40+ guitar/bass/synth models
   - **MFX:** 20 multi-effect types
   - **Delay/Chorus/Reverb:** Classic effects
   - **Assigns:** CTL pedal + 8 assignable controls

3. **Make changes:**
   - **Knobs:** Click and drag up/down, or use mouse wheel
   - **Sliders:** Click and drag left/right
   - **Dropdowns:** Click to open menu
   - **LEDs:** Click to toggle on/off
   - All changes send to GR-55 **instantly**—no save button needed!

4. **Hear results:**
   - Play your guitar
   - Changes are live on the hardware
   - Tweak parameters until you like the sound

---

## Step 5: Save Your Work

### Save to GR-55 Memory

Your edits are in the GR-55's **temporary buffer**. To keep them:

**On GR-55 hardware:**
1. Press **WRITE** button on GR-55
2. Select destination patch number
3. Press **WRITE** again to confirm

**Via Editor (coming in v1.5):**
- Save directly to GR-55 slots from browser

### Save to Computer

**Export as .syx file:**
1. Navigate to **Library** page
2. Click **"Save to File"**
3. Downloads as `gr55-PATCHNAME.syx`
4. Store .syx file anywhere on your computer

**Import .syx file:**
1. In Library, click **"Load from File"**
2. Select .syx file
3. Patch loads to GR-55 temporary buffer
4. Click **"Editor"** to view/edit

---

## Step 6: Explore the Library

1. **Browse patches:**
   - Click **"Library"** in navigation
   - See all 297 user patches in grid view
   - Current patch highlighted in green

2. **Search patches:**
   - Type in search bar
   - Filters by patch name
   - Instant results

3. **Load a patch:**
   - Click any patch card to select (highlights amber)
   - Click **"Load Patch & Edit"**
   - Patch loads to GR-55
   - Editor opens automatically

---

## Common Workflows

### Create a New Sound

1. Start with a patch you like (load from library)
2. Navigate to Editor
3. Try different PCM tones or modeling types
4. Adjust effects to taste
5. Save to file for safekeeping
6. Write to GR-55 memory when ready

### Layer Two PCM Tones

1. Load patch in editor
2. Go to **PCM Tone 1** tab
3. Select first tone (e.g., piano)
4. Set level and pan
5. Go to **PCM Tone 2** tab
6. Select second tone (e.g., strings)
7. Set level and pan
8. Balance levels in **Common** tab

### Configure Expression Pedal

1. Go to **Assigns** tab
2. Enable **ASSIGN 1**
3. Set **Source** to "EXP PEDAL"
4. Set **Target** to desired parameter ID
   - Common targets: 0-50 (patch level, tone switches)
   - See GR-55 manual for complete list
5. Set **Min** and **Max** range
6. Test with expression pedal

---

## Tips & Tricks

**Performance:**
- Close unused browser tabs for better performance
- Chrome generally fastest, Safari also good on Mac
- Avoid heavy CPU load while editing

**Organization:**
- Name your patches descriptively
- Export favorites as .syx files
- Create folders on computer for different styles/setlists

**Experimentation:**
- Changes are instant but not permanent until you WRITE
- Feel free to experiment—just don't press WRITE if you don't like it!
- Load same patch again to reset

**Keyboard Shortcuts:**
- Learn the shortcuts to speed up workflow
- `Ctrl+S` / `⌘S` to save current patch
- `Ctrl+O` / `⌘O` to open library
- `Tab` to navigate between controls

---

## Next Steps

Now that you're up and running:

- ✅ **Explore all tabs** to see what's possible
- ✅ **Try different modeling types** (electric, acoustic, bass, synth)
- ✅ **Experiment with effects** (MFX has 20 types!)
- ✅ **Configure assigns** for your preferred control setup
- ✅ **Read parameter reference** for detailed info on each control

**Happy patching! 🎸**

---

**Questions?** See [troubleshooting.md](troubleshooting.md) or open an issue on GitHub.
