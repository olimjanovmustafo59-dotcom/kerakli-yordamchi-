export type ToolCategory =
  | 'all'
  | 'ai'
  | 'qr_barcode'
  | 'documents'
  | 'image'
  | 'calculators'
  | 'developer'
  | 'security';

export interface ToolDefinition {
  id: string;
  name: string;
  shortDesc: string;
  category: ToolCategory;
  iconName: string;
  badge?: string;
  tags: string[];
}

export interface UserFeedback {
  id: string;
  timestamp: string;
  email: string;
  rating: number;
  message: string;
  category: string;
}

export interface SystemStatus {
  status: string;
  uptimeSeconds: number;
  hasApiKey: boolean;
  adminEmail: string;
  recentActivityCount: number;
  feedbackCount: number;
  activeToolsCount: number;
  version: string;
}

export type QRDataType =
  | 'text'
  | 'url'
  | 'wifi'
  | 'phone'
  | 'email'
  | 'sms'
  | 'vcard'
  | 'geo'
  | 'calendar'
  | 'social'
  | 'image_link'
  | 'file_link';

export interface QRCodeConfig {
  type: QRDataType;
  value: string;
  // Customization
  fgColor: string;
  bgColor: string;
  useGradient: boolean;
  gradientColor2: string;
  gradientType: 'linear' | 'radial';
  dotStyle: 'square' | 'dots' | 'rounded';
  cornerStyle: 'square' | 'rounded' | 'circle';
  frame: 'none' | 'simple' | 'badge' | 'scan_me';
  frameText: string;
  frameColor: string;
  logoUrl?: string;
  logoSize: number; // percentage, e.g. 20%
  quietZone: number; // padding in modules
  errorCorrection: 'L' | 'M' | 'Q' | 'H';
  size: number;
  transparentBg: boolean;
}

export type BarcodeFormat =
  | 'CODE128'
  | 'CODE39'
  | 'EAN13'
  | 'EAN8'
  | 'UPC'
  | 'ITF'
  | 'MSI'
  | 'pharmacode'
  | 'codabar';

export interface BarcodeConfig {
  format: BarcodeFormat;
  value: string;
  lineColor: string;
  background: string;
  width: number;
  height: number;
  margin: number;
  displayValue: boolean;
  fontSize: number;
}
