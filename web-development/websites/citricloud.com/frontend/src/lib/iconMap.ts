import {
  FiTag, FiHome, FiMenu, FiGrid, FiList, FiLayers, FiArrowRight, FiArrowLeft,
  FiArrowUp, FiArrowDown, FiChevronDown, FiChevronLeft, FiChevronRight, FiChevronUp,
  FiCornerDownLeft, FiCornerDownRight, FiCornerUpLeft, FiCornerUpRight, FiBook,
  FiFile, FiFileText, FiInbox, FiMail, FiMessageCircle, FiBell, FiPhone, FiShare2,
  FiUser, FiSettings, FiLock, FiKey, FiEye, FiEyeOff, FiCamera, FiImage, FiVideo,
  FiMusic, FiMic, FiMicOff, FiVolume, FiVolume1, FiVolume2, FiVolumeX, FiBriefcase,
  FiDollarSign, FiPocket, FiShoppingCart, FiGift, FiCalendar, FiClock, FiFolder,
  FiDownload, FiCopy, FiSave, FiTrash, FiFilter, FiSearch, FiSliders, FiHeart,
  FiStar, FiAlertCircle, FiInfo, FiHelpCircle, FiCheck, FiX, FiPlus, FiShield,
  FiAward, FiCode, FiMonitor, FiSmartphone, FiTablet, FiTv, FiCpu, FiDatabase,
  FiServer, FiHardDrive, FiWifi, FiWifiOff, FiBluetooth, FiCommand, FiTerminal,
  FiGitBranch, FiGitCommit, FiMap, FiMapPin, FiCompass, FiGlobe, FiSun, FiCloud,
  FiMoon, FiUmbrella, FiZap, FiPower, FiBattery, FiToggleLeft, FiToggleRight,
  FiPlay, FiPause, FiSkipBack, FiSkipForward, FiRefreshCw, FiRefreshCcw,
  FiRotateCw, FiRotateCcw, FiRepeat, FiActivity, FiBarChart2, FiPieChart,
  FiTrendingUp, FiTrendingDown, FiType, FiBold, FiItalic, FiUnderline, FiLink,
  FiCrop, FiAirplay, FiTool, FiEdit
} from 'react-icons/fi';

export const iconMap: Record<string, any> = {
  // Navigation & UI
  'pricetag': FiTag,
  'home': FiHome,
  'menu': FiMenu,
  'grid': FiGrid,
  'list': FiList,
  'layers': FiLayers,
  'arrow-right': FiArrowRight,
  'arrow-left': FiArrowLeft,
  'arrow-up': FiArrowUp,
  'arrow-down': FiArrowDown,
  'chevron-down': FiChevronDown,
  'chevron-left': FiChevronLeft,
  'chevron-right': FiChevronRight,
  'chevron-up': FiChevronUp,
  'corner-down-left': FiCornerDownLeft,
  'corner-down-right': FiCornerDownRight,
  'corner-up-left': FiCornerUpLeft,
  'corner-up-right': FiCornerUpRight,
  
  // Content & Documents
  'book': FiBook,
  'document': FiFile,
  'file': FiFile,
  'newspaper': FiFileText,
  'inbox': FiInbox,
  'mail': FiMail,
  
  // Communication
  'message-circle': FiMessageCircle,
  'bell': FiBell,
  'phone': FiPhone,
  'share': FiShare2,
  'share-2': FiShare2,
  
  // User & Account
  'person': FiUser,
  'user': FiUser,
  'settings': FiSettings,
  'lock': FiLock,
  'key': FiKey,
  'eye': FiEye,
  'eye-off': FiEyeOff,
  
  // Media
  'camera': FiCamera,
  'image': FiImage,
  'video': FiVideo,
  'music': FiMusic,
  'film': FiVideo,
  'mic': FiMic,
  'mic-off': FiMicOff,
  'volume': FiVolume,
  'volume-1': FiVolume1,
  'volume-2': FiVolume2,
  'volume-x': FiVolumeX,
  
  // Business & Work
  'briefcase': FiBriefcase,
  'dollar': FiDollarSign,
  'credit-card': FiPocket,
  'shopping-cart': FiShoppingCart,
  'gift': FiGift,
  'calendar': FiCalendar,
  'clock': FiClock,
  'time': FiClock,
  'stopwatch': FiClock,
  
  // Organization
  'folder': FiFolder,
  'download': FiDownload,
  'copy': FiCopy,
  'save': FiSave,
  'trash': FiTrash,
  'filter': FiFilter,
  'search': FiSearch,
  'sort': FiSliders,
  
  // Status & Indicators
  'heart': FiHeart,
  'star': FiStar,
  'alert-circle': FiAlertCircle,
  'alert': FiAlertCircle,
  'info': FiInfo,
  'information': FiInfo,
  'help-circle': FiHelpCircle,
  'help': FiHelpCircle,
  'check': FiCheck,
  'checkmark': FiCheck,
  'x': FiX,
  'close': FiX,
  'plus': FiPlus,
  'shield': FiShield,
  'award': FiAward,
  'trophy': FiAward,
  
  // Technology
  'code': FiCode,
  'monitor': FiMonitor,
  'desktop': FiMonitor,
  'smartphone': FiSmartphone,
  'tablet': FiTablet,
  'tv': FiTv,
  'cpu': FiCpu,
  'database': FiDatabase,
  'server': FiServer,
  'hard-drive': FiHardDrive,
  'wifi': FiWifi,
  'wifi-off': FiWifiOff,
  'bluetooth': FiBluetooth,
  'command': FiCommand,
  'terminal': FiTerminal,
  'git-branch': FiGitBranch,
  'git-commit': FiGitCommit,
  
  // Location & Maps
  'map': FiMap,
  'map-pin': FiMapPin,
  'location': FiMapPin,
  'compass': FiCompass,
  'navigation': FiCompass,
  'globe': FiGlobe,
  
  // Weather & Nature
  'sun': FiSun,
  'sunny': FiSun,
  'cloud': FiCloud,
  'moon': FiMoon,
  'umbrella': FiUmbrella,
  'zap': FiZap,
  'flash': FiZap,
  'wind': FiZap,
  
  // Power & Controls
  'power': FiPower,
  'battery': FiBattery,
  'toggle-left': FiToggleLeft,
  'toggle-right': FiToggleRight,
  'play': FiPlay,
  'pause': FiPause,
  'skip-back': FiSkipBack,
  'skip-forward': FiSkipForward,
  'refresh': FiRefreshCw,
  'refresh-cw': FiRefreshCw,
  'refresh-ccw': FiRefreshCcw,
  'rotate-cw': FiRotateCw,
  'rotate-ccw': FiRotateCcw,
  'repeat': FiRepeat,
  
  // Charts & Analytics
  'activity': FiActivity,
  'bar-chart': FiBarChart2,
  'bar-chart-2': FiBarChart2,
  'pie-chart': FiPieChart,
  'trending-up': FiTrendingUp,
  'trending-down': FiTrendingDown,
  
  // Text & Typography
  'type': FiType,
  'bold': FiBold,
  'italic': FiItalic,
  'underline': FiUnderline,
  'link': FiLink,
  
  // Design Tools
  'crop': FiCrop,
  'airplay': FiAirplay,
  'tool': FiTool,
  'edit': FiEdit,
};

export const getCategoryIcon = (iconName?: string | null): any => {
  if (!iconName) return FiTag;
  return iconMap[iconName] || FiTag;
};
