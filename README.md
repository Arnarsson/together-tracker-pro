# TogetherTracker Pro 🏠✨

A production-ready family task management app that makes chores fun through gamification, rewards, and real-time collaboration.

![TogetherTracker Pro](https://img.shields.io/badge/React-18.2-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-blue) ![Framer Motion](https://img.shields.io/badge/Framer_Motion-11.0-purple)

## 🎯 Features

### Core Functionality
- **👥 Multi-User Support** - Family members with parent/child roles
- **✅ Task Management** - Create, assign, and track tasks with priorities
- **🎮 Gamification** - Points, streaks, and achievements
- **🎁 Rewards System** - Redeemable rewards for completed tasks
- **📊 Analytics Dashboard** - Track family progress and performance
- **🌓 Dark/Light Mode** - Beautiful UI with theme customization

### Smart Features
- **👆 Swipe Gestures** - Swipe right to complete, left to delete
- **🔄 Recurring Tasks** - Daily, weekly, or monthly task scheduling
- **💬 Task Comments** - Collaborate on tasks with built-in chat
- **📍 Location Tags** - Assign tasks to specific locations
- **⏰ Time Estimates** - Track time spent on tasks
- **🏆 Leaderboards** - Family competition and motivation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Arnarsson/together-tracker-pro.git
cd together-tracker-pro
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

## 📱 Usage

### Getting Started
1. **Sign Up** - Create a family account with your email
2. **Add Members** - Share the invite code to add family members
3. **Create Tasks** - Assign tasks with points and priorities
4. **Complete Tasks** - Swipe right or click complete to earn points
5. **Redeem Rewards** - Use points to get rewards

### User Roles
- **Parents** - Can create tasks, manage rewards, and view all analytics
- **Children** - Can complete tasks, earn points, and redeem rewards

### Tips
- Switch between users by clicking the profile in the header
- Use swipe gestures for quick task management
- Set up recurring tasks for regular chores
- Create custom rewards to motivate your family

## 🛠️ Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **State**: React Context + Local Storage
- **Build Tool**: Vite

## 📁 Project Structure

```
together-tracker-pro/
├── src/
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── public/
│   └── index.html       # HTML template
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript config
├── tailwind.config.js   # Tailwind config
├── vite.config.ts       # Vite config
└── README.md           # This file
```

## 🎨 Customization

### Theme Colors
The app supports 5 theme colors:
- Purple (default)
- Blue
- Green
- Orange
- Pink

### Adding Custom Rewards
Edit the rewards array in the auth component to add custom rewards for your family.

### Modifying Point Values
Adjust the points system by editing task creation defaults and reward costs.

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import project in Vercel
3. Deploy with default settings

### Netlify
1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify

### Self-Hosting
1. Build: `npm run build`
2. Serve the `dist` folder with any static file server

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Icons by [Lucide](https://lucide.dev/)
- UI animations by [Framer Motion](https://www.framer.com/motion/)
- Styling by [Tailwind CSS](https://tailwindcss.com/)

## 📞 Contact

Project Link: [https://github.com/Arnarsson/together-tracker-pro](https://github.com/Arnarsson/together-tracker-pro)

---

Made with ❤️ for families everywhere