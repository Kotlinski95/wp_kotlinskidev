# WordPress PWA Manager

A comprehensive Progressive Web App (PWA) plugin for WordPress with complete admin control over all PWA features.

## Features

- **Complete PWA Functionality**: Transform your WordPress site into a full-featured PWA
- **Admin Interface**: Beautiful React/TypeScript admin interface for managing all settings
- **Customizable Colors**: Theme and background colors with live preview
- **Icon Management**: Upload and manage PWA icons (192x192, 512x512)
- **Install Prompts**: Configurable app installation prompts
- **Update Notifications**: Automatic update prompts for new app versions
- **Advanced Caching**: Multiple caching strategies (Cache First, Network First, Stale While Revalidate)
- **Offline Support**: Custom offline pages and offline detection
- **Push Notifications**: Full push notification support with VAPID keys
- **Service Worker**: Automatically generated service worker with advanced features
- **Web App Manifest**: Dynamic manifest generation
- **Responsive Design**: Works perfectly on all devices
- **Accessibility**: Full accessibility support with ARIA labels
- **Dark Mode**: Automatic dark mode support
- **High Contrast**: Support for high contrast mode
- **Reduced Motion**: Respects user's reduced motion preferences

## Installation

1. Upload the plugin folder to `/wp-content/plugins/`
2. Activate the plugin through the WordPress admin
3. Go to Settings > PWA Manager to configure your PWA

## Configuration

### General Settings
- App name and description
- Start URL and scope
- Display mode and orientation

### Appearance
- Theme color and background color
- Live mobile preview

### Icons
- Upload PWA icons with drag-and-drop
- Automatic validation and optimization

### Install Prompts
- Customizable installation prompts
- Update notification settings

### Caching
- Choose from multiple caching strategies
- Configure cache limits and duration
- Custom offline pages

### Push Notifications
- VAPID key management
- Permission handling
- Test notifications

## Technical Details

- Built with TypeScript and React
- Uses @wordpress/scripts for building
- Service Worker with advanced caching
- REST API for settings management
- Follows WordPress coding standards

## Browser Support

- Chrome 67+
- Firefox 68+
- Safari 13+
- Edge 79+

## License

GPL v2 or later
