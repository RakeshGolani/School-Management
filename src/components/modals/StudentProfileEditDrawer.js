'use client';
import { useState, useEffect, useRef } from 'react';
import { User, Phone, MapPin, Calendar, Save, Camera, Upload } from 'lucide-react';
import Drawer from '@/components/ui/Drawer';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { updateStudentProfileAction } from '@/actions/student/authActions';
import { notifySuccess, notifyError } from '@/lib/notify';

export default function StudentProfileEditDrawer({ isOpen, onClose, user, onProfileUpdated }) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    guardian_name: '',
    guardian_phone: '',
    alternate_phone: '',
    address: '',
    dob: '',
    gender: 'MALE'
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        guardian_name: user.guardian_name || '',
        guardian_phone: user.guardian_phone || '',
        alternate_phone: user.alternate_phone || '',
        address: user.address || '',
        dob: user.dob ? user.dob.split('T')[0] : '',
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
    if (!formData.first_name.trim()) {
      notifyError('Please enter first name');
      return;
    }

    setLoading(true);
    try {
      const sendData = new FormData();
      sendData.append('id', user.id);
      sendData.append('first_name', formData.first_name);
      sendData.append('last_name', formData.last_name);
      sendData.append('guardian_name', formData.guardian_name);
      sendData.append('guardian_phone', formData.guardian_phone);
      sendData.append('alternate_phone', formData.alternate_phone);
      sendData.append('address', formData.address);
      sendData.append('dob', formData.dob);
      sendData.append('gender', formData.gender);
      if (selectedFile) {
        sendData.append('photo', selectedFile);
      }

      const res = await updateStudentProfileAction(sendData);

      if (res.success) {
        notifySuccess('Student profile updated successfully');
        if (onProfileUpdated) {
          onProfileUpdated(res.user || { 
            ...user, 
            ...formData, 
            full_name: `${formData.first_name} ${formData.last_name}`.trim(),
            ...(previewUrl ? { photo: previewUrl, image_url: previewUrl } : {}) 
          });
        }
        onClose();
      } else {
        notifyError(res.message || 'Failed to update profile');
      }
    } catch (err) {
      notifyError(err.message || 'Error updating student profile');
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
      title="Edit Student Information"
      subtitle="Update personal profile, student photo, and guardian contact"
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
                  <img src={previewUrl} alt="Student Preview" className="w-full h-full object-cover" />
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
              Upload Student Photo
            </Button>
            <p className="text-[10px] text-slate-500">JPG, PNG, WebP up to 5MB</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* First Name */}
          <Input
            label="First Name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            placeholder="e.g. Aarav"
            icon={User}
            required
          />

          {/* Last Name */}
          <Input
            label="Last Name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            placeholder="e.g. Patel"
            icon={User}
          />
        </div>

        {/* Guardian Name */}
        <Input
          label="Guardian / Father's Name"
          name="guardian_name"
          value={formData.guardian_name}
          onChange={handleChange}
          placeholder="e.g. Rajesh Patel"
          icon={User}
          required
        />

        {/* Guardian Phone */}
        <Input
          label="Primary Guardian Phone"
          name="guardian_phone"
          value={formData.guardian_phone}
          onChange={handleChange}
          placeholder="e.g. +91 9876543210"
          icon={Phone}
          required
        />

        {/* Alternate Phone */}
        <Input
          label="Alternate Contact Phone"
          name="alternate_phone"
          value={formData.alternate_phone}
          onChange={handleChange}
          placeholder="e.g. +91 9876543211"
          icon={Phone}
        />

        <div className="grid grid-cols-2 gap-4">
          {/* Date of Birth */}
          <Input
            label="Date of Birth"
            name="dob"
            type="date"
            value={formData.dob}
            onChange={handleChange}
            icon={Calendar}
          />

          {/* Gender */}
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
        </div>

        {/* Address */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Residential Address
          </label>
          <textarea
            name="address"
            rows={3}
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter student residential address..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-slate-400"
          />
        </div>
      </form>
    </Drawer>
  );
}
