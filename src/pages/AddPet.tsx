/**
 * AddPet.tsx — Clinical Sanctuary redesign
 * Drop-in replacement. All hooks/logic unchanged.
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { ArrowLeft, Camera, Upload, Dog, Cat, Rabbit, PawPrint, User2, Check } from 'lucide-react';

import { Input } from '@/components/ui/Input';
import { useCreatePet, usePet, useUpdatePet } from '@/hooks/usePets';
import { ROUTES } from '@/constants/routes';

// ─── Design tokens ────────────────────────────────────────────────────────────
const CS = {
  bg: '#f0fcfb',
  surfLo: '#eaf6f5',
  surfHi: '#dfebea',
  surf0: '#ffffff',
  primary: '#006a67',
  primaryC: '#4fb6b2',
  primaryF: '#8ff3ef',
  primaryDk: '#004442',
  secondary: '#006e29',
  secC: '#93f59c',
  onSurf: '#131d1e',
  onSurfV: '#3d4948',
  outline: '#6d7978',
  outlineV: '#bdc9c7',
  error: '#ba1a1a',
} as const;

const sigGrad = 'linear-gradient(135deg,#006a67 0%,#4fb6b2 100%)';

// ─── Schema (unchanged) ───────────────────────────────────────────────────────
const petSchema = z.object({
  name: z.string().min(1, 'Pet name is required'),
  type: z.enum(['Dog', 'Cat', 'Other'], { message: 'Select a pet type' } as any),
  breed: z.string().min(1, 'Breed is required'),
  gender: z.enum(['Male', 'Female'], { message: 'Select gender' } as any),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  initialWeight: z.coerce.number().positive('Enter a valid weight'),
  photo: z.string().optional(),
  microchipId: z.string().optional(),
});

type PetFormData = z.infer<typeof petSchema>;

// ─── Pill selector (Type / Gender) ───────────────────────────────────────────
function PillSelector<T extends string>({
  options,
  value,
  onChange,
  icons,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  icons?: Partial<Record<T, any>>;
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map(opt => {
        const Icon = icons?.[opt];
        const active = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-bold transition-all"
            style={{
              background: active ? CS.primary : CS.surf0,
              color: active ? '#fff' : CS.onSurfV,
              border: active ? 'none' : `1.5px solid ${CS.outlineV}`,
              cursor: 'pointer',
              boxShadow: active ? '0 4px 16px rgba(0,106,103,0.25)' : 'none',
            }}
          >
            {Icon && <Icon className="h-4 w-4" />}
            {opt}
            {active && <Check className="h-3.5 w-3.5 ml-0.5" />}
          </button>
        );
      })}
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHead({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-1 h-5 rounded-full" style={{ background: sigGrad }} />
      <h3
        className="text-xs font-bold uppercase tracking-[0.18em]"
        style={{ color: CS.onSurfV }}
      >
        {title}
      </h3>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
const AddPet = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const isEditMode = location.pathname.includes('/edit') && !!id;

  const createPet = useCreatePet();
  const updatePet = useUpdatePet();
  const { data: existingPetData } = usePet(id ?? '');
  const existingPet = existingPetData?.data;

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PetFormData>({
    resolver: zodResolver(petSchema) as any,
    defaultValues: { type: 'Dog', gender: 'Male' },
  });

  // Pre-fill form when editing an existing pet
  useEffect(() => {
    if (isEditMode && existingPet) {
      reset({
        name: existingPet.name,
        breed: existingPet.breed,
        type: existingPet.type as any,
        gender: existingPet.gender as any,
        dateOfBirth: existingPet.dateOfBirth?.split('T')[0] ?? '',
        initialWeight: existingPet.initialWeight ?? 0,
      });
      if (existingPet.photo) setPhotoPreview(existingPet.photo);
    }
  }, [isEditMode, existingPet, reset]);

  const onSubmit = async (data: PetFormData) => {
    if (isEditMode && id) {
      await updatePet.mutateAsync({
        id,
        data: { ...data, photo: photoPreview || undefined } as any,
      });
    } else {
      await createPet.mutateAsync({
        ...data,
        photo: photoPreview || undefined,
      } as any);
    }
    navigate(ROUTES.PETS);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>

      {/* ── Page header ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center gap-4 mb-10"
      >
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
          style={{
            background: CS.surf0,
            border: `1.5px solid ${CS.outlineV}`,
            cursor: 'pointer',
            color: CS.onSurfV,
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = CS.surfLo;
            (e.currentTarget as HTMLButtonElement).style.borderColor = CS.primaryC;
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = CS.surf0;
            (e.currentTarget as HTMLButtonElement).style.borderColor = CS.outlineV;
          }}
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1
            className="font-black tracking-tight"
            style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
              color: CS.onSurf,
              letterSpacing: '-0.025em',
              lineHeight: 1.05,
            }}
          >
            Add New Pet
          </h1>
          <p className="text-sm mt-0.5" style={{ color: CS.onSurfV }}>
            Create your companion's clinical profile.
          </p>
        </div>
      </motion.div>

      {/* ── Form card ── */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-2xl"
      >
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: CS.surf0,
            boxShadow: '0 8px 40px rgba(0,106,103,0.1), 0 2px 8px rgba(0,106,103,0.06)',
            border: '1px solid rgba(189,201,199,.25)',
          }}
        >
          {/* Card top gradient stripe */}
          <div className="h-1.5" style={{ background: sigGrad }} />

          <div className="p-8 sm:p-10">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

              {/* ── Photo upload ── */}
              <div className="flex justify-center">
                <div className="text-center">
                  <label htmlFor="photo-upload" className="cursor-pointer block group">
                    <div
                      className="w-28 h-28 rounded-full mx-auto overflow-hidden flex items-center justify-center transition-all duration-300 relative"
                      style={{
                        background: photoPreview ? 'transparent' : CS.surfLo,
                        border: `2.5px dashed ${CS.primaryC}`,
                        boxShadow: '0 8px 24px rgba(0,106,103,0.12)',
                      }}
                    >
                      {photoPreview ? (
                        <>
                          <img
                            src={photoPreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          {/* Hover overlay */}
                          <div
                            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ background: 'rgba(0,68,66,0.5)', borderRadius: '50%' }}
                          >
                            <Upload className="h-6 w-6 text-white" />
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-1 group-hover:scale-105 transition-transform">
                          <Camera className="h-8 w-8" style={{ color: CS.primaryC }} />
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-semibold mt-3" style={{ color: CS.primary }}>
                      {photoPreview ? 'Change photo' : 'Add photo'}
                    </p>
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
                  </label>
                </div>
              </div>

              {/* ── Identity ── */}
              <div>
                <SectionHead title="Identity" />
                <div className="space-y-4">
                  <Input
                    label="Pet Name"
                    placeholder="e.g. Buddy"
                    error={errors.name?.message}
                    {...register('name')}
                  />

                  {/* Type */}
                  <div>
                    <label
                      className="block text-sm font-semibold mb-3"
                      style={{ color: CS.onSurf }}
                    >
                      Pet Type
                    </label>
                    <Controller
                      name="type"
                      control={control}
                      render={({ field }) => (
                        <PillSelector
                          options={['Dog', 'Cat', 'Other'] as const}
                          value={field.value}
                          onChange={field.onChange}
                          icons={{ Dog, Cat, Other: Rabbit }}
                        />
                      )}
                    />
                    {errors.type && (
                      <p className="text-xs mt-1.5" style={{ color: CS.error }}>
                        {errors.type.message}
                      </p>
                    )}
                  </div>

                  <Input
                    label="Breed"
                    placeholder="e.g. Labrador Retriever"
                    error={errors.breed?.message}
                    {...register('breed')}
                  />

                  {/* Gender */}
                  <div>
                    <label
                      className="block text-sm font-semibold mb-3"
                      style={{ color: CS.onSurf }}
                    >
                      Gender
                    </label>
                    <Controller
                      name="gender"
                      control={control}
                      render={({ field }) => (
                        <PillSelector
                          options={['Male', 'Female'] as const}
                          value={field.value}
                          onChange={field.onChange}
                          icons={{ Male: User2, Female: User2 }}
                        />
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* ── Health baseline ── */}
              <div>
                <SectionHead title="Health Baseline" />
                <div className="space-y-4">
                  <Input
                    label="Date of Birth"
                    type="date"
                    error={errors.dateOfBirth?.message}
                    {...register('dateOfBirth')}
                  />
                  <Input
                    label="Initial Weight (kg)"
                    type="number"
                    step="0.1"
                    placeholder="e.g. 12.5"
                    error={errors.initialWeight?.message}
                    {...register('initialWeight')}
                  />
                </div>
              </div>

              {/* ── Optional ── */}
              <div>
                <SectionHead title="Optional" />
                <Input
                  label="Microchip ID"
                  placeholder="e.g. 985112004567890"
                  {...register('microchipId')}
                />
              </div>

              {/* ── Actions ── */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex-1 py-3.5 rounded-full font-bold text-sm transition-all"
                  style={{
                    background: CS.surfLo,
                    border: `1.5px solid ${CS.outlineV}`,
                    color: CS.onSurfV,
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = CS.surfHi)}
                  onMouseLeave={e => (e.currentTarget.style.background = CS.surfLo)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createPet.isPending || isSubmitting}
                  className="flex-1 py-3.5 rounded-full font-bold text-sm text-white flex items-center justify-center gap-2 transition-all active:scale-97"
                  style={{
                    background: sigGrad,
                    border: 'none',
                    cursor: createPet.isPending ? 'not-allowed' : 'pointer',
                    opacity: createPet.isPending ? 0.7 : 1,
                    boxShadow: '0 6px 20px rgba(0,106,103,0.28)',
                  }}
                >
                  {createPet.isPending ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <PawPrint className="h-4 w-4" />
                      Add Pet
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AddPet;