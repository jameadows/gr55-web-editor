# Troubleshooting Guide - GR-55 Web Editor

Solutions to common issues and problems.

---

## Connection Issues

### No MIDI Devices Found

**Symptoms:**
- "Connect to GR-55" shows empty device list
- Browser says "No MIDI devices available"

**Solutions:**

1. **Check physical connection:**
   - ✅ USB cable fully inserted on both ends
   - ✅ GR-55 is powered on
   - ✅ Try a different USB port
   - ✅ Try a different USB cable

2. **Wait for USB initialization:**
   - Power on GR-55
   - Wait 10 seconds
   - Refresh browser page
   - Try connecting again

3. **Check USB drivers (Windows only):**
   - Download [Roland USB driver](https://www.roland.com/global/support/)
   - Install driver
   - Restart computer
   - Reconnect GR-55

4. **Verify MIDI device exists:**
   - **Windows:** Device Manager → Sound, video and game controllers
   - **Mac:** Audio MIDI Setup → MIDI Studio
   - Should see "GR-55" or "Roland GR-55"

5. **Try different browser:**
   - Chrome 102+ (best compatibility)
   - Edge 102+
   - Safari 15.2+ (Mac only)
   - Firefox 111+ (requires enabling in about:config)

---

### Connection Drops During Use

**Symptoms:**
- Connected successfully but disconnects after a while
- Random disconnections
- "Lost connection to GR-55" message

**Solutions:**

1. **Disable USB power management (Windows):**
   - Control Panel → Power Options → Change plan settings
   - Change advanced power settings
   - USB settings → USB selective suspend setting → Disabled
   - Apply and restart

2. **Use powered USB port:**
   - Avoid unpowered USB hubs
   - Connect directly to computer USB port
   - Prefer USB 3.0 ports (more power available)

3. **Check USB cable quality:**
   - Some cheap cables have poor shielding
   - Try a high-quality USB cable
   - Shorter cables (<6 feet) work better

4. **Update GR-55 firmware:**
   - Check Roland website for latest firmware
   - Follow update instructions carefully

---

### Browser Shows "MIDI Access Denied"

**Symptoms:**
- Permission denied error
- Browser blocks MIDI access

**Solutions:**

1. **Grant MIDI permissions:**
   - **Chrome/Edge:** Click padlock icon → Site settings → MIDI devices → Allow
   - **Safari:** Safari → Preferences → Websites → MIDI → Allow for this site
   - **Firefox:** about:config → dom.webmidi.enabled → true

2. **Clear browser cache:**
   - Clear site data for localhost:4200
   - Restart browser
   - Try again

3. **Disable browser extensions:**
   - Some extensions block MIDI
   - Try in Incognito/Private mode
   - If works, identify problematic extension

---

## Editor Issues

### Parameters Show Wrong Values

**Symptoms:**
- Knobs/sliders show incorrect current value
- Values don't match GR-55 display

**Solutions:**

1. **Reload patch:**
   - Refresh browser page
   - Reconnect to GR-55
   - Editor re-reads all parameters

2. **Check GR-55 mode:**
   - GR-55 must be in normal mode (not WRITE mode)
   - Exit any GR-55 menus
   - Return to main screen

3. **Verify MIDI communication:**
   - Open browser console (F12)
   - Check for MIDI errors
   - Report errors in GitHub issue

---

### Changes Not Sent to GR-55

**Symptoms:**
- Move controls but GR-55 doesn't respond
- No sound change when adjusting parameters

**Solutions:**

1. **Verify connection:**
   - Check green "Connected" indicator
   - If red, reconnect to GR-55

2. **Check parameter is editable:**
   - Some displays are read-only
   - Look for "Parameter Label" component (display-only)
   - Knobs/Sliders/Dropdowns are editable

3. **Check MIDI buffer:**
   - Too many rapid changes can overflow buffer
   - Slow down parameter adjustments
   - Wait for changes to apply

4. **Reload patch:**
   - Sometimes helps reset state
   - Refresh page and reconnect

---

### Controls Feel Laggy

**Symptoms:**
- Delay between mouse movement and control response
- Choppy animations
- Slow parameter updates

**Solutions:**

1. **Reduce browser load:**
   - Close other browser tabs
   - Close unnecessary applications
   - Check CPU usage (should be <10%)

2. **Disable browser extensions:**
   - Ad blockers can slow rendering
   - Try Incognito/Private mode

3. **Update browser:**
   - Use latest version of Chrome/Edge/Safari
   - Older versions have slower rendering

4. **Check computer performance:**
   - Close heavy applications
   - Check RAM usage
   - Restart computer if needed

---

## Library Issues

### Patches Don't Load

**Symptoms:**
- Click patch but nothing happens
- "Load Patch & Edit" doesn't work

**Solutions:**

1. **Verify GR-55 connection:**
   - Must be connected to load patches
   - Green indicator should show

2. **Check patch number is valid:**
   - Valid range: 0-296 (297 patches total)
   - Some patches may be empty/corrupted

3. **Wait for loading:**
   - Loading patch takes ~1 second
   - Watch for loading indicator
   - Don't click multiple times

---

### Save to File Doesn't Work

**Symptoms:**
- "Save to File" doesn't download
- File is 0 bytes or corrupted

**Solutions:**

1. **Check browser download settings:**
   - Allow downloads from localhost
   - Check Downloads folder permissions

2. **Disable popup blocker:**
   - May block download
   - Allow popups for localhost:4200

3. **Try different browser:**
   - Chrome usually most reliable for downloads

---

### Can't Import .syx File

**Symptoms:**
- "Load from File" fails
- Error loading .syx file

**Solutions:**

1. **Verify .syx file format:**
   - Must be valid Roland GR-55 SysEx
   - Should start with F0 41 00 00 00 53...
   - Should end with F7
   - File size should be ~16KB

2. **Check file isn't corrupted:**
   - Try downloading again
   - Get from trusted source

3. **Use file from GR-55:**
   - Export from this editor to ensure compatibility
   - Third-party .syx files may not work

---

## Browser Compatibility

### Firefox Not Working

**Problem:** Firefox requires manual flag enable

**Solution:**
1. Type `about:config` in address bar
2. Search for `dom.webmidi.enabled`
3. Set to `true`
4. Restart Firefox

**Note:** Chrome/Edge/Safari don't require this.

---

### Safari Issues on Mac

**Problem:** Web MIDI not available

**Solution:**
- Update to macOS 11.3+ and Safari 15.2+
- Older versions don't support Web MIDI

---

### Mobile Browsers

**Problem:** Editor doesn't work on mobile

**Explanation:**
- Web MIDI API not available on mobile browsers
- iOS Safari, Chrome Android don't support MIDI
- Desktop browser required

**Workaround:**
- Use desktop/laptop computer
- No mobile solution currently available

---

## Performance Issues

### High CPU Usage

**Symptoms:**
- CPU spikes when editing
- Fan runs loud
- Computer slows down

**Solutions:**

1. **Normal for real-time MIDI:**
   - ~5-10% CPU is normal
   - MIDI communication requires processing

2. **If CPU >20%:**
   - Close other applications
   - Disable browser extensions
   - Update graphics drivers
   - Try different browser

---

### Slow Patch Loading

**Symptoms:**
- Takes >5 seconds to load patch
- Long delay between selecting and loading

**Solutions:**

1. **Check USB connection:**
   - Slow USB bus can cause delays
   - Try different USB port
   - Use USB 3.0 if available

2. **Check GR-55:**
   - Some patches are slower to load
   - Complex patches take longer
   - Normal range: 0.5-2 seconds

---

## Advanced Issues

### TypeScript Errors in Console

**For developers:**

**Symptom:** Console shows TypeScript compilation errors

**Solutions:**
1. Run `npm install` to update dependencies
2. Delete `node_modules` and `.angular` folders
3. Run `npm install` again
4. Restart dev server with `npm start`

---

### Build Fails

**For developers:**

**Symptom:** `npm run build` fails

**Solutions:**
1. Check Node.js version (should be 18+)
2. Update Angular CLI: `npm install -g @angular/cli`
3. Clear cache: `npm cache clean --force`
4. Delete `node_modules`, run `npm install`
5. Check for disk space

---

## Still Having Problems?

### Before Reporting:

1. ✅ Try all solutions above
2. ✅ Test with different browser
3. ✅ Test with different USB cable/port
4. ✅ Restart computer and GR-55
5. ✅ Check browser console for errors (F12)

### When Reporting Issues:

Include this information:

**System:**
- Operating System & version
- Browser & version
- GR-55 firmware version

**Problem:**
- Exact steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots if applicable
- Browser console errors (F12 → Console tab)

**Where to Report:**
- GitHub Issues: https://github.com/yourusername/gr55-web-editor/issues
- Include "[BUG]" in title
- Use bug report template

---

## Known Limitations

**Current version does not support:**
- ❌ Mobile browsers (Web MIDI not available)
- ❌ Internet Explorer (use Edge instead)
- ❌ Offline mode (GR-55 must be connected)
- ❌ Multiple GR-55 units simultaneously

**Coming in future versions:**
- ⏸️ OPFS storage (v1.5)
- ⏸️ Offline editing (v2.0)
- ⏸️ Deep MFX/PCM parameters (v2.0)

---

## FAQ

**Q: Do I need to install drivers?**
A: Mac: No. Windows: Yes, download from Roland.

**Q: Can I use this on iPad?**
A: No, Web MIDI API not available on mobile browsers.

**Q: Is my GR-55 safe?**
A: Yes! Changes are written via standard MIDI. Can't brick your unit.

**Q: Can I undo changes?**
A: Current patch is in temporary buffer. Don't press WRITE on GR-55 to discard changes.

**Q: Does this work with GR-55S?**
A: Should work, but not tested. Report if you try it!

**Q: Can I use wireless MIDI?**
A: Not tested. USB connection recommended.

**Q: Why Web MIDI instead of native app?**
A: Cross-platform, no installation, modern web tech, easier updates.

---

**Still stuck?** Ask in GitHub Discussions or open an issue!
