'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Upload, 
  Trash2, 
  Save, 
  Camera,
  KeyRound,
  Lock,
  Sparkles,
  Users,
  CheckCircle,
  ShieldAlert,
  Globe,
  Copy,
  Check,
  Compass
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import FormPhoneInput from '@/components/FormPhoneInput';
import { getSessionAction, logoutAction } from '@/actions/authActions';
import { updateProfileAction, changePasswordAction } from '@/actions/profileActions';
import { schoolProfileSchema, changePasswordSchema } from '@/validators/authSchemas';
import { notifySuccess, notifyError } from '@/lib/notify';

/**
 * Compact & Sleek My School Profile Workspace
 */
export default function SchoolProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  // Active Tab State: 'branding' | 'contacts' | 'security'
  const [activeTab, setActiveTab] = useState('branding');
  const [copiedCode, setCopiedCode] = useState(false);
  
  // Profile Form States
  const [formData, setFormData] = useState({
    school_name: '',
    email: '',
    code: '',
    phone: '',
    address: '',
    latitude: '',
    longitude: '',
    logo: ''
  });

  const [profileErrors, setProfileErrors] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Password Form States
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [loadingPassword, setLoadingPassword] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const session = await getSessionAction();
        if (session && session.user) {
          let u = session.user;

          if (session.user.id) {
            try {
              const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/school';
              const res = await fetch(`${apiUrl}/profile?schoolId=${session.user.id}`, { cache: 'no-store' });
              const profileRes = await res.json();
              if (profileRes.success && profileRes.data) {
                u = profileRes.data;
              }
            } catch (e) {
              console.warn('Could not fetch fresh profile in Profile page:', e);
            }
          }

          const currentLogo = u.logo || '';
          setFormData({
            school_name: u.schoolName || u.school_name || u.name || '',
            email: u.email || '',
            code: u.code || 'SCH-1001',
            phone: u.phone || '',
            address: u.address || '',
            latitude: u.latitude !== undefined && u.latitude !== null ? String(u.latitude) : '',
            longitude: u.longitude !== undefined && u.longitude !== null ? String(u.longitude) : '',
            logo: currentLogo
          });

          if (currentLogo) {
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000';
            const fullLogo = currentLogo.startsWith('/uploads/') ? `${baseUrl}${currentLogo}` : currentLogo;
            setPreviewUrl(fullLogo);
          } else {
            setPreviewUrl('');
          }
        }
      } catch (err) {
        console.error('Error loading school profile:', err);
      }
    };

    loadProfile();
    window.addEventListener('sessionUpdated', loadProfile);
    return () => window.removeEventListener('sessionUpdated', loadProfile);
  }, []);

  const getInitials = () => {
    const name = formData.school_name || 'School';
    const words = name.split(' ').filter(Boolean);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { label: '', color: 'bg-slate-200', width: '0%' };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) return { label: 'Weak', color: 'bg-rose-500', width: '33%' };
    if (score <= 4) return { label: 'Medium', color: 'bg-amber-500', width: '66%' };
    return { label: 'Strong', color: 'bg-emerald-500', width: '100%' };
  };

  const pwdStrength = getPasswordStrength(passwordData.new_password);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(formData.code);
    setCopiedCode(true);
    notifySuccess(`Copied code ${formData.code} to clipboard`);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      notifyError('Please select a valid image file (PNG, JPEG, WEBP)');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      notifyError('Image size should be less than 15MB');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveLogo = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setFormData((prev) => ({ ...prev, logo: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoadingProfile(true);
    setProfileErrors({});

    try {
      await schoolProfileSchema.validate(formData, { abortEarly: false });
    } catch (yupErr) {
      if (yupErr.inner) {
        const errorsObj = {};
        yupErr.inner.forEach((err) => {
          if (err.path && !errorsObj[err.path]) {
            errorsObj[err.path] = err.message;
          }
        });
        setProfileErrors(errorsObj);
        notifyError('Please fix the form errors highlighted in red.');
      } else {
        notifyError(yupErr.message);
      }
      setLoadingProfile(false);
      return;
    }

    try {
      const sendFormData = new FormData();
      sendFormData.append('school_name', formData.school_name);
      sendFormData.append('email', formData.email);
      sendFormData.append('phone', formData.phone || '');
      sendFormData.append('address', formData.address || '');

      if (selectedFile) {
        sendFormData.append('logo', selectedFile);
      } else if (formData.logo === '') {
        sendFormData.append('logo', '');
      }

      const result = await updateProfileAction(sendFormData);

      if (!result.success) {
        if (result.errors) {
          const errs = {};
          Object.entries(result.errors).forEach(([field, msgs]) => {
            errs[field] = Array.isArray(msgs) ? msgs.join(', ') : msgs;
          });
          setProfileErrors(errs);
        }
        notifyError(result.message || 'Failed to update profile');
        return;
      }

      notifySuccess('School profile & logo updated successfully!');

      if (result.user?.logo) {
        setPreviewUrl(result.user.logo);
        setFormData((prev) => ({ ...prev, logo: result.user.logo }));
      }
      setSelectedFile(null);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('sessionUpdated'));
      }
    } catch (err) {
      notifyError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoadingPwd(true);
    setPwdErrors({});

    try {
      await changePasswordSchema.validate(passwordData, { abortEarly: false });
    } catch (yupErr) {
      if (yupErr.inner) {
        const errorsObj = {};
        yupErr.inner.forEach((err) => {
          if (err.path && !errorsObj[err.path]) {
            errorsObj[err.path] = err.message;
          }
        });
        setPwdErrors(errorsObj);
        notifyError('Please fix the password errors highlighted in red.');
      } else {
        notifyError(yupErr.message);
      }
      setLoadingPwd(false);
      return;
    }

    try {
      const result = await changePasswordAction(passwordData);

      if (!result.success) {
        if (result.errors) {
          const errs = {};
          Object.entries(result.errors).forEach(([field, msgs]) => {
            errs[field] = Array.isArray(msgs) ? msgs.join(', ') : msgs;
          });
          setPwdErrors(errs);
        }
        notifyError(result.message || 'Current password is incorrect.');
        return;
      }

      notifySuccess('Password updated successfully! Logging out for security...');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });

      setTimeout(async () => {
        await logoutAction();
        router.push('/login');
      }, 1500);
    } catch (err) {
      notifyError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoadingPwd(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fadeIn text-xs sm:text-sm">
      
      {/* 🌟 Hero Header Card */}
      <div className="relative rounded-2xl overflow-hidden glass-panel p-5 sm:p-6 border border-slate-200 shadow-xs bg-gradient-to-br from-slate-50 via-white to-primary-50/30">
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5 text-center sm:text-left">
          
          <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-5">
            <div className="relative group shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 p-0.5 shadow-xs">
                <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center overflow-hidden">
                  {previewUrl ? (
                    <img 
                      src={previewUrl} 
                      alt="School Logo" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-black text-slate-800">{getInitials()}</span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex flex-col items-center justify-center text-white cursor-pointer"
              >
                <Camera size={20} className="mb-0.5" />
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle size={10} /> Verified Campus
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="bg-slate-100 border border-slate-200 hover:border-primary-500 text-primary-600 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 transition cursor-pointer"
                >
                  {copiedCode ? <Check size={10} className="text-emerald-600" /> : <Copy size={10} />}
                  CODE: {formData.code}
                </button>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {formData.school_name || 'School Name'}
              </h1>
              <p className="text-slate-500 text-xs flex items-center justify-center sm:justify-start gap-1.5">
                <Mail size={13} className="text-primary-600 shrink-0" />
                <span>{formData.email || 'school@gmail.com'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center min-w-[90px]">
              <span className="block text-sm font-extrabold text-slate-900">1,248</span>
              <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider flex items-center justify-center gap-1">
                <Users size={9} className="text-primary-600" /> Students
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center min-w-[90px]">
              <span className="block text-sm font-extrabold text-emerald-600">ONLINE</span>
              <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider flex items-center justify-center gap-1">
                <Globe size={9} className="text-emerald-600" /> NFC Portal
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="flex border-b border-slate-200 space-x-2 overflow-x-auto pb-1.5 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('branding')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${
            activeTab === 'branding'
              ? 'bg-primary-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
          }`}
        >
          <Building2 size={15} />
          <span>Branding & Logo</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('contacts')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${
            activeTab === 'contacts'
              ? 'bg-primary-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
          }`}
        >
          <MapPin size={15} />
          <span>Contacts & Location</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${
            activeTab === 'security'
              ? 'bg-primary-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200'
          }`}
        >
          <KeyRound size={15} />
          <span>Security & Password</span>
        </button>
      </div>

      {/* TAB 1: BRANDING & LOGO */}
      {activeTab === 'branding' && (
        <Card title="Institutional Branding & Logo" icon={Building2} subtitle="Manage your logo and school details">
          <form noValidate onSubmit={handleProfileSubmit} className="space-y-6 pt-1">
            
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-primary-600" /> School Campus Logo
                  </h3>
                  <p className="text-[10px] text-slate-500">Stored at <code className="text-primary-600 font-medium">backend/uploads/schools/</code></p>
                </div>
                <Badge variant="primary">Max 15MB</Badge>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group shrink-0">
                  <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 p-0.5 shadow-xs">
                    <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center overflow-hidden">
                      {previewUrl ? (
                        <img 
                          src={previewUrl} 
                          alt="School Logo" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-black text-slate-800">{getInitials()}</span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex flex-col items-center justify-center text-white cursor-pointer"
                  >
                    <Camera size={18} className="mb-0.5" />
                    <span className="text-[9px] font-bold uppercase">Change</span>
                  </button>
                </div>

                <div className="space-y-2.5 text-center sm:text-left flex-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="primary"
                      icon={Upload}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Select Logo File
                    </Button>

                    {previewUrl && (
                      <Button
                        type="button"
                        variant="danger"
                        icon={Trash2}
                        onClick={handleRemoveLogo}
                      >
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-[10px] text-slate-500">
                    <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-md">Formats: PNG, JPG, WEBP</span>
                    <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-md">Square 1:1</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="School Institution Name"
                required
                icon={Building2}
                value={formData.school_name}
                error={profileErrors.school_name}
                onChange={(e) => {
                  setFormData({ ...formData, school_name: e.target.value });
                  setProfileErrors((prev) => ({ ...prev, school_name: '' }));
                }}
                placeholder="e.g. Greenwood International School"
              />

              <Input
                label="Registration Code"
                disabled
                icon={ShieldCheck}
                value={formData.code}
                placeholder="SCH-1001"
              />

              <Input
                label="Official Email Address"
                required
                type="email"
                icon={Mail}
                value={formData.email}
                error={profileErrors.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  setProfileErrors((prev) => ({ ...prev, email: '' }));
                }}
                placeholder="school@gmail.com"
              />

              <FormPhoneInput
                label="Campus Contact Phone"
                defaultCountry="in"
                value={formData.phone}
                error={profileErrors.phone}
                onChange={(phone) => {
                  setFormData({ ...formData, phone: phone });
                  setProfileErrors((prev) => ({ ...prev, phone: '' }));
                }}
              />
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button
                type="submit"
                variant="primary"
                loading={loadingProfile}
                icon={Save}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* TAB 2: CONTACTS & LOCATION */}
      {activeTab === 'contacts' && (
        <Card title="Campus Location & Contact Directory" icon={MapPin} subtitle="Update physical address and administration contacts">
          <form noValidate onSubmit={handleProfileSubmit} className="space-y-6 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormPhoneInput
                label="Primary Phone Contact"
                defaultCountry="in"
                value={formData.phone}
                error={profileErrors.phone}
                onChange={(phone) => {
                  setFormData({ ...formData, phone: phone });
                  setProfileErrors((prev) => ({ ...prev, phone: '' }));
                }}
              />

              <Input
                label="Official Institutional Email"
                type="email"
                icon={Mail}
                value={formData.email}
                error={profileErrors.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  setProfileErrors((prev) => ({ ...prev, email: '' }));
                }}
                placeholder="school@gmail.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Physical Campus Address
              </label>
              <div className="relative">
                <span className="absolute top-3 left-0 pl-3 flex items-start text-slate-400 pointer-events-none">
                  <MapPin size={16} />
                </span>
                <textarea
                  rows={3}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-primary-500 transition-all duration-200 resize-none"
                  placeholder="Enter complete physical address details..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
              <Input
                label="Campus GPS Latitude"
                type="number"
                step="any"
                icon={Compass}
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                placeholder="e.g. 19.1136"
              />

              <Input
                label="Campus GPS Longitude"
                type="number"
                step="any"
                icon={Compass}
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                placeholder="e.g. 72.8697"
              />
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button
                type="submit"
                variant="primary"
                loading={loadingProfile}
                icon={Save}
              >
                Save Contacts
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* TAB 3: SECURITY & PASSWORD */}
      {activeTab === 'security' && (
        <Card title="Security & Password Management" icon={KeyRound} subtitle="Update your portal access password">
          <form noValidate onSubmit={handlePasswordSubmit} className="space-y-6 pt-1">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Input
                label="Current Password"
                type="password"
                required
                icon={Lock}
                value={passwordData.current_password}
                error={pwdErrors.current_password}
                onChange={(e) => {
                  setPasswordData({ ...passwordData, current_password: e.target.value });
                  setPwdErrors((prev) => ({ ...prev, current_password: '' }));
                }}
                placeholder="••••••••"
              />

              <div className="space-y-1.5">
                <Input
                  label="New Password"
                  type="password"
                  required
                  icon={KeyRound}
                  value={passwordData.new_password}
                  error={pwdErrors.new_password}
                  onChange={(e) => {
                    setPasswordData({ ...passwordData, new_password: e.target.value });
                    setPwdErrors((prev) => ({ ...prev, new_password: '' }));
                  }}
                  placeholder="••••••••"
                />

                {passwordData.new_password && (
                  <div className="space-y-1">
                    <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${pwdStrength.color} transition-all duration-500`}
                        style={{ width: pwdStrength.width }}
                      ></div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 block text-right">
                      {pwdStrength.label}
                    </span>
                  </div>
                )}
              </div>

              <Input
                label="Confirm New Password"
                type="password"
                required
                icon={KeyRound}
                value={passwordData.confirm_password}
                error={pwdErrors.confirm_password}
                onChange={(e) => {
                  setPasswordData({ ...passwordData, confirm_password: e.target.value });
                  setPwdErrors((prev) => ({ ...prev, confirm_password: '' }));
                }}
                placeholder="••••••••"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start space-x-2.5">
              <ShieldAlert size={16} className="shrink-0 mt-0.5 text-amber-600" />
              <div>
                <p className="font-bold">Security Notice</p>
                <p className="text-slate-600 text-[10px] mt-0.5">
                  Updating your password will automatically destroy all session tokens and log you out.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button
                type="submit"
                variant="primary"
                loading={loadingPwd}
                icon={ShieldCheck}
              >
                Update Password
              </Button>
            </div>
          </form>
        </Card>
      )}

    </div>
  );
}
