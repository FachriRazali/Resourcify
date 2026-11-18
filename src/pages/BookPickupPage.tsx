import React, { useRef, useState } from 'react';
import { ArrowLeft, Calendar, Camera, Upload, X } from 'lucide-react';
import { ResilientImage } from '../components/ResilientImage';
import { useResourcify } from '../context/ResourcifyContext';
import { SAMPLE_WASTE_PHOTOS } from '../data/seedData';

function getDefaultPickupDateTime(): string {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  tomorrow.setHours(9, 30, 0, 0);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(
    tomorrow.getDate()
  )}T${pad(tomorrow.getHours())}:${pad(tomorrow.getMinutes())}`;
}

export function BookPickupPage({
  onPickupCreated,
}: {
  onPickupCreated: (summary: string) => void;
}) {
  const { currentUser, bookPickup, navigate } = useResourcify();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [pickupDate, setPickupDate] = useState(getDefaultPickupDateTime);
  const [address, setAddress] = useState(currentUser?.address ?? '');
  const [weightKg, setWeightKg] = useState('12');
  const [wasteSummary, setWasteSummary] = useState(
    'Rinsed glass jars, flattened cardboard & aluminum'
  );
  const [photoUrl, setPhotoUrl] = useState<string>(SAMPLE_WASTE_PHOTOS[0].url);
  const [photoFileName, setPhotoFileName] = useState<string>(
    SAMPLE_WASTE_PHOTOS[0].label
  );
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const numericWeight = Number.parseFloat(weightKg);
  const estimatedCoins =
    Number.isFinite(numericWeight) && numericWeight > 0
      ? Math.round(numericWeight * 10)
      : 0;

  const handleFileSelected = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPG, PNG, or WebP).');
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoUrl(reader.result);
        setPhotoFileName(file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFileSelected(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!pickupDate) {
      setError('Please select a pickup date and time.');
      return;
    }
    if (!address.trim()) {
      setError('Please confirm your household pickup address.');
      return;
    }
    if (!Number.isFinite(numericWeight) || numericWeight <= 0) {
      setError('Please enter an estimated weight greater than 0 kg.');
      return;
    }
    if (!photoUrl) {
      setError('Please upload or attach a photo of your sorted waste.');
      return;
    }

    const created = bookPickup({
      pickup_date: pickupDate,
      address,
      weight_kg: numericWeight,
      photo_url: photoUrl,
      waste_summary: wasteSummary,
    });

    onPickupCreated(
      `Pickup scheduled for ${new Date(created.pickup_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })} (${created.weight_kg} kg · Pending verification)`
    );
    navigate('dashboard');
  };

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#F8F9FA] px-4 sm:px-8 py-10 sm:py-12">
      <div className="max-w-[640px] mx-auto">
        <button
          type="button"
          onClick={() => navigate('dashboard')}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#616161] hover:text-[#212121] mb-6 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D32] rounded px-1 -ml-1"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back to Dashboard
        </button>

        <section className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[16px] p-6 sm:p-10">
          <div className="pb-6 mb-6 border-b border-[#E5E7EB]">
            <h1 className="font-editorial text-[28px] sm:text-[32px] leading-[1.2] font-semibold text-[#212121] tracking-tight">
              Schedule a Waste Pickup
            </h1>
            <p className="text-[15px] text-[#616161] mt-2 leading-relaxed">
              Rinse glass and metal containers, flatten cardboard, and share a clear photo of your sorted bags for collector verification.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {error && (
              <div
                role="alert"
                className="px-4 py-3 rounded-lg bg-[#FEE2E2] border border-[#FECACA] text-[#B91C1C] text-[13px] font-medium"
              >
                {error}
              </div>
            )}

            {/* Date & Time Picker */}
            <div>
              <label
                htmlFor="pickup-datetime"
                className="block text-[14px] font-medium text-[#212121] mb-1.5"
              >
                Date & Time Picker
              </label>
              <div className="relative">
                <Calendar
                  className="w-4 h-4 text-[#616161] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="pickup-datetime"
                  type="datetime-local"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-[15px] text-[#212121] bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg tabular-nums focus:outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/15 transition-colors"
                />
              </div>
              <p className="text-[12px] text-[#616161] mt-1.5">
                Neighborhood collections run Monday–Saturday between 08:00 AM and 04:00 PM.
              </p>
            </div>

            {/* Multiline Address Input */}
            <div>
              <label
                htmlFor="pickup-address"
                className="block text-[14px] font-medium text-[#212121] mb-1.5"
              >
                Pickup Address
              </label>
              <textarea
                id="pickup-address"
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter street address, unit number, and gate instructions"
                className="w-full px-3.5 py-2.5 text-[15px] text-[#212121] bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/15 transition-colors resize-none"
              />
            </div>

            {/* Estimated Weight & Material Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="pickup-weight"
                  className="block text-[14px] font-medium text-[#212121] mb-1.5"
                >
                  Estimated Weight (kg)
                </label>
                <input
                  id="pickup-weight"
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  placeholder="12.0"
                  className="w-full px-3.5 py-2.5 text-[15px] text-[#212121] bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg tabular-nums placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/15 transition-colors"
                />
                <p className="text-[12px] text-[#2E7D32] font-medium mt-1.5 tabular-nums">
                  Estimated reward: +{estimatedCoins} EcoCoins (1 kg = 10 EcoCoins)
                </p>
              </div>

              <div>
                <label
                  htmlFor="pickup-notes"
                  className="block text-[14px] font-medium text-[#212121] mb-1.5"
                >
                  Sorted Materials Summary
                </label>
                <input
                  id="pickup-notes"
                  type="text"
                  value={wasteSummary}
                  onChange={(e) => setWasteSummary(e.target.value)}
                  placeholder="e.g., Rinsed glass, cardboard, PET"
                  className="w-full px-3.5 py-2.5 text-[15px] text-[#212121] bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/15 transition-colors"
                />
              </div>
            </div>

            {/* Picture Uploader Dropzone */}
            <div>
              <span className="block text-[14px] font-medium text-[#212121] mb-1.5">
                Photo Proof of Sorted Waste
              </span>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => handleFileSelected(e.target.files?.[0])}
              />

              {photoUrl ? (
                <div className="border border-[#E5E7EB] rounded-[12px] p-4 bg-[#F8F9FA]">
                  <div className="flex items-center gap-4">
                    <ResilientImage
                      src={photoUrl}
                      alt="Preview of sorted household recyclables"
                      fallbackLabel="Sorted waste"
                      className="w-20 h-20 rounded-[8px] object-cover shrink-0 border border-[#E5E7EB]"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-medium text-[#212121] truncate">
                        {photoFileName || 'Sorted waste photo attached'}
                      </p>
                      <p className="text-[12px] text-[#616161] mt-0.5">
                        Ready for collector inspection
                      </p>
                      <div className="mt-2.5 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-[12px] font-medium text-[#2E7D32] hover:underline cursor-pointer"
                        >
                          Replace photo
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPhotoUrl('');
                            setPhotoFileName('');
                          }}
                          className="inline-flex items-center gap-1 text-[12px] font-medium text-[#616161] hover:text-[#B91C1C] cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" aria-hidden="true" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  className={`border border-dashed rounded-[12px] px-6 py-8 text-center cursor-pointer transition-colors ${
                    isDragging
                      ? 'border-[#2E7D32] bg-[#E8F5E9]/40'
                      : 'border-[#D1D5DB] bg-[#F8F9FA] hover:border-[#2E7D32]/60'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-[#FFFFFF] border border-[#E5E7EB] flex items-center justify-center mx-auto mb-3 text-[#212121]">
                    <Upload className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <p className="text-[14px] font-medium text-[#212121]">
                    Click to upload or drag and drop a photo
                  </p>
                  <p className="text-[12px] text-[#616161] mt-1">
                    Clear daylight framing of sorted bins, glass, or flattened cardboard (JPG, PNG)
                  </p>
                </div>
              )}

              {/* Quick real-world sample picker */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-[12px] text-[#616161] inline-flex items-center gap-1 mr-1">
                  <Camera className="w-3.5 h-3.5" aria-hidden="true" />
                  Sample photos:
                </span>
                {SAMPLE_WASTE_PHOTOS.map((sample) => (
                  <button
                    key={sample.label}
                    type="button"
                    onClick={() => {
                      setPhotoUrl(sample.url);
                      setPhotoFileName(sample.label);
                      setError(null);
                    }}
                    className={`text-[12px] px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
                      photoUrl === sample.url
                        ? 'bg-[#E8F5E9] border-[#4CAF50]/40 text-[#2E7D32] font-medium'
                        : 'bg-[#FFFFFF] border-[#E5E7EB] text-[#616161] hover:text-[#212121]'
                    }`}
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 text-[15px] font-semibold text-[#FFFFFF] bg-[#2E7D32] hover:bg-[#256628] rounded-lg transition-colors duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2E7D32]"
            >
              Submit Request
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
