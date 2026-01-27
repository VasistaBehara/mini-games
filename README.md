# 🎮 Mini Games Arcade

A collection of classic games built with pure HTML, CSS, and JavaScript. Features a premium dark-themed design with glassmorphism effects, smooth animations, and responsive layouts.

## 🎯 Games

### Tic-Tac-Toe
The classic 3x3 strategy game with two modes:
- **🤖 vs AI** - Challenge an unbeatable Minimax AI
- **👥 2 Players** - Local multiplayer on the same device

Features:
- Score tracking (persisted in localStorage)
- Winner celebration animations
- Quick restart functionality

### Bingo
Race to complete a line first!
- **🤖 vs AI** - AI automatically marks its numbers
- **👥 2 Players** - Both players mark their own cards

Features:
- Traditional 5x5 Bingo cards (B:1-15, I:16-30, N:31-45, G:46-60, O:61-75)
- Free center space
- Win conditions: row, column, diagonal, or four corners
- **Auto-mark option** - Enable to automatically highlight called numbers
- Called numbers history display

### Dots & Boxes
Classic strategy game for 2-4 players:
- Support for human and AI players
- Board sizes: 3×3, 4×4, 5×5, 6×6
- Smart AI that prioritizes completing boxes

Features:
- Color-coded lines and boxes per player
- Turn indicator with player colors
- Auto-save/resume (localStorage)
- Extra turn when completing a box

## 🚀 Getting Started

### Prerequisites
- Node.js (for running the development server)

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/mini-games.git
cd mini-games

# Install dependencies
npm install

# Start development server
npm run dev
```

The games will be available at `http://localhost:8080`

### Production
These are static HTML files - simply deploy to any web server or static hosting (GitHub Pages, Netlify, Vercel, etc.)

## 📁 Project Structure
```
mini-games/
├── index.html           # Home page with game selection
├── tictactoe.html       # Tic-Tac-Toe game
├── bingo.html           # Bingo game
├── dotsandboxes.html    # Dots & Boxes game
├── css/
│   └── styles.css       # Complete design system & game styles
├── js/
│   ├── tictactoe.js     # Tic-Tac-Toe logic + Minimax AI
│   ├── bingo.js         # Bingo logic + AI + auto-mark
│   └── dotsandboxes.js  # Dots & Boxes logic + AI
└── package.json         # npm scripts
```

## 🎨 Design Features
- Premium dark theme with gradient accents
- Glassmorphism card effects
- Smooth CSS transitions and animations
- Fully responsive design
- Custom color palette with CSS custom properties

## 🛠 Technologies
- **HTML5** - Semantic structure
- **CSS3** - Modern features (Grid, Flexbox, Custom Properties, Animations)
- **JavaScript** - ES6+ vanilla JS, no frameworks
- **localStorage** - Persistent game state and scores

## 📝 License
MIT License - feel free to use for personal or commercial projects.

---

Built with ❤️ | Mini Games Arcade © 2026
