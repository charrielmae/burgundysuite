'use client';

import React, { useState, useRef } from 'react';
import {
  X,
  Plus,
  Image as ImageIcon,
  Users,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Hotel,
  UploadCloud,
  Cloud,
  Loader2,
  FileImage,
  Link as LinkIcon,
} from 'lucide-react';
import { NewRoomTypeRequest } from '@/types/database';

interface AddSuiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (suiteName: string) => void;
}

const PHOTO_PRESETS = [
  {
    name: 'Coastal Haven',
    url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Ocean Villa',
    url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Sunset Penthouse',
    url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Boutique Terrace',
    url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Royal Master',
    url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80',
  },
];

export default function AddSuiteModal({ isOpen, onClose, onSuccess }: AddSuiteModalProps) {
  const [roomType, setRoomType] = useState('');
  const [ratePerNight, setRatePerNight] = useState<number | ''>(320);
  const [roomCapacity, setRoomCapacity] = useState<number | ''>(2);
  const [imageUrl, setImageUrl] = useState(PHOTO_PRESETS[0].url);
  const [description, setDescription] = useState(
    'Spacious coastal retreat with ocean view balcony and plush king bedding.'
  );
  const [feature1, setFeature1] = useState('Balcony with Sea Breeze');
  const [feature2, setFeature2] = useState('En-suite Rain Shower');
  const [feature3, setFeature3] = useState('Artisanal Mini Bar');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cloudflare R2 Upload States
  const [imageMode, setImageMode] = useState<'upload' | 'presets' | 'url'>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (file: File) => {
    setError(null);
    setUploadSuccess(null);

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, WEBP, or GIF).');
      return;
    }

    // Immediate optimistic preview in UI
    const localPreviewUrl = URL.createObjectURL(file);
    setImageUrl(localPreviewUrl);
    setUploadedFileName(file.name);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'suites');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload image to Cloudflare R2');
      }

      // Update to permanent URL
      setImageUrl(data.data.url);
      setUploadSuccess(`Saved to Cloudflare R2 (burgundy-bucket): ${(data.data.size / 1024).toFixed(1)} KB`);
    } catch (err) {
      console.error('Upload error:', err);
      setError((err as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!roomType.trim()) {
      setError('Please enter a room or suite name.');
      return;
    }
    if (!ratePerNight || Number(ratePerNight) <= 0) {
      setError('Please specify a valid nightly rate in ₱.');
      return;
    }
    if (!roomCapacity || Number(roomCapacity) <= 0) {
      setError('Please specify guest capacity (e.g. 2).');
      return;
    }

    try {
      setSubmitting(true);
      const payload: NewRoomTypeRequest = {
        room_type: roomType.trim(),
        room_capacity: Number(roomCapacity),
        rate_per_night: Number(ratePerNight),
        description: description.trim() || 'Curated luxury accommodation with bespoke appointments.',
        image_url: imageUrl.trim() || PHOTO_PRESETS[0].url,
        badge: `Up to ${roomCapacity} Guests`,
        features: [feature1, feature2, feature3].filter((f) => f.trim().length > 0),
      };

      const res = await fetch('/api/room-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create suite');
      }

      // Reset form
      setRoomType('');
      onSuccess(payload.room_type);
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#741B2D]/10 text-[#741B2D] flex items-center justify-center border border-[#741B2D]/20">
              <Hotel className="w-5 h-5 text-[#741B2D]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Add New Suite / Room</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold flex items-center gap-1">
                  <Cloud className="w-3 h-3 text-emerald-600" />
                  Cloudflare D1 & R2
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Publish a new accommodation type directly to the guest portal, Cloudflare D1, and R2 Object Storage.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <span className="font-bold">Error:</span> {error}
          </div>
        )}

        {/* Form & Live Preview Grid */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Form Fields */}
            <div className="lg:col-span-7 space-y-4">
              {/* Suite Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Room / Suite Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Royal Ocean Penthouse, Deluxe Suite"
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#741B2D] text-slate-900 placeholder:text-slate-400 bg-white shadow-xs"
                />
              </div>

              {/* Rate & Capacity Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Price per Night (₱) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-serif font-bold text-slate-500 text-sm">
                      ₱
                    </span>
                    <input
                      type="number"
                      required
                      min="1"
                      step="1"
                      placeholder="250"
                      value={ratePerNight}
                      onChange={(e) =>
                        setRatePerNight(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#741B2D] text-slate-900 bg-white shadow-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Guest Capacity *
                  </label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      required
                      min="1"
                      max="20"
                      placeholder="2"
                      value={roomCapacity}
                      onChange={(e) =>
                        setRoomCapacity(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#741B2D] text-slate-900 bg-white shadow-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Spacious coastal retreat with ocean view balcony and plush king bedding."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#741B2D] text-slate-900 placeholder:text-slate-400 bg-white shadow-xs resize-none"
                />
              </div>

              {/* Suite Photo / Cloudflare R2 Upload */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Suite Image
                  </label>
                  {/* Mode switcher tabs */}
                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setImageMode('upload')}
                      className={`text-[10px] px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                        imageMode === 'upload'
                          ? 'bg-white text-[#741B2D] shadow-xs font-bold'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <UploadCloud className="w-3 h-3" />
                      Upload to R2
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageMode('presets')}
                      className={`text-[10px] px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                        imageMode === 'presets'
                          ? 'bg-white text-[#741B2D] shadow-xs font-bold'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Presets
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageMode('url')}
                      className={`text-[10px] px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                        imageMode === 'url'
                          ? 'bg-white text-[#741B2D] shadow-xs font-bold'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <LinkIcon className="w-3 h-3" />
                      URL
                    </button>
                  </div>
                </div>

                {/* Tab 1: Cloudflare R2 Upload Dropzone */}
                {imageMode === 'upload' && (
                  <div className="space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />

                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                        dragActive
                          ? 'border-[#741B2D] bg-[#741B2D]/5 scale-[0.99]'
                          : 'border-slate-300 hover:border-[#741B2D] bg-slate-50/70 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        {isUploading ? (
                          <div className="flex flex-col items-center gap-1.5 py-2">
                            <Loader2 className="w-6 h-6 text-[#741B2D] animate-spin" />
                            <span className="text-xs font-bold text-[#741B2D]">
                              Uploading to Cloudflare R2 (burgundy-bucket)...
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Optimizing and streaming binary object
                            </span>
                          </div>
                        ) : (
                          <>
                            <div className="w-10 h-10 rounded-2xl bg-[#741B2D]/10 text-[#741B2D] flex items-center justify-center">
                              <UploadCloud className="w-5 h-5" />
                            </div>
                            <div className="text-xs font-bold text-slate-800">
                              Click to select an image, or drag & drop here
                            </div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
                              <span>JPG, PNG, WEBP, GIF up to 15MB</span>
                              <span className="w-1 h-1 rounded-full bg-slate-300" />
                              <span className="font-semibold text-emerald-700">
                                Target: Cloudflare R2 burgundy-bucket
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {uploadSuccess && (
                      <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-semibold truncate">{uploadSuccess}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 2: Presets */}
                {imageMode === 'presets' && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      Select curated hotel photography:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {PHOTO_PRESETS.map((p) => (
                        <button
                          key={p.name}
                          type="button"
                          onClick={() => {
                            setImageUrl(p.url);
                            setUploadedFileName(p.name);
                          }}
                          className={`text-left p-2 rounded-lg border transition-all cursor-pointer flex flex-col gap-1 ${
                            imageUrl === p.url
                              ? 'bg-[#741B2D] text-white border-[#741B2D] font-bold shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <span className="text-xs truncate">{p.name}</span>
                          <span
                            className={`text-[9px] ${
                              imageUrl === p.url ? 'text-[#E5C378]' : 'text-slate-400'
                            }`}
                          >
                            High Resolution
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tab 3: Direct URL */}
                {imageMode === 'url' && (
                  <div className="relative">
                    <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      placeholder="https://... (direct image link or R2 public URL)"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#741B2D] text-slate-900 bg-white shadow-xs"
                    />
                  </div>
                )}
              </div>

              {/* 3 Key Amenities / Features */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Key Amenities (Display bullet points in guest card)
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Feature 1 (e.g. Balcony with Sea Breeze)"
                    value={feature1}
                    onChange={(e) => setFeature1(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white shadow-xs focus:ring-1 focus:ring-[#741B2D]"
                  />
                  <input
                    type="text"
                    placeholder="Feature 2 (e.g. En-suite Rain Shower)"
                    value={feature2}
                    onChange={(e) => setFeature2(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white shadow-xs focus:ring-1 focus:ring-[#741B2D]"
                  />
                  <input
                    type="text"
                    placeholder="Feature 3 (e.g. Artisanal Mini Bar)"
                    value={feature3}
                    onChange={(e) => setFeature3(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 bg-white shadow-xs focus:ring-1 focus:ring-[#741B2D]"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Live Guest View Preview (Matches User's Screenshot Card) */}
            <div className="lg:col-span-5 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#E5C378]" />
                  <span>Guest View Live Preview</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Auto-updates</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-center flex-1">
                {/* The EXACT Luxury Suite Card */}
                <div className="w-full max-w-[280px] bg-white rounded-2xl overflow-hidden border border-[#5A1C2A]/15 shadow-xl flex flex-col justify-between">
                  {/* Photo with Capacity Badge */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#2B0E14]">
                    <img
                      src={
                        imageUrl ||
                        'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'
                      }
                      alt={roomType || 'Suite Preview'}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Capacity Badge */}
                    <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-[#2B0E14]/85 backdrop-blur-md border border-[#E5C378]/30 text-[#E5C378] text-[9px] font-bold tracking-wider uppercase flex items-center gap-1 shadow-sm">
                      <Users className="w-2.5 h-2.5 text-[#E5C378]" />
                      <span>Up to {roomCapacity || 2} Guests</span>
                    </div>

                    {/* R2 Cloud indicator on preview image */}
                    {uploadedFileName && (
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-[9px] text-[#E5C378] flex items-center gap-1">
                        <Cloud className="w-2.5 h-2.5" />
                        <span className="truncate max-w-[120px]">{uploadedFileName}</span>
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[#2B0E14] mb-1.5">
                        {roomType || 'Deluxe Suite'}
                      </h3>
                      <p className="text-[11px] text-[#5C4047] leading-relaxed mb-3 line-clamp-3">
                        {description ||
                          'Spacious coastal retreat with ocean view balcony and plush king bedding.'}
                      </p>

                      {/* Highlights */}
                      <div className="space-y-1 mb-4 pt-2.5 border-t border-[#5A1C2A]/10">
                        {(feature1
                          ? [feature1, feature2, feature3]
                          : ['Balcony with Sea Breeze', 'En-suite Rain Shower', 'Artisanal Mini Bar']
                        )
                          .filter(Boolean)
                          .map((f, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-[10px] text-[#5C4047]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shrink-0" />
                              <span className="truncate">{f}</span>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Price and Book Suite Button */}
                    <div className="pt-3 border-t border-[#5A1C2A]/10 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-[#5C4047] uppercase tracking-wider font-semibold">
                          Starting from
                        </span>
                        <div className="flex items-baseline gap-0.5">
                          <span className="font-serif text-lg font-bold text-[#742537]">
                            ₱{ratePerNight || 250}
                          </span>
                          <span className="text-[10px] text-[#5C4047]">/ night</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled
                        className="px-3 py-1.5 rounded-lg bg-[#2B0E14] text-[#E5C378] text-[10px] font-bold tracking-wider uppercase flex items-center gap-1 shadow opacity-90 cursor-default"
                      >
                        <span>Book Suite</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || isUploading}
              className="px-6 py-2.5 rounded-xl bg-[#741B2D] text-white hover:bg-[#5A1C2A] text-xs font-bold tracking-wide uppercase shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Publishing to Cloudflare...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Add Suite to Guest View</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
