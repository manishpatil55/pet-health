import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, Image, File, Search } from 'lucide-react';

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
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#2F3A3A]">Documents</h1>
        <Button size="sm" className="gap-1" onClick={() => setUploadOpen(true)}>
          <Upload className="h-4 w-4" /> Upload
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#7A8A8A]" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-[#E6EEEE] text-sm focus:ring-2 focus:ring-[#4FB6B2] focus:border-transparent outline-none"
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
      </div>

      {/* Document Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents found"
          description="Upload vet reports, prescriptions, and certificates to keep them organised."
          actionLabel="Upload Document"
          onAction={() => setUploadOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc, index) => (
            <motion.div key={doc.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
              <Card variant="hoverable" className="cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    doc.type === 'pdf' ? 'bg-[#E76F51]/10' : 'bg-[#4FB6B2]/10'
                  }`}>
                    {doc.type === 'pdf' ? <File className="h-5 w-5 text-[#E76F51]" /> : <Image className="h-5 w-5 text-[#4FB6B2]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-[#2F3A3A] truncate">{doc.name}</h3>
                    <p className="text-xs text-[#7A8A8A] mt-0.5">{doc.petName} · {formatDate(doc.uploadedAt)}</p>
                    <span className={`inline-block mt-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      doc.type === 'pdf' ? 'bg-[#E76F51]/10 text-[#E76F51]' : 'bg-[#4FB6B2]/10 text-[#4FB6B2]'
                    }`}>
                      {doc.type.toUpperCase()}
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
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
          <p className="text-xs text-[#7A8A8A] text-center">Supports PDF, JPEG, PNG up to 10MB</p>
        </div>
      </Modal>
    </motion.div>
  );
};

export default Documents;
