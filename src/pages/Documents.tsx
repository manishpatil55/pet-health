/**
 * Documents.tsx — Clinical Sanctuary Edition
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Upload, Image, File, Search, FolderOpen } from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { FileUpload } from '@/components/ui/FileUpload';
import { usePets } from '@/hooks/usePets';
import { formatDate } from '@/utils/dateUtils';

interface MockDocument {
  id: string;
  name: string;
  type: 'pdf' | 'image';
  uploadedAt: string;
  petName: string;
  url: string;
}

const mockDocuments: MockDocument[] = [
  { id: '1', name: 'Rabies Vaccination Certificate.pdf', type: 'pdf', uploadedAt: '2025-02-15', petName: 'Buddy', url: '#' },
  { id: '2', name: 'Annual Checkup Report.pdf', type: 'pdf', uploadedAt: '2025-01-10', petName: 'Buddy', url: '#' },
  { id: '3', name: 'X-Ray Results.png', type: 'image', uploadedAt: '2024-12-05', petName: 'Buddy', url: '#' },
  { id: '4', name: 'Blood Work Results.pdf', type: 'pdf', uploadedAt: '2024-11-20', petName: 'Buddy', url: '#' },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};
const stagger: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

const Documents = () => {
  const [petFilter, setPetFilter] = useState('all');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: petsData } = usePets();
  const pets = petsData?.data ?? [];

  const filtered = mockDocuments.filter((doc) => {
    const matchesPet = petFilter === 'all' || doc.petName === petFilter;
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPet && matchesSearch;
  });

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* ── Page Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1
            className="font-black tracking-tight"
            style={{
              fontFamily: 'Manrope, sans-serif',
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              color: '#131d1e',
              letterSpacing: '-0.025em',
              lineHeight: 1.1,
            }}
          >
            Documents
          </h1>
          <p className="text-sm mt-1" style={{ color: '#6d7978' }}>Health records, certificates & reports</p>
        </div>
        <Button size="sm" pill className="gap-1.5" onClick={() => setUploadOpen(true)}>
          <Upload className="h-3.5 w-3.5" /> Upload
        </Button>
      </motion.div>

      {/* ── Filters ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.08 }}
        className="flex flex-col sm:flex-row gap-3 mb-6"
      >
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#bdc9c7' }} />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl text-sm font-semibold outline-none transition-all"
            style={{
              background: '#ffffff',
              border: '1.5px solid rgba(189,201,199,.3)',
              color: '#131d1e',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#4fb6b2'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(79,182,178,.1)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(189,201,199,.3)'; e.currentTarget.style.boxShadow = 'none'; }}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            value={petFilter}
            onChange={(e) => setPetFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Pets' },
              ...pets.map((p) => ({ value: p.name, label: p.name })),
            ]}
          />
        </div>
      </motion.div>

      {/* ── Document Grid ── */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No documents found"
          description="Upload vet reports, prescriptions, and certificates to keep them organised."
          actionLabel="Upload Document"
          onAction={() => setUploadOpen(true)}
        />
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc) => {
            const isPdf = doc.type === 'pdf';
            const iconColor = isPdf ? '#E76F51' : '#4fb6b2';
            return (
              <motion.div key={doc.id} variants={fadeUp}>
                <Card variant="hoverable" className="cursor-pointer">
                  <div className="flex items-start gap-3.5">
                    <div
                      className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${iconColor}10` }}
                    >
                      {isPdf ? <File className="h-5 w-5" style={{ color: iconColor }} /> : <Image className="h-5 w-5" style={{ color: iconColor }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold truncate" style={{ color: '#131d1e' }}>{doc.name}</h3>
                      <p className="text-xs mt-0.5" style={{ color: '#6d7978' }}>{doc.petName} · {formatDate(doc.uploadedAt)}</p>
                      <span
                        className="inline-block mt-2 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider"
                        style={{ background: `${iconColor}10`, color: iconColor }}
                      >
                        {doc.type}
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* ── Upload Modal ── */}
      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)} title="Upload Document">
        <div className="space-y-4">
          <FileUpload
            accept="image/*,.pdf"
            maxSize={10}
            onFileSelect={(files) => {
              if (files.length > 0) console.log('File selected:', files[0].name);
              setUploadOpen(false);
            }}
          />
          <p className="text-xs text-center" style={{ color: '#bdc9c7' }}>Supports PDF, JPEG, PNG up to 10MB</p>
        </div>
      </Modal>
    </div>
  );
};

export default Documents;
