# 🌍 3D Globe Travel App - Ultimate Traveler's Platform

An amazing interactive 3D globe application designed for travelers to explore the world, mark locations, share experiences, and access travel resources!

## ✨ Features

### Core Features
- **3D Interactive Globe**: Real Earth texture with continents - spin, zoom, and pan
- **Location Marking**: Double-click anywhere to add markers with media, notes, and coordinates
- **Traveler Mode**: Watch an animated traveler walk from place to place like a game
- **Media Gallery**: Upload photos, videos, and record audio/video directly
- **Social Features**: Like, dislike, comment, share, and send stars to locations
- **Search with Filters**: Advanced filtering (has media, comments, min likes)
- **Trip Planner**: Create trip plans and ask community for advice, media, and posts
- **World Clock**: View times in major cities worldwide
- **Travel Resources**: Direct links to airlines and booking sites

### User Features
- **Sign Up/Login**: Secure authentication with OTP email verification
- **Multi-language**: English, Hebrew, Italian, Arabic, Russian
- **Dark/Light Mode**: Toggle between themes
- **PWA Support**: Install on Android and iPhone as native app
- **Secure Access**: Token-based access system
- **Social Links**: Add TikTok, Facebook, Instagram, and more
- **Donation Link**: Add PayPal donation link
- **Ad Management**: Add ads (requires donation link)

### Travel Resources
- **Airlines**: Direct links to 15+ major airlines
- **Booking Sites**: Hotels, flights, tours, car rentals, and more
- **Travel Guides**: Lonely Planet, Rick Steves, and more

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- PHP (for OTP email server)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up PHP server (for OTP emails):
```bash
# Option 1: Using PHP built-in server
cd php
php -S localhost:8080

# Option 2: Configure your web server to serve php/ directory
```

3. Configure email (optional):
   - Edit `server/utils/email.js` with your SMTP settings
   - Or use PHP mail() function (default)

4. Start the development server:
```bash
npm run dev
```

5. Open your browser to `http://localhost:3000`

## 📱 PWA Installation

### Android:
1. Open in Chrome
2. Tap menu (three dots)
3. Select "Add to Home screen"

### iPhone:
1. Open in Safari
2. Tap Share button
3. Select "Add to Home Screen"

## 🎮 How to Use

- **Add Location**: Double-click globe → Add title, note, media
- **Start Journey**: Click "Start Journey" → Watch traveler walk between locations
- **Record**: Use record button to capture audio/video
- **Search**: Use search bar with filters to find locations
- **Trip Planning**: Create trips and request community help
- **Travel Resources**: Access airlines and booking sites
- **Sign Up**: Create account with email verification
- **Share**: Share locations via social media
- **Send Stars**: Show appreciation with stars

## 🛠️ Technologies

- **Frontend**: React, Three.js, React Three Fiber
- **Backend**: Node.js, Express, SQLite
- **Email**: PHP mail() or Nodemailer
- **State**: Zustand
- **Icons**: SVG-based with animations

## 📦 Database

SQLite database with tables:
- `locations` - User-marked locations
- `media` - Photos and videos
- `comments` - Location comments
- `advice` - Travel advice
- `trip_plans` - Trip planning
- `users` - User accounts
- `user_sessions` - Authentication tokens

## 🔐 Security

- Token-based authentication
- OTP email verification
- Password hashing (SHA256)
- Secure session management

## 📄 License

MIT License

Enjoy exploring the world! 🌎✨
