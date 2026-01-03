/**
 * Mapping from Feather icon names (stored in database) to Ionicon names
 * Used to display category icons in the mobile app
 */

export const featherToIoniconMap: Record<string, string> = {
  // Aliases
  'news': 'newspaper',

  // Navigation & UI
  'pricetag': 'pricetag',
  'home': 'home',
  'menu': 'menu',
  'grid': 'grid',
  'list': 'list',
  'layers': 'layers',
  'arrow-right': 'arrow-forward',
  'arrow-left': 'arrow-back',
  'arrow-up': 'arrow-up',
  'arrow-down': 'arrow-down',
  'chevron-down': 'chevron-down',
  'chevron-left': 'chevron-back',
  'chevron-right': 'chevron-forward',
  'chevron-up': 'chevron-up',
  'corner-down-left': 'arrow-back',
  'corner-down-right': 'arrow-forward',
  'corner-up-left': 'arrow-back',
  'corner-up-right': 'arrow-forward',

  // Content & Documents
  'book': 'book',
  'document': 'document',
  'file': 'document',
  'newspaper': 'newspaper',
  'inbox': 'mail',
  'mail': 'mail',

  // Communication
  'message-circle': 'chatbubble',
  'bell': 'notifications',
  'phone': 'call',
  'share': 'share-social',
  'share-2': 'share-social',

  // User & Account
  'person': 'person',
  'user': 'person',
  'settings': 'settings',
  'lock': 'lock-closed',
  'key': 'key',
  'eye': 'eye',
  'eye-off': 'eye-off',

  // Media
  'camera': 'camera',
  'image': 'image',
  'video': 'videocam',
  'music': 'musical-notes',
  'film': 'film',
  'mic': 'mic',
  'mic-off': 'mic-off',
  'volume': 'volume-medium',
  'volume-1': 'volume-low',
  'volume-2': 'volume-medium',
  'volume-x': 'volume-mute',

  // Business & Work
  'briefcase': 'briefcase',
  'dollar': 'cash',
  'credit-card': 'card',
  'shopping-cart': 'cart',
  'gift': 'gift',
  'calendar': 'calendar',
  'clock': 'time',
  'time': 'time',
  'stopwatch': 'stopwatch',

  // Organization
  'folder': 'folder',
  'download': 'download',
  'copy': 'copy',
  'save': 'save',
  'trash': 'trash',
  'filter': 'funnel',
  'search': 'search',
  'sort': 'swap-vertical',

  // Status & Indicators
  'heart': 'heart',
  'star': 'star',
  'alert-circle': 'alert-circle',
  'alert': 'alert',
  'info': 'information',
  'information': 'information',
  'help-circle': 'help-circle',
  'help': 'help',
  'check': 'checkmark',
  'checkmark': 'checkmark',
  'x': 'close',
  'close': 'close',
  'plus': 'add',
  'shield': 'shield',
  'award': 'ribbon',
  'trophy': 'trophy',

  // Technology
  'code': 'code',
  'monitor': 'desktop',
  'desktop': 'desktop',
  'smartphone': 'phone-portrait',
  'tablet': 'tablet-portrait',
  'tv': 'tv',
  'cpu': 'cpu',
  'database': 'server',
  'server': 'server',
  'hard-drive': 'server',
  'wifi': 'wifi',
  'wifi-off': 'wifi-off',
  'bluetooth': 'bluetooth',
  'command': 'terminal',
  'terminal': 'terminal',
  'git-branch': 'git-branch',
  'git-commit': 'git-commit',

  // Location & Maps
  'map': 'map',
  'map-pin': 'pin',
  'location': 'location',
  'compass': 'compass',
  'navigation': 'navigate',
  'globe': 'globe',

  // Weather & Nature
  'sun': 'sunny',
  'sunny': 'sunny',
  'cloud': 'cloud',
  'moon': 'moon',
  'umbrella': 'umbrella',
  'zap': 'flash',
  'flash': 'flash',
  'wind': 'thunderstorm',

  // Power & Controls
  'power': 'power',
  'battery': 'battery-full',
  'toggle-left': 'toggle',
  'toggle-right': 'toggle',
  'play': 'play',
  'pause': 'pause',
  'skip-back': 'skip-back',
  'skip-forward': 'skip-forward',
  'refresh': 'refresh',
  'refresh-cw': 'refresh',
  'refresh-ccw': 'refresh',
  'rotate-cw': 'refresh',
  'rotate-ccw': 'refresh',
  'repeat': 'repeat',

  // Charts & Analytics
  'activity': 'pulse',
  'bar-chart': 'bar-chart',
  'bar-chart-2': 'bar-chart',
  'pie-chart': 'pie-chart',
  'trending-up': 'trending-up',
  'trending-down': 'trending-down',

  // Text & Typography
  'type': 'text',
  'bold': 'bold',
  'italic': 'italic',
  'underline': 'underline',
  'link': 'link',

  // Design Tools
  'crop': 'crop',
  'airplay': 'tv',
  'tool': 'hammer',
  'edit': 'pencil',
};

export const getIoniconName = (featherIconName?: string | null): string => {
  if (!featherIconName) return 'pricetag';

  // Normalize input to avoid case/whitespace mismatches from the API/DB
  const key = featherIconName.toString().trim().toLowerCase();

  return featherToIoniconMap[key] || 'pricetag';
};
