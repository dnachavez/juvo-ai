# 🚀 Cebu Anti-Human Trafficking Dashboard

## 💡 Note

This dashboard is a fully functional single-page application designed to help visualize and organize anti-trafficking efforts. Built with modern web technologies and inspired by Linear.app's clean design, it provides a comprehensive monitoring solution for trafficking prevention in Cebu.

## 🆕 Latest Major Release - Single Page Dashboard (v3.0)

### 🔄 Complete Architecture Transformation
- **✅ Single-Page Application**: Converted from multi-page router-based app to continuous scrollable sections
- **✅ Linear.app Inspired Design**: Modern, clean, minimal UI with professional dark theme
- **✅ Enhanced User Experience**: Eliminated navigation complexity - all features accessible through smooth scrolling
- **✅ Responsive Excellence**: Mobile-first design with adaptive layouts across all device sizes

### 📊 New Data Visualization Features
- **✅ Interactive Line Graph**: Category statistics visualization using Recharts library
- **✅ Enhanced Category Analysis**: Sorting, statistics, and improved card-based layout
- **✅ Real-time Visual Feedback**: Interactive tooltips and hover states throughout

### 🎨 Design System Overhaul
- **✅ Linear-Inspired Color Palette**: Sophisticated slate-950/900/800 backgrounds
- **✅ Grid Visual Separation**: Clear borders and visual hierarchy between dashboard sections
- **✅ Centered Typography**: Professional title alignment and content justification
- **✅ Touch-Optimized Interface**: Enhanced mobile interactions with proper button sizing

### 📱 Advanced Responsive Design
- **✅ Adaptive Button System**: Smart sizing (mobile: px-4 py-3, tablet: px-6 py-4, desktop: px-8 py-4)
- **✅ Progressive Icon Scaling**: 18px → 20px → 24px based on screen size
- **✅ Responsive Modal Forms**: Stacked/side-by-side layouts with mobile optimization
- **✅ Smart Table Handling**: Horizontal scroll and text truncation for mobile displays

## 🎯 Project Overview

The **Cebu Anti-Human Trafficking Dashboard** is a React-based single-page web application that provides comprehensive monitoring tools for anti-trafficking efforts in Cebu, Philippines. Featuring a modern Linear.app-inspired interface, it consolidates case management, geographic analysis, keyword monitoring, and statistical visualization into one seamless experience.

## 🛠️ Technology Stack

### Core Technologies
- **React 19.1.0** - Frontend framework with latest hooks and features
- **Vite 7.0.3** - Lightning-fast build tool and development server
- **TailwindCSS 4.1.11** - Utility-first CSS framework for responsive design
- **Recharts 2.13.3** - ⭐ **NEW** - Interactive data visualization library

### Key Dependencies
- **Leaflet 1.9.4** & **React-Leaflet 5.0.0** - Interactive maps and heatmap visualization
- **Lucide React 0.525.0** - Comprehensive icon library with 1000+ icons
- **React DOM 19.1.0** - React DOM rendering for web applications

### Development Tools
- **ESLint** - Code quality and consistency
- **Vite Plugins** - React support and optimized builds
- **Modern Browser Support** - ES2022+ features

## 📁 Updated Project Structure

```
src/
├── components/              # Reusable UI components
│   ├── CasesTable.jsx          # Enhanced case reports table with search
│   ├── CategorySection.jsx     # ⭐ ENHANCED - Category analysis with sorting
│   ├── CategoryStatCard.jsx    # ⭐ REFINED - Linear-inspired minimal cards
│   ├── CategoryTable.jsx       # Category breakdown table
│   ├── CategoryLineGraph.jsx   # ⭐ NEW - Interactive line chart component
│   ├── DashboardCard.jsx       # Statistics overview cards
│   ├── Header.jsx              # ⭐ SIMPLIFIED - Clean header without navigation
│   ├── HeatmapMap.jsx          # Interactive map component
│   ├── KeywordLogTable.jsx     # Keyword monitoring table
│   └── Sidebar.jsx             # ⭐ REMOVED - No longer needed in single-page design
├── pages/                   # ⭐ REMOVED - Converted to inline sections
├── data/                    # Static JSON data files
│   ├── caseReports.json        # Case report records
│   ├── categoryStats.json      # ⭐ NEW - Category statistics for line graph
│   ├── dashboardStats.json     # Dashboard overview statistics
│   └── keywordLogs.json        # Keyword detection logs
├── App.jsx                  # ⭐ COMPLETELY REDESIGNED - Single-page layout
├── main.jsx                 # Application entry point
└── index.css               # Global styles and Tailwind imports
```

## 🌟 Dashboard Sections (Single Page Layout)

### 1. 📊 Dashboard Overview
- **Key Statistics Grid**: 4 main metrics with visual indicators
  - Total Reports Detected: 120
  - Facebook Pages Monitored: 15  
  - Cases Flagged by Keywords: 34
  - High-Risk Locations: 7
- **Preview Tables**: Quick overview of recent cases and keyword detections
- **Professional Layout**: Centered titles with clear grid separation

### 2. 📈 Case Categories Analysis ⭐ **NEW SECTION**
- **Interactive Line Graph**: Recharts-powered visualization showing category trends
  - Custom tooltips with case count details
  - Smooth animations and hover effects
  - Professional styling matching dashboard theme
- **Category Statistics**: Quick overview cards with sorting by case count
- **Enhanced Category Cards**: Linear-inspired minimal design with clear data presentation

### 3. 📋 Case Reports Management
- **Comprehensive Case Table**: Full case tracking with search functionality
- **Advanced Filtering**: Search by location, type, status, or reporter
- **Summary Statistics**: Quick stats showing total cases and breakdown by status
- **Add New Cases**: Responsive modal forms for case entry

### 4. 🗺️ Geographic Risk Analysis
- **Interactive Cebu Map**: OpenStreetMap integration with verified coordinates
- **Risk Location Markers**: Color-coded indicators for risk levels
  - 🔴 **High Risk**: Carbon Market (major commercial hub)
  - 🟡 **Medium Risk**: Fuente Osmeña Circle (central intersection)  
  - 🟢 **Low Risk**: IT Park - Apas (secure business district)
- **Location Details**: Click markers for comprehensive location information

### 5. 🔍 Keyword Detection System
- **Social Media Monitoring**: Track suspicious keywords across Facebook pages
- **Detection Logs Table**: Responsive table with search and filter capabilities
- **Keyword Statistics**: Overview of detection patterns and flagged content
- **Manual Entry System**: Add new keyword detections with form validation

## 📊 Enhanced Data Visualization

### Line Graph Features ⭐ **NEW**
```javascript
// Category statistics visualization
- Interactive line chart with smooth curves
- Custom tooltips showing detailed case counts
- Responsive design adapting to screen size
- Professional color scheme matching dashboard theme
- Hover animations and focus indicators
```

### Responsive Design System
```css
/* Adaptive button sizing */
Mobile:  px-4 py-3 (compact touch targets)
Tablet:  px-6 py-4 (balanced sizing)
Desktop: px-8 py-4 (spacious desktop layout)

/* Progressive icon scaling */
Mobile:  w-4 h-4 (18px)
Tablet:  w-5 h-5 (20px)  
Desktop: w-6 h-6 (24px)
```

## 🎨 Linear.app Inspired Design System

### Color Palette
- **Primary Background**: `slate-950` - Deep, professional dark base
- **Secondary Background**: `slate-900` - Elevated sections and cards
- **Tertiary Background**: `slate-800` - Interactive elements and borders
- **Accent Colors**: Strategic use of blue, green, yellow, and red for status indicators

### Typography & Spacing
- **Centered Titles**: All section headings professionally centered
- **Visual Hierarchy**: Clear text scaling (text-xl, text-lg, text-base, text-sm)
- **Grid Separation**: Visible borders creating clear section boundaries
- **Consistent Spacing**: Harmonious padding and margins throughout

### Interactive Elements
- **Touch Optimization**: `touch-manipulation` for smooth mobile interactions
- **Active States**: Proper feedback with `active:` classes
- **Hover Effects**: Subtle transformations and color changes
- **Focus Indicators**: Accessibility-compliant focus outlines

## 🚀 Development Setup

### Prerequisites
- **Node.js 18+** (compatible with React 19)
- **npm or yarn** package manager
- **Modern Browser** (Chrome 90+, Firefox 88+, Safari 14+)

### Installation & Scripts
```bash
# Clone the repository
git clone [repository-url]
cd HackathonDashboard

# Install dependencies (includes new Recharts library)
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

### New Dependencies Added
```json
{
  "recharts": "^2.13.3"  // Interactive chart library for line graph
}
```

## 📱 Responsive Design Features

### Mobile-First Approach
- **Breakpoint Strategy**: sm: (640px+), lg: (1024px+), xl: (1280px+)
- **Adaptive Layouts**: Single column mobile → multi-column desktop
- **Touch-Friendly**: Optimized button sizes and touch targets
- **Mobile Tables**: Horizontal scroll with text truncation for data preservation

### Cross-Device Optimization
- **Button Adaptivity**: Size scaling based on screen real estate
- **Icon Progression**: Larger icons on larger screens for better visibility  
- **Modal Responsiveness**: Stacked mobile forms → side-by-side desktop layouts
- **Text Responsiveness**: Appropriate font sizes across all devices

## 🆕 New Component: CategoryLineGraph

```jsx
// Interactive line chart with custom styling
- Recharts LineChart with responsive container
- Custom tooltip showing category name and case count
- Smooth curve animation with professional styling
- Grid lines and axis styling matching dashboard theme
- Mobile-responsive with adaptive sizing
```

## 🔄 Architecture Changes Log

### Version 3.0 - Single Page Transformation
1. **Router Elimination**
   - Removed React Router DOM dependency
   - Eliminated Sidebar navigation component
   - Converted page components to inline sections

2. **Layout Redesign**
   - Implemented continuous scrollable layout
   - Added clear visual section separation with borders
   - Centered all section titles for professional appearance

3. **Component Enhancements**
   - Enhanced `CategorySection.jsx` with improved sorting and styling
   - Refined `CategoryStatCard.jsx` with Linear-inspired minimal design
   - Added new `CategoryLineGraph.jsx` with Recharts integration

4. **Responsive Excellence**
   - Implemented mobile-first responsive design principles
   - Added adaptive button and icon sizing systems
   - Enhanced touch optimization for mobile devices

5. **Visual Design Overhaul**
   - Applied Linear.app inspired color scheme throughout
   - Added comprehensive grid visual separation
   - Improved typography hierarchy and content alignment


**Made with ❤️ for a safer Cebu** | **Single-Page Dashboard v3.0** | **Last Updated**: July 10, 2025
