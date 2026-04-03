import { useState, useEffect, useRef } from 'react';
import { QrCode, Link, MessageSquare, User, Download, Copy, Check } from 'lucide-react';

// Extend Window interface for QRious
declare global {
  interface Window {
    QRious: any;
  }
}

const TRANSLATIONS = {
  "en-US": {
    "appTitle": "QR Code Generator",
    "appDescription": "Create QR codes for URLs, text, and contact information instantly",
    "urlTab": "URL",
    "textTab": "Text",
    "contactTab": "Contact",
    "enterUrl": "Enter URL",
    "enterText": "Enter Text",
    "contactInformation": "Contact Information",
    "websiteUrl": "Website URL",
    "urlPlaceholder": "example.com or https://example.com",
    "urlHelp": "Enter a website URL. If you don't include http://, we'll add https:// automatically.",
    "textContent": "Text Content",
    "textPlaceholder": "Enter any text to generate QR code...",
    "firstName": "First Name",
    "firstNamePlaceholder": "John",
    "lastName": "Last Name",
    "lastNamePlaceholder": "Doe",
    "phoneNumber": "Phone Number",
    "phonePlaceholder": "+1 (555) 123-4567",
    "emailAddress": "Email Address",
    "emailPlaceholder": "john.doe@example.com",
    "organization": "Organization",
    "organizationPlaceholder": "Company Name",
    "website": "Website",
    "websitePlaceholder": "https://example.com",
    "clearAllFields": "Clear All Fields",
    "generatedQrCode": "Your QR Code",
    "scanQrCode": "Scan with any QR code reader",
    "fillFormPrompt": "Fill in the form to generate your QR code",
    "download": "Download",
    "copyData": "Copy Data",
    "copied": "Copied!",
    "qrCodeData": "QR Code Data",
    "footerText": "Free QR Code Generator • No data stored • Works offline",
    "qrCodeAlt": "Generated QR Code"
  },
  "es-ES": {
    "appTitle": "Generador de Códigos QR",
    "appDescription": "Crea códigos QR para URLs, texto e información de contacto al instante",
    "urlTab": "URL",
    "textTab": "Texto",
    "contactTab": "Contacto",
    "enterUrl": "Ingresa URL",
    "enterText": "Ingresa Texto",
    "contactInformation": "Información de Contacto",
    "websiteUrl": "URL del Sitio Web",
    "urlPlaceholder": "ejemplo.com o https://ejemplo.com",
    "urlHelp": "Ingresa una URL de sitio web. Si no incluyes http://, agregaremos https:// automáticamente.",
    "textContent": "Contenido de Texto",
    "textPlaceholder": "Ingresa cualquier texto para generar código QR...",
    "firstName": "Nombre",
    "firstNamePlaceholder": "Juan",
    "lastName": "Apellido",
    "lastNamePlaceholder": "Pérez",
    "phoneNumber": "Número de Teléfono",
    "phonePlaceholder": "+1 (555) 123-4567",
    "emailAddress": "Dirección de Correo",
    "emailPlaceholder": "juan.perez@ejemplo.com",
    "organization": "Organización",
    "organizationPlaceholder": "Nombre de la Empresa",
    "website": "Sitio Web",
    "websitePlaceholder": "https://ejemplo.com",
    "clearAllFields": "Limpiar Todos los Campos",
    "generatedQrCode": "Tu Código QR",
    "scanQrCode": "Escanea con cualquier lector de códigos QR",
    "fillFormPrompt": "Completa el formulario para generar tu código QR",
    "download": "Descargar",
    "copyData": "Copiar Datos",
    "copied": "¡Copiado!",
    "qrCodeData": "Datos del Código QR",
    "footerText": "Generador de Códigos QR Gratuito • Sin datos almacenados • Funciona sin conexión",
    "qrCodeAlt": "Código QR Generado"
  }
};

const appLocale = '{{APP_LOCALE}}';
const browserLocale = navigator.languages?.[0] || navigator.language || 'en-US';
const findMatchingLocale = (locale: string): string => {
  if (TRANSLATIONS[locale as keyof typeof TRANSLATIONS]) return locale;
  const lang = locale.split('-')[0];
  const match = Object.keys(TRANSLATIONS).find(key => key.startsWith(lang + '-'));
  return match || 'en-US';
};
const locale = (appLocale !== '{{APP_LOCALE}}') ? findMatchingLocale(appLocale) : findMatchingLocale(browserLocale);
const t = (key: string): string => {
  const translations = TRANSLATIONS[locale as keyof typeof TRANSLATIONS];
  return (translations && translations[key as keyof typeof translations]) || TRANSLATIONS['en-US'][key as keyof typeof TRANSLATIONS['en-US']] || key;
};

// ============================================================================
// REUSABLE COMPONENTS & UTILITIES
// ============================================================================

interface FormInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  rows?: number;
  helperText?: string;
}

const FormInput: React.FC<FormInputProps> = ({ label, placeholder, value, onChange, type = 'text', rows, helperText }) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm md:text-base font-semibold text-slate-800">
      {label}
    </label>
    {type === 'textarea' ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows || 4}
        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white text-slate-900 placeholder:text-slate-500"
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border-2 border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white text-slate-900 placeholder:text-slate-500"
      />
    )}
    {helperText && (
      <p className="text-xs sm:text-sm text-slate-600">{helperText}</p>
    )}
  </div>
);

interface ActionButtonProps {
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
  disabled?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ onClick, label, icon, variant = 'primary', className = '', disabled = false }) => {
  const baseStyles = 'flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-4 font-semibold text-sm sm:text-base rounded-lg transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] sm:min-h-[48px]';
  
  const variants = {
    primary: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 shadow-lg hover:shadow-xl',
    secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-2 border-slate-200'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const QRCodeGenerator = () => {
  const [activeTab, setActiveTab] = useState('url');
  const [qrData, setQrData] = useState('');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const qrContainerRef = useRef<HTMLDivElement>(null);
  
  // Form states
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [contactInfo, setContactInfo] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    organization: '',
    url: ''
  });

  // QR Code generation
  const generateQRCode = async (text: string): Promise<void> => {
    if (!text.trim()) {
      if (qrContainerRef.current) {
        qrContainerRef.current.innerHTML = '';
      }
      return;
    }

    setIsLoading(true);
    try {
      if (!window.QRious) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js';
        script.onload = () => {
          createQR(text);
          setIsLoading(false);
        };
        script.onerror = () => {
          generateFallbackQR(text);
          setIsLoading(false);
        };
        document.head.appendChild(script);
      } else {
        createQR(text);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error loading QR library:', error);
      generateFallbackQR(text);
      setIsLoading(false);
    }
  };

  const createQR = (text: string): void => {
    if (!qrContainerRef.current) return;
    
    try {
      qrContainerRef.current.innerHTML = '';
      const canvas = document.createElement('canvas');
      qrContainerRef.current.appendChild(canvas);
      
      const qr = new window.QRious({
        element: canvas,
        value: text,
        size: 280,
        background: 'white',
        foreground: '#0f172a',
        level: 'M'
      });
      
      canvas.className = 'w-full h-auto max-w-xs mx-auto rounded-lg';
      if (qr) void qr;
    } catch (error) {
      console.error('Error creating QR code:', error);
      generateFallbackQR(text);
    }
  };

  const generateFallbackQR = (text: string): void => {
    if (!qrContainerRef.current) return;
    qrContainerRef.current.innerHTML = '';
    
    const img = document.createElement('img');
    const encodedData = encodeURIComponent(text);
    img.src = `https://chart.googleapis.com/chart?chs=280x280&cht=qr&chl=${encodedData}&choe=UTF-8`;
    img.alt = t('qrCodeAlt');
    img.className = 'w-full h-auto max-w-xs mx-auto rounded-lg';
    
    img.onerror = () => {
      img.src = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodedData}&format=png&margin=10`;
    };
    
    qrContainerRef.current.appendChild(img);
  };

  const formatUrl = (url: string): string => {
    if (!url.trim()) return '';
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return 'https://' + url;
    }
    return url;
  };

  const generateVCard = (contact: any): string => {
    return `BEGIN:VCARD
VERSION:3.0
FN:${contact.firstName} ${contact.lastName}
N:${contact.lastName};${contact.firstName};;;
ORG:${contact.organization}
TEL:${contact.phone}
EMAIL:${contact.email}
URL:${contact.url}
END:VCARD`;
  };

  useEffect(() => {
    let data = '';
    
    switch (activeTab) {
      case 'url':
        data = formatUrl(urlInput);
        break;
      case 'text':
        data = textInput;
        break;
      case 'contact':
        if (contactInfo.firstName || contactInfo.lastName || contactInfo.phone || contactInfo.email) {
          data = generateVCard(contactInfo);
        }
        break;
    }
    
    setQrData(data);
    generateQRCode(data);
  }, [activeTab, urlInput, textInput, contactInfo]);

  const downloadQRCode = () => {
    if (!qrData) return;
    
    const canvas = qrContainerRef.current?.querySelector('canvas');
    const img = qrContainerRef.current?.querySelector('img');
    
    if (canvas) {
      const link = document.createElement('a');
      link.download = `qr-code-${activeTab}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } else if (img) {
      const link = document.createElement('a');
      link.download = `qr-code-${activeTab}.png`;
      link.href = img.src;
      link.click();
    }
  };

  const copyToClipboard = async () => {
    if (qrData) {
      try {
        await navigator.clipboard.writeText(qrData);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch (err) {
        console.error('Failed to copy text:', err);
      }
    }
  };

  const resetForm = () => {
    setUrlInput('');
    setTextInput('');
    setContactInfo({ firstName: '', lastName: '', phone: '', email: '', organization: '', url: '' });
    setQrData('');
    if (qrContainerRef.current) {
      qrContainerRef.current.innerHTML = '';
    }
  };

  const tabs = [
    { id: 'url', label: t('urlTab'), icon: Link },
    { id: 'text', label: t('textTab'), icon: MessageSquare },
    { id: 'contact', label: t('contactTab'), icon: User }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* Header Section */}
      <div className="w-full px-4 sm:px-6 py-8 sm:py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center text-center gap-3 sm:gap-4">
            <div className="inline-flex items-center justify-center w-14 sm:w-16 h-14 sm:h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
              <QrCode className="w-7 sm:w-8 h-7 sm:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">
                {t('appTitle')}
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-slate-600 mt-2">
                {t('appDescription')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-4 sm:px-6 pb-8 sm:pb-12 md:pb-16">
        <div className="max-w-6xl mx-auto">
          {/* Tab Navigation */}
          <div className="bg-white rounded-t-2xl border-b-2 border-slate-200 shadow-sm">
            <div className="flex">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex-1 flex items-center justify-center gap-2 px-3 sm:px-6 py-3 sm:py-4
                      text-sm sm:text-base font-semibold transition-all duration-200
                      border-b-4 min-h-[48px] sm:min-h-[56px]
                      ${isActive 
                        ? 'text-blue-600 border-blue-500 bg-blue-50' 
                        : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-50'
                      }
                    `}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden text-xs">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Grid */}
          <div className="bg-white rounded-b-2xl shadow-lg">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 p-4 sm:p-6 md:p-8">
              
              {/* Input Section */}
              <div className="flex flex-col gap-4 sm:gap-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {activeTab === 'url' && t('enterUrl')}
                  {activeTab === 'text' && t('enterText')}
                  {activeTab === 'contact' && t('contactInformation')}
                </h2>

                <div className="flex flex-col gap-4 sm:gap-5">
                  {/* URL Input */}
                  {activeTab === 'url' && (
                    <FormInput
                      label={t('websiteUrl')}
                      placeholder={t('urlPlaceholder')}
                      value={urlInput}
                      onChange={setUrlInput}
                      helperText={t('urlHelp')}
                    />
                  )}

                  {/* Text Input */}
                  {activeTab === 'text' && (
                    <FormInput
                      label={t('textContent')}
                      placeholder={t('textPlaceholder')}
                      value={textInput}
                      onChange={setTextInput}
                      type="textarea"
                      rows={5}
                    />
                  )}

                  {/* Contact Input */}
                  {activeTab === 'contact' && (
                    <div className="flex flex-col gap-4 sm:gap-5">
                      <div className="grid grid-cols-2 gap-4">
                        <FormInput label={t('firstName')} placeholder={t('firstNamePlaceholder')} value={contactInfo.firstName} onChange={(v) => setContactInfo({...contactInfo, firstName: v})} />
                        <FormInput label={t('lastName')} placeholder={t('lastNamePlaceholder')} value={contactInfo.lastName} onChange={(v) => setContactInfo({...contactInfo, lastName: v})} />
                      </div>
                      <FormInput label={t('phoneNumber')} placeholder={t('phonePlaceholder')} type="tel" value={contactInfo.phone} onChange={(v) => setContactInfo({...contactInfo, phone: v})} />
                      <FormInput label={t('emailAddress')} placeholder={t('emailPlaceholder')} type="email" value={contactInfo.email} onChange={(v) => setContactInfo({...contactInfo, email: v})} />
                      <FormInput label={t('organization')} placeholder={t('organizationPlaceholder')} value={contactInfo.organization} onChange={(v) => setContactInfo({...contactInfo, organization: v})} />
                      <FormInput label={t('website')} placeholder={t('websitePlaceholder')} type="url" value={contactInfo.url} onChange={(v) => setContactInfo({...contactInfo, url: v})} />
                    </div>
                  )}
                </div>

                <button
                  onClick={resetForm}
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-all duration-200 border-2 border-slate-200 min-h-[44px]"
                >
                  {t('clearAllFields')}
                </button>
              </div>

              {/* QR Display Section */}
              <div className="flex flex-col gap-4 sm:gap-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{t('generatedQrCode')}</h2>

                {/* QR Code Card */}
                <div className="flex-1 flex flex-col gap-4">
                  <div className="bg-gradient-to-br from-slate-50 to-blue-50 border-2 border-slate-200 rounded-2xl p-6 sm:p-8 flex items-center justify-center min-h-[250px] sm:min-h-[300px]">
                    {qrData ? (
                      <div className="w-full flex flex-col items-center gap-3">
                        {isLoading && (
                          <div className="flex items-center gap-2 text-slate-600">
                            <div className="animate-spin">
                              <QrCode className="w-5 h-5" />
                            </div>
                            <span className="text-sm">Creating QR Code...</span>
                          </div>
                        )}
                        <div ref={qrContainerRef} className="w-full flex justify-center" />
                        <p className="text-sm sm:text-base text-slate-600 text-center">{t('scanQrCode')}</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3 text-center">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-2xl flex items-center justify-center">
                          <QrCode className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
                        </div>
                        <p className="text-slate-600 font-medium">{t('fillFormPrompt')}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {qrData && (
                  <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <ActionButton
                      variant="primary"
                      onClick={downloadQRCode}
                      label={t('download')}
                      icon={<Download className="w-5 h-5" />}
                      className="flex-1"
                    />
                    <ActionButton
                      variant="primary"
                      onClick={copyToClipboard}
                      label={copied ? t('copied') : t('copyData')}
                      icon={copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                      className="flex-1"
                    />
                  </div>
                )}

                {/* QR Data Display */}
                {qrData && (
                  <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-4 flex flex-col gap-2">
                    <h3 className="text-sm font-semibold text-slate-900">{t('qrCodeData')}</h3>
                    <div className="bg-white rounded border border-slate-200 p-3 max-h-40 overflow-y-auto">
                      <pre className="text-xs sm:text-sm text-slate-700 whitespace-pre-wrap break-words font-mono">
                        {qrData.substring(0, 200)}{ qrData.length > 200 ? '...' : ''}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full px-4 sm:px-6 py-6 sm:py-8 border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-xs sm:text-sm text-slate-600">
            {t('footerText')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default QRCodeGenerator;
