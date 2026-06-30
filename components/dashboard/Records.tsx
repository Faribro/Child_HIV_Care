// components/dashboard/Records.tsx
'use client';

import * as React from 'react';
import { useStore } from '@/lib/store';
import { useRecords } from '@/lib/hooks/useRecords';
import { DataTable } from '../ui/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Patient } from '@/types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { useToast } from '../ui/Toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Plus, Edit2, Trash2, RotateCcw, AlertTriangle, User, FileText } from 'lucide-react';

export const Records: React.FC = () => {
  // Hydrate data from API
  useRecords();
  
  const filteredRecords = useStore((s) => s.filteredRecords);
  const addRecord = useStore((s) => s.addRecord);
  const updateRecord = useStore((s) => s.updateRecord);
  const deleteRecord = useStore((s) => s.deleteRecord);
  const user = useStore((s) => s.user);
  
  const { toast } = useToast();
  
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [selectedRecord, setSelectedRecord] = React.useState<Patient | null>(null);
  const [selectedImg, setSelectedImg] = React.useState<{ title: string; url: string } | null>(null);
  
  // Pending delete timeouts to support undo
  const undoTimeoutsRef = React.useRef<Record<string, NodeJS.Timeout>>({});

  const canEdit = user?.role === 'Admin' || user?.role === 'SuperAdmin' || user?.role === 'Editor' || user?.role === 'DataEntry';
  const canDelete = user?.role === 'Admin' || user?.role === 'SuperAdmin' || user?.role === 'Editor';

  const handleDeleteClick = (record: Patient) => {
    const uuid = record._uuid;
    toast({
      type: 'warning',
      title: 'Record Deleted',
      message: `Deleted: ${record.childname || 'Child record'}. You have 5 seconds to undo.`,
      duration: 5000,
    });

    const timeout = setTimeout(async () => {
      delete undoTimeoutsRef.current[uuid];
      try {
        await deleteRecord(uuid);
      } catch (err: any) {
        toast({ type: 'error', message: `Failed to delete record: ${err.message}` });
      }
    }, 5000);

    undoTimeoutsRef.current[uuid] = timeout;
  };

  const handleUndoDelete = (record: Patient) => {
    const uuid = record._uuid;
    if (undoTimeoutsRef.current[uuid]) {
      clearTimeout(undoTimeoutsRef.current[uuid]);
      delete undoTimeoutsRef.current[uuid];
      
      toast({
        type: 'success',
        message: `Restored: ${record.childname}`,
        duration: 3000,
      });
      
      addRecord(record);
    }
  };

  const handleEditClick = (record: Patient) => {
    setSelectedRecord(record);
    setIsEditOpen(true);
  };

  // Define Columns
  const columns: ColumnDef<Patient>[] = [
    {
      accessorKey: 'visitdate',
      header: 'Visit Date',
      cell: ({ row }) => <span className="text-zinc-650 font-mono text-[11px]">{row.original.visitdate}</span>
    },
    {
      accessorKey: 'childname',
      header: "Child's Name",
      cell: ({ row }) => <span className="font-bold text-zinc-950">{row.original.childname}</span>
    },
    {
      accessorKey: 'dateofbirth',
      header: 'DOB / Gender',
      cell: ({ row }) => {
        const dob = row.original.dateofbirth || 'N/A';
        const gender = row.original.gender || 'N/A';
        return <span className="text-zinc-600 text-xs">{dob} ({gender})</span>;
      }
    },
    {
      accessorKey: 'caregivername',
      header: 'Caregiver Info',
      cell: ({ row }) => (
        <span className="text-zinc-600 text-xs">
          {row.original.caregivername} ({row.original.caregiverrelation || 'Other'})
        </span>
      )
    },
    {
      accessorKey: 'bmicategory',
      header: 'BMI Status',
      cell: ({ row }) => {
        const cat = row.original.bmicategory || 'Normal';
        const isUW = cat.includes('Underweight');
        return (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            isUW ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}>
            {cat}
          </span>
        );
      }
    },
    {
      accessorKey: 'hb_category',
      header: 'Anemia status',
      cell: ({ row }) => {
        const cat = row.original.hb_category || 'Normal';
        const isSevere = cat.includes('Severe');
        const isMild = cat.includes('Anaemia');
        return (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            isSevere ? 'bg-red-50 text-red-700 border border-red-200 animate-pulse' : isMild ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}>
            {cat}
          </span>
        );
      }
    },
    {
      id: 'media',
      header: 'Signature & Images',
      cell: ({ row }) => {
        const rec = row.original;
        return (
          <div className="flex gap-1.5 items-center">
            {rec.thumb_impression && (
              <img
                src={rec.thumb_impression}
                alt="Signature"
                className="h-6 w-10 object-contain bg-white border border-zinc-200 rounded cursor-pointer hover:scale-110 transition-transform"
                onClick={() => setSelectedImg({ title: "Caregiver Signature", url: rec.thumb_impression! })}
              />
            )}
            {rec.school_fee_receipt && (
              <img
                src={rec.school_fee_receipt}
                alt="Receipt"
                className="h-6 w-6 object-cover bg-white border border-zinc-200 rounded cursor-pointer hover:scale-110 transition-transform"
                onClick={() => setSelectedImg({ title: "School Fee Receipt", url: rec.school_fee_receipt! })}
              />
            )}
            {rec.marksheet_prev_year && (
              <img
                src={rec.marksheet_prev_year}
                alt="Marksheet"
                className="h-6 w-6 object-cover bg-white border border-zinc-200 rounded cursor-pointer hover:scale-110 transition-transform"
                onClick={() => setSelectedImg({ title: "Previous Marksheet", url: rec.marksheet_prev_year! })}
              />
            )}
            {!rec.thumb_impression && !rec.school_fee_receipt && !rec.marksheet_prev_year && (
              <span className="text-[10px] text-zinc-400">None</span>
            )}
          </div>
        );
      }
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex gap-1.5">
          {canEdit && (
            <Button
              variant="secondary"
              size="sm"
              className="h-7 w-7 p-0 cursor-pointer rounded-lg"
              onClick={() => handleEditClick(row.original)}
              title="Edit record"
            >
              <Edit2 className="w-3 h-3 text-zinc-650" />
            </Button>
          )}
          {canDelete && (
            <div className="flex gap-1">
              {undoTimeoutsRef.current[row.original._uuid] ? (
                <Button
                  variant="success"
                  size="sm"
                  className="h-7 px-2 cursor-pointer text-[10px] rounded-lg"
                  onClick={() => handleUndoDelete(row.original)}
                  title="Undo delete"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Undo
                </Button>
              ) : (
                <Button
                  variant="danger"
                  size="sm"
                  className="h-7 w-7 p-0 cursor-pointer rounded-lg"
                  onClick={() => handleDeleteClick(row.original)}
                  title="Delete record"
                >
                  <Trash2 className="w-3 h-3 text-red-500" />
                </Button>
              )}
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5 select-none text-left animate-slide-up">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-extrabold text-zinc-900 tracking-tight">Child Nutrition Registry</h3>
          <p className="text-xs text-zinc-500">View, search, and manage submitted health, nutrition and education records</p>
        </div>
        {canEdit && (
          <Button 
            variant="primary" 
            size="sm" 
            onClick={() => setIsAddOpen(true)}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold h-9 px-4 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add Record
          </Button>
        )}
      </div>

      {/* Main Records Data Table */}
      <div className="glass-card p-6 bg-white">
        <DataTable
          columns={columns}
          data={filteredRecords}
          searchKey="childname"
          searchPlaceholder="Search by child's name, caregiver, district or state..."
        />
      </div>

      {/* Image Preview Modal */}
      <Dialog open={!!selectedImg} onOpenChange={() => setSelectedImg(null)}>
        <DialogContent className="max-w-2xl bg-white border border-zinc-200 rounded-3xl p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-zinc-900 font-extrabold text-base">{selectedImg?.title}</DialogTitle>
          </DialogHeader>
          {selectedImg && (
            <div className="flex items-center justify-center p-4 bg-zinc-50 border border-zinc-200 rounded-2xl max-h-[60vh] overflow-hidden">
              <img
                src={selectedImg.url}
                alt={selectedImg.title}
                className="max-h-[50vh] max-w-full object-contain rounded-lg"
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="secondary" onClick={() => setSelectedImg(null)} className="rounded-xl">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Record Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto bg-white border border-zinc-200 rounded-3xl p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-zinc-900 font-extrabold text-base">Add New Registry Record</DialogTitle>
            <DialogDescription className="text-zinc-500 text-xs">
              Manually map out child details. For interactive voice-guidance, use the "Voice Form" tab in the sidebar.
            </DialogDescription>
          </DialogHeader>
          <RecordForm
            onSave={async (data) => {
              try {
                await addRecord(data);
                setIsAddOpen(false);
                toast({ type: 'success', message: 'Record added successfully' });
              } catch (err: any) {
                toast({ type: 'error', message: err.message || 'Failed to add record' });
              }
            }}
            onCancel={() => setIsAddOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Record Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto bg-white border border-zinc-200 rounded-3xl p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-zinc-900 font-extrabold text-base">Modify Child Registry</DialogTitle>
            <DialogDescription className="text-zinc-500 text-xs">
              Update child health parameters, nutritional checks and support metadata.
            </DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <RecordForm
              initialData={selectedRecord}
              onSave={async (data) => {
                try {
                  await updateRecord(selectedRecord._uuid, data);
                  setIsEditOpen(false);
                  toast({ type: 'success', message: 'Record updated successfully' });
                } catch (err: any) {
                  toast({ type: 'error', message: err.message || 'Failed to update record' });
                }
              }}
              onCancel={() => setIsEditOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Record Form component customized for child nutrition
interface RecordFormProps {
  initialData?: Patient;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
}

const RecordForm: React.FC<RecordFormProps> = ({ initialData, onSave, onCancel }) => {
  const [formValues, setFormValues] = React.useState<any>(initialData || {
    consent_obtained: 'yes',
    visitdate: new Date().toISOString().split('T')[0],
    childname: '',
    dateofbirth: '',
    gender: '',
    orphanstatus: 'both_alive',
    caregivername: '',
    caregiverrelation: 'mother',
    caregivercontact: '',
    address: '',
    addressstate: '',
    addressdistrict: '',
    householdmembers: 0,
    noofchildren: 0,
    householdincomemonthly: 0,
    incomesource: '',
    current_weight: 0,
    current_height: 0,
    bmicalc: 0,
    bmicategory: 'Normal',
    hemoglobin: 0,
    hb_category: 'Normal',
    comorbidities: '',
    appetite: 'good',
    mealsperday: 3,
    educationstatus: 'school_going',
  });

  const [saving, setSaving] = React.useState(false);

  const handleInputChange = (field: string, val: any) => {
    setFormValues((prev: any) => ({ ...prev, [field]: val }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValues.childname || !formValues.dateofbirth || !formValues.addressstate || !formValues.addressdistrict) {
      alert('Please fill in child name, date of birth, state and district.');
      return;
    }
    setSaving(true);
    try {
      await onSave(formValues);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-4 text-left">
      <div className="flex flex-col gap-4 max-h-[55vh] overflow-y-auto pr-1">
        
        {/* Child Core details */}
        <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-2xl flex flex-col gap-3">
          <h4 className="text-xs font-extrabold text-zinc-700 uppercase tracking-wider flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-blue-500" />
            General Child Details
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Child's Full Name *"
              value={formValues.childname}
              onChange={(e) => handleInputChange('childname', e.target.value)}
            />
            <Input
              label="Date of Birth *"
              type="date"
              value={formValues.dateofbirth}
              onChange={(e) => handleInputChange('dateofbirth', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-zinc-500">Gender</label>
              <Select value={formValues.gender} onValueChange={(val) => handleInputChange('gender', val)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-zinc-500">Orphan Status</label>
              <Select value={formValues.orphanstatus} onValueChange={(val) => handleInputChange('orphanstatus', val)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="both_alive">Both Alive</SelectItem>
                  <SelectItem value="single_orphan">Single Orphan</SelectItem>
                  <SelectItem value="double_orphan">Double Orphan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input
              label="Contact"
              value={formValues.caregivercontact}
              onChange={(e) => handleInputChange('caregivercontact', e.target.value)}
            />
          </div>
        </div>

        {/* State/District Address */}
        <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-2xl flex flex-col gap-3">
          <h4 className="text-xs font-extrabold text-zinc-700 uppercase tracking-wider">Demographics / Location</h4>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="State / UT *"
              value={formValues.addressstate}
              onChange={(e) => handleInputChange('addressstate', e.target.value)}
              placeholder="e.g. maharashtra"
            />
            <Input
              label="District *"
              value={formValues.addressdistrict}
              onChange={(e) => handleInputChange('addressdistrict', e.target.value)}
              placeholder="e.g. pune"
            />
          </div>
          <Input
            label="Address *"
            value={formValues.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
          />
        </div>

        {/* Health */}
        <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-2xl flex flex-col gap-3">
          <h4 className="text-xs font-extrabold text-zinc-700 uppercase tracking-wider flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-blue-500" />
            Clinical Records
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Weight (kg) *"
              type="number"
              step="0.1"
              value={formValues.current_weight || ''}
              onChange={(e) => handleInputChange('current_weight', Number(e.target.value))}
            />
            <Input
              label="Height (cm) *"
              type="number"
              value={formValues.current_height || ''}
              onChange={(e) => handleInputChange('current_height', Number(e.target.value))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Haemoglobin (g/dL)"
              type="number"
              step="0.1"
              value={formValues.hemoglobin || ''}
              onChange={(e) => handleInputChange('hemoglobin', Number(e.target.value))}
            />
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-zinc-500">Appetite</label>
              <Select value={formValues.appetite} onValueChange={(val) => handleInputChange('appetite', val)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

      </div>

      <DialogFooter className="mt-4 border-t pt-3">
        <Button variant="secondary" onClick={onCancel} type="button" disabled={saving} className="rounded-xl">
          Cancel
        </Button>
        <Button variant="primary" type="submit" isLoading={saving} className="rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700">
          Save Record
        </Button>
      </DialogFooter>
    </form>
  );
};

Records.displayName = 'Records';
export default Records;
