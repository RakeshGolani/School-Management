'use client';
import { useState, useEffect, useRef } from 'react';
import { User, Mail, Phone, GraduationCap, BookOpen, Save, Camera, Upload, Trash2 } from 'lucide-react';
import Drawer from '@/components/ui/Drawer';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { updateTeacherProfileAction } from '@/actions/teacher/authActions';
import { notifySuccess, notifyError } from '@/lib/notify';

export default function TeacherProfileEditDrawer({ isOpen, onClose, user, onProfileUpdated }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    qualification: '',
    subject: '',
    gender: 'MALE'
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        qualification: user.qualification || '',
        subject: user.subject || '',
        gender: (user.gender || 'MALE').toUpperCase()
      });
      setPreviewUrl(user.image_url || user.photo || '');
      setSelectedFile(null);
    }
  }, [user, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        notifyError('Image size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      notifyError('Please enter your full name');
      return;
    }

    setLoading(true);
    try {
      const sendData = new FormData();
      sendData.append('id', user.id);
      sendData.append('name', formData.name);
      sendData.append('email', formData.email);
      sendData.append('phone', formData.phone);
      sendData.append('qualification', formData.qualification);
      sendData.append('subject', formData.subject);
      sendData.append('gender', formData.gender);
      if (selectedFile) {
        sendData.append('photo', selectedFile);
      }

      const res = await updateTeacherProfileAction(sendData);

      if (res.success) {
        notifySuccess('Teacher profile updated successfully');
        if (onProfileUpdated) {
          onProfileUpdated(res.user || { ...user, ...formData, ...(previewUrl ? { photo: previewUrl, image_url: previewUrl } : {}) });
        }
        onClose();
      } else {
        notifyError(res.message || 'Failed to update profile');
      }
    } catch (err) {
      notifyError(err.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const genderOptions = [
    { value: 'MALE', label: 'Male' },
    { value: 'FEMALE', label: 'Female' },
    { value: 'OTHER', label: 'Other' }
  ];

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Faculty Profile"
      subtitle="Update personal information, profile photo, and qualifications"
      icon={User}
      maxWidth="max-w-lg"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            loading={loading}
            icon={Save}
          >
            Save Changes
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Photo Upload Picker */}
        <div className="flex items-center space-x-5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="relative group shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-600 to-primary-400 p-0.5 shadow-md overflow-hidden">
              <div className="w-full h-full rounded-[14px] bg-slate-100 flex items-center justify-center text-slate-800 font-bold overflow-hidden">
                {previewUrl ? (
                  <img src={previewUrl} alt="Faculty Preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera size={20} className="text-slate-400" />
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center text-white cursor-pointer"
            >
              <Upload size={16} />
            </button>
          </div>

          <div className="space-y-1 flex-1 min-w-0">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoSelect}
              className="hidden"
            />
            <Button
              type="button"
              variant="secondary"
              icon={Upload}
              onClick={() => fileInputRef.current?.click()}
              className="text-xs py-1.5"
            >
              Upload Profile Photo
            </Button>
            <p className="text-[10px] text-slate-500">JPG, PNG, WebP up to 5MB</p>
          </div>
        </div>

        {/* Full Name */}
        <Input
          label="Full Faculty Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g. Dr. Vikram Mehta"
          icon={User}
          required
        />

        {/* Email Address */}
        <Input
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="e.g. faculty@school.com"
          icon={Mail}
          required
        />

        {/* Phone Number */}
        <Input
          label="Contact Phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="e.g. +91 9876543210"
          icon={Phone}
          required
        />

        {/* Qualification */}
        <Input
          label="Academic Qualifications"
          name="qualification"
          value={formData.qualification}
          onChange={handleChange}
          placeholder="e.g. M.Sc. Mathematics, B.Ed."
          icon={GraduationCap}
        />

        {/* Subject / Department */}
        <Input
          label="Primary Department / Subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          placeholder="e.g. Mathematics & Statistics"
          icon={BookOpen}
        />

        {/* Gender Selection */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Gender
          </label>
          <Select
            options={genderOptions}
            value={formData.gender}
            onChange={(val) => setFormData(prev => ({ ...prev, gender: val }))}
          />
        </div>
      </form>
    </Drawer>
  );
}
