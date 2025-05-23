# HABIT-TRACKER

HabitHub is a modern habit tracking and personal analytics application built with Next.js and React. It helps users track daily habits, visualize progress, and build positive routines through an engaging, user-friendly interface.

![HabitHub Screenshot](https://via.placeholder.com/800x450)

## Features

- 📊 **Interactive Dashboard** with progress visualization and habit tracking
- 🌙 **Light/Dark Mode** with system preference detection
- 📱 **Responsive Design** for seamless experience across all devices
- 🔔 **Smart Reminder System** that adapts based on user behavior
- 🏆 **Gamification Elements** including streaks and achievement badges
- 📈 **Data Visualization** with multiple chart types for tracking progress
- ⚡ **Smooth Animations** using Framer Motion for a polished experience

## Tech Stack

- **Framework**: Next.js 13+ with App Router
- **UI**: React 18+, Tailwind CSS
- **Animations**: Framer Motion
- **Data Visualization**: Recharts
- **Icons**: Lucide React
- **Type Safety**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/habithub.git
   cd habithub
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn install
   ```

3. Run the development server:
   ```
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
src/
├── app/               # Next.js App Router
├── components/        # React components
│   └── HabitTracker.tsx   # Main component
├── utils/             # Utility functions
└── types/             # TypeScript type definitions
```

## Key Component Features

- **HabitTracker**: Main component that handles all habit tracking functionality
- **Responsive sidebar**: Adapts between mobile and desktop views
- **Chart visualizations**: Line, bar, and pie charts for habit data
- **Modal system**: For adding and managing habits
- **Toast notifications**: Provides user feedback
- **Dark/light theme**: Seamlessly switches between color schemes

## Future Enhancements

- Backend integration with Firebase/Supabase
- User authentication system
- Data export/import capabilities
- Advanced analytics and insights
- Mobile app with offline capabilities

## License

This project is available for evaluation purposes only.

## Acknowledgments

- Icons by [Lucide](https://lucide.dev/)
- Charts powered by [Recharts](https://recharts.org/)
- Animations by [Framer Motion](https://www.framer.com/motion/)