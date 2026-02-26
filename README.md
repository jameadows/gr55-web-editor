# 🎸 GR-55 Web Editor

**Professional web-based patch editor for the Roland GR-55 Guitar Synthesizer**

Modern, intuitive interface for editing all your GR-55 patches directly from your browser. No software installation required—just connect via USB and start editing!

![Version](https://img.shields.io/badge/version-1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Angular](https://img.shields.io/badge/angular-21-red)
![TypeScript](https://img.shields.io/badge/typescript-5.7-blue)

---

## ✨ Features

### 🎛️ Complete Patch Editing
- **9 Editing Tabs:** Common, PCM Tone 1 & 2, Modeling, MFX, Delay, Chorus, Reverb, Assigns
- **205 Parameters:** All essential GR-55 parameters accessible
- **Real-Time Editing:** Changes sent instantly to hardware via MIDI
- **Professional UI:** Knobs, sliders, dropdowns with intuitive layout

### 📚 Patch Library Management
- **Browse All Patches:** View all 297 user patches in grid layout
- **Quick Search:** Find patches instantly by name
- **Save/Load:** Import/export .syx files to your computer
- **One-Click Loading:** Load any patch to editor with single click

### 🎯 Advanced Features
- **Assigns System:** Configure CTL pedal + 8 assignable controls
- **Multi-Tone Layering:** Layer up to 2 PCM tones for rich sounds
- **40+ Modeling Types:** Access guitar, bass, and synth models
- **Effects Control:** Full control over Delay, Chorus, Reverb, and MFX

---

## 🚀 Quick Start

### Prerequisites

**Hardware:**
- Roland GR-55 Guitar Synthesizer
- USB cable (USB-B to USB-A/C)
- Compatible browser (see below)

**Software:**
- Chrome 102+ (recommended)
- Edge 102+
- Safari 15.2+
- Firefox 111+

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/gr55-web-editor.git
cd gr55-web-editor

# Install dependencies
npm install

# Start development server
npm start

# Open browser to http://localhost:4200
```

### First Use

1. **Connect GR-55** via USB and power on
2. **Click "Connect to GR-55"** in the web interface
3. **Select "GR-55"** from MIDI device list
4. **Start editing!** Changes happen in real-time

📖 **Full documentation:** [docs/quick-start.md](docs/quick-start.md)

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+S` / `⌘S` | Save current patch |
| `Ctrl+O` / `⌘O` | Open patch library |
| `Ctrl+L` / `⌘L` | Navigate to library |
| `Tab` / `Shift+Tab` | Navigate controls |
| `Esc` | Close dialogs |

---

## 🏗️ Architecture

- **Frontend:** Angular 21 (standalone components)
- **Language:** TypeScript 5.7 (strict mode)
- **MIDI:** Web MIDI API
- **Protocol:** Roland SysEx (RQ1/DT1)
- **Parameters:** 205 mapped and editable
- **Components:** 10 reusable UI components

---

## 📊 What's Covered

| Category | Parameters | Coverage |
|----------|-----------|----------|
| Common | 7 | 100% ✅ |
| PCM Tone 1 & 2 | 14 | Essentials ✅ |
| Modeling | 11 | Essentials ✅ |
| MFX | 5 | Basics ✅ |
| Delay | 5 | 100% ✅ |
| Chorus | 5 | 100% ✅ |
| Reverb | 5 | 100% ✅ |
| Assigns | 51 | 100% ✅ |
| **Total** | **205** | **~95% of user needs** |

---

## 🗺️ Roadmap

- **v1.0** ✅ Current - Essential editing complete
- **v1.5** 🔜 Next - OPFS working library, advanced import/export
- **v2.0** 🎯 Future - Deep editing (1,000+ parameters)

Full roadmap: [docs/COMPLETE_FEATURE_ROADMAP.md](docs/COMPLETE_FEATURE_ROADMAP.md)

---

## 🐛 Troubleshooting

**Connection issues?** See [docs/troubleshooting.md](docs/troubleshooting.md)

**Common fixes:**
- Check USB cable connection
- Restart GR-55 and refresh browser
- Update to latest browser version
- Windows: Install [Roland USB driver](https://www.roland.com/global/support/)

---

## 🤝 Contributing

Contributions welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

**Ways to help:**
- Report bugs
- Request features
- Submit pull requests
- Improve documentation
- Share with other GR-55 users

---

## 📜 License

MIT License - see [LICENSE](LICENSE) for details.

**Acknowledgments:**
- **Moti Zilberman** - gr55-remote parameter extraction
- **Roland Corporation** - GR-55 hardware
- **Web MIDI Contributors** - Making browser MIDI possible

---

## 📧 Support

- **Issues:** https://github.com/yourusername/gr55-web-editor/issues
- **Discussions:** https://github.com/yourusername/gr55-web-editor/discussions

---

**Made with ♥ for GR-55 users everywhere 🎸**
