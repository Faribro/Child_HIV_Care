// components/dashboard/Records.tsx
'use client';

import * as React from 'react';
import { useStore } from '@/lib/store';
import { useRecords } from '@/lib/hooks/useRecords';
import { Patient } from '@/types';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { useToast } from '../ui/Toast';
import {
  Plus, Edit2, Trash2, RotateCcw, Eye, Search, FileText,
  User, Activity, BookOpen, Home, ExternalLink, X, ChevronLeft, ChevronRight
} from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmtDate(raw: string | undefined): string {
  if (!raw) return '—';
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getDriveViewUrl(url: string): string {
  if (!url) return '';
  const m = url.match(/\/file\/d\/([^/]+)/) || url.match(/id=([^&]+)/);
  if (m?.[1]) return `https://drive.google.com/file/d/${m[1]}/view`;
  return url;
}

function getDriveThumbnail(url: string): string {
  if (!url) return '';
  const m = url.match(/\/file\/d\/([^/]+)/) || url.match(/id=([^&]+)/);
  if (m?.[1]) return `https://drive.google.com/thumbnail?id=${m[1]}&sz=w80`;
  return url;
}

// ─── Document Preview Component ─────────────────────────────────────────────
// Handles both base64 data URIs (renders inline) and Google Drive links

function DocPreview({ label, url }: { label: string; url?: string }) {
  const [expanded, setExpanded] = React.useState(false);
  if (!url) return <span className="text-gray-400 text-xs italic">—</span>;

  const isBase64 = url.startsWith('data:');
  const driveUrl = isBase64 ? null : getDriveViewUrl(url);
  const thumbUrl = isBase64 ? url : getDriveThumbnail(url);

  if (isBase64) {
    return (
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
        {expanded ? (
          <div className="relative">
            <img
              src={url}
              alt={label}
              className="rounded-xl border border-gray-200 max-w-full max-h-64 object-contain bg-gray-50"
            />
            <button
              onClick={() => setExpanded(false)}
              className="absolute top-1 right-1 bg-white/80 rounded-full p-0.5 text-gray-600 hover:text-red-500 border border-gray-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setExpanded(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold rounded-lg hover:bg-blue-100 transition-colors w-fit"
          >
            <Eye className="w-3 h-3" /> View {label}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
      <a
        href={driveUrl!}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold rounded-lg hover:bg-blue-100 transition-colors w-fit"
      >
        <ExternalLink className="w-3 h-3" /> {label}
      </a>
      {thumbUrl && (
        <img
          src={thumbUrl}
          alt={label}
          className="rounded-lg border border-gray-200 w-20 h-16 object-cover bg-gray-50"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      )}
    </div>
  );
}

// ─── View Modal ──────────────────────────────────────────────────────────────

function ViewModal({ record, onClose }: { record: Patient; onClose: () => void }) {
  const Section = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-200">
        <span className="text-blue-500">{icon}</span>
        <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">{title}</span>
      </div>
      <div className="p-4 grid grid-cols-2 gap-x-6 gap-y-3">{children}</div>
    </div>
  );

  const Field = ({ label, value }: { label: string; value?: string | number }) => (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value || '—'}</span>
    </div>
  );

  const bmiColor = record.bmicategory?.includes('Underweight')
    ? 'bg-amber-50 text-amber-700 border-amber-200'
    : 'bg-emerald-50 text-emerald-700 border-emerald-200';
  const hbColor = record.hb_category?.includes('Severe')
    ? 'bg-red-50 text-red-700 border-red-200'
    : record.hb_category?.includes('Anaemia')
    ? 'bg-amber-50 text-amber-700 border-amber-200'
    : 'bg-emerald-50 text-emerald-700 border-emerald-200';

  return (
    <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto bg-white border border-gray-200 rounded-3xl p-0 shadow-2xl">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-start justify-between gap-4 rounded-t-3xl">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-extrabold text-lg">
            {record.childname?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-gray-900 leading-tight">{record.childname || 'Unknown Child'}</h2>
            <p className="text-xs text-gray-500">Visit: {fmtDate(record.visitdate)} · {record.addressdistrict}, {record.addressstate}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${bmiColor}`}>{record.bmicategory || 'Normal'}</span>
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${hbColor}`}>{record.hb_category || 'Normal'}</span>
        </div>
      </div>

      <div className="p-6 flex flex-col gap-4">
        {/* Child & Family */}
        <Section icon={<User className="w-4 h-4" />} title="Child & Caregiver">
          <Field label="Full Name" value={record.childname} />
          <Field label="Date of Birth" value={fmtDate(record.dateofbirth)} />
          <Field label="Gender" value={record.gender} />
          <Field label="Orphan Status" value={record.orphanstatus} />
          <Field label="Caregiver Name" value={record.caregivername} />
          <Field label="Relation" value={record.caregiverrelation} />
          <Field label="Contact" value={record.caregivercontact} />
          <Field label="Address" value={record.address} />
        </Section>

        {/* Household */}
        <Section icon={<Home className="w-4 h-4" />} title="Household Economics">
          <Field label="Household Members" value={record.householdmembers} />
          <Field label="No. of Children" value={record.noofchildren} />
          <Field label="Monthly Income" value={record.householdincomemonthly ? `₹${record.householdincomemonthly}` : undefined} />
          <Field label="Income Source" value={record.incomesource} />
        </Section>

        {/* Clinical */}
        <Section icon={<Activity className="w-4 h-4" />} title="Clinical & Nutrition">
          <Field label="Weight" value={record.current_weight ? `${record.current_weight} kg` : undefined} />
          <Field label="Height" value={record.current_height ? `${record.current_height} cm` : undefined} />
          <Field label="BMI" value={record.bmicalc?.toString()} />
          <Field label="BMI Category" value={record.bmicategory} />
          <Field label="Haemoglobin" value={record.hemoglobin ? `${record.hemoglobin} g/dL` : undefined} />
          <Field label="Anaemia Status" value={record.hb_category} />
          <Field label="Appetite" value={record.appetite} />
          <Field label="Meals / Day" value={record.mealsperday?.toString()} />
          <Field label="Comorbidities" value={record.comorbidities} />
        </Section>

        {/* Education */}
        <Section icon={<BookOpen className="w-4 h-4" />} title="Education">
          <Field label="Education Status" value={record.educationstatus} />
          <Field label="School Name" value={record.schoolname} />
          <Field label="School Type" value={record.schooltype} />
          <Field label="Class" value={record.currentclass} />
          <Field label="Attendance" value={record.attendancestatus} />
          <Field label="Annual Fees" value={record.eduschoolfees ? `₹${record.eduschoolfees}` : undefined} />
          <Field label="Req. Support Total" value={record.reqtotalsupport ? `₹${record.reqtotalsupport}` : undefined} />
        </Section>

        {/* Documents */}
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-200">
            <FileText className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Documents & Attachments</span>
          </div>
          <div className="p-4 flex flex-col gap-4">
            {record.thumb_impression || record.school_fee_receipt || record.marksheet_prev_year ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {record.thumb_impression && <DocPreview label="Caregiver Signature" url={record.thumb_impression} />}
                {record.school_fee_receipt && <DocPreview label="School Fee Receipt" url={record.school_fee_receipt} />}
                {record.marksheet_prev_year && <DocPreview label="Previous Marksheet" url={record.marksheet_prev_year} />}
              </div>
            ) : (
              <span className="text-xs text-gray-400 italic">No documents attached.</span>
            )}
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-3 rounded-b-3xl">
        <Button variant="secondary" onClick={onClose} className="rounded-xl text-gray-700 border-gray-200">
          Close
        </Button>
      </div>
    </DialogContent>
  );
}

// ─── Main Records Component ──────────────────────────────────────────────────

export const Records: React.FC = () => {
  useRecords();

  const filteredRecords = useStore((s) => s.filteredRecords);
  const addRecord = useStore((s) => s.addRecord);
  const updateRecord = useStore((s) => s.updateRecord);
  const deleteRecord = useStore((s) => s.deleteRecord);
  const user = useStore((s) => s.user);

  const { toast } = useToast();

  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const PAGE_SIZE = 15;

  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isViewOpen, setIsViewOpen] = React.useState(false);
  const [selectedRecord, setSelectedRecord] = React.useState<Patient | null>(null);

  const undoTimeoutsRef = React.useRef<Record<string, NodeJS.Timeout>>({});

  const canEdit = ['Admin', 'SuperAdmin', 'Editor', 'DataEntry'].includes(user?.role || '');
  const canDelete = ['Admin', 'SuperAdmin', 'Editor'].includes(user?.role || '');

  // Filtered + paginated
  const searched = React.useMemo(() => {
    if (!search.trim()) return filteredRecords;
    const q = search.toLowerCase();
    return filteredRecords.filter((r) =>
      [r.childname, r.caregivername, r.addressstate, r.addressdistrict]
        .some((v) => v?.toLowerCase().includes(q))
    );
  }, [filteredRecords, search]);

  const totalPages = Math.max(1, Math.ceil(searched.length / PAGE_SIZE));
  const paginated = React.useMemo(() => {
    const s = (page - 1) * PAGE_SIZE;
    return searched.slice(s, s + PAGE_SIZE);
  }, [searched, page]);

  // Reset page when search changes
  React.useEffect(() => { setPage(1); }, [search]);

  const handleView = (r: Patient) => { setSelectedRecord(r); setIsViewOpen(true); };
  const handleEdit = (r: Patient) => { setSelectedRecord(r); setIsEditOpen(true); };

  const handleDelete = (r: Patient) => {
    const uuid = r._uuid;
    toast({ type: 'warning', title: 'Record Deleted', message: `Deleted: ${r.childname || 'Child'}. Undo in 5s.`, duration: 5000 });
    const timeout = setTimeout(async () => {
      delete undoTimeoutsRef.current[uuid];
      try { await deleteRecord(uuid); }
      catch (err: any) { toast({ type: 'error', message: `Failed: ${err.message}` }); }
    }, 5000);
    undoTimeoutsRef.current[uuid] = timeout;
  };

  const handleUndoDelete = (r: Patient) => {
    const uuid = r._uuid;
    if (undoTimeoutsRef.current[uuid]) {
      clearTimeout(undoTimeoutsRef.current[uuid]);
      delete undoTimeoutsRef.current[uuid];
      toast({ type: 'success', message: `Restored: ${r.childname}`, duration: 3000 });
      addRecord(r);
    }
  };

  const StatusBadge = ({ cat, type }: { cat?: string; type: 'bmi' | 'hb' }) => {
    const isSevere = cat?.includes('Severe');
    const isMild = type === 'hb' ? cat?.includes('Anaemia') : cat?.includes('Mildly') || cat?.includes('Moderately');
    const cls = isSevere
      ? 'bg-red-50 text-red-700 border-red-200'
      : isMild
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : 'bg-emerald-50 text-emerald-700 border-emerald-200';
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap ${cls}`}>
        {cat || 'Normal'}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-5 animate-slide-up">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-extrabold text-gray-900 tracking-tight">Child Nutrition Registry</h3>
          <p className="text-xs text-gray-500 mt-0.5">View, search, and manage submitted health, nutrition and education records</p>
        </div>
        {canEdit && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddOpen(true)}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold h-9 px-4 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Record
          </Button>
        )}
      </div>

      {/* Table Card */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Search bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by child's name, caregiver, district or state..."
            className="flex-1 text-sm text-gray-900 placeholder:text-gray-400 bg-transparent outline-none"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="text-xs text-gray-400 font-mono shrink-0">{searched.length} records</span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Visit Date</th>
                <th className="px-4 py-3">Child's Name</th>
                <th className="px-4 py-3">DOB / Gender</th>
                <th className="px-4 py-3">Caregiver</th>
                <th className="px-4 py-3">BMI Status</th>
                <th className="px-4 py-3">Anaemia Status</th>
                <th className="px-4 py-3">Documents</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-gray-400 text-sm">
                    No records found matching your search.
                  </td>
                </tr>
              ) : (
                paginated.map((rec, idx) => (
                  <tr
                    key={rec._uuid}
                    className="border-b border-gray-100 hover:bg-blue-50/40 transition-colors duration-100"
                  >
                    {/* Row number */}
                    <td className="px-4 py-3 text-gray-400 text-xs font-mono">
                      {(page - 1) * PAGE_SIZE + idx + 1}
                    </td>

                    {/* Visit Date — clean format */}
                    <td className="px-4 py-3 text-gray-700 font-mono text-xs whitespace-nowrap">
                      {fmtDate(rec.visitdate)}
                    </td>

                    {/* Child Name */}
                    <td className="px-4 py-3">
                      <span className="font-bold text-gray-900">{rec.childname || '—'}</span>
                    </td>

                    {/* DOB / Gender — clean format */}
                    <td className="px-4 py-3 text-gray-700 text-xs whitespace-nowrap">
                      {fmtDate(rec.dateofbirth)}{rec.gender ? ` · ${rec.gender}` : ''}
                    </td>

                    {/* Caregiver */}
                    <td className="px-4 py-3 text-gray-700 text-xs">
                      {rec.caregivername}
                      {rec.caregiverrelation && (
                        <span className="text-gray-400"> ({rec.caregiverrelation})</span>
                      )}
                    </td>

                    {/* BMI */}
                    <td className="px-4 py-3">
                      <StatusBadge cat={rec.bmicategory} type="bmi" />
                    </td>

                    {/* Haemoglobin */}
                    <td className="px-4 py-3">
                      <StatusBadge cat={rec.hb_category} type="hb" />
                    </td>

                    {/* Documents — smart badges */}
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5 flex-wrap">
                        {rec.thumb_impression && (
                          rec.thumb_impression.startsWith('data:') ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-50 border border-violet-200 text-violet-700 text-[10px] font-semibold rounded-md cursor-default" title="Click View to see document">
                              <Eye className="w-2.5 h-2.5" /> Sign ✓
                            </span>
                          ) : (
                            <a href={getDriveViewUrl(rec.thumb_impression)} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-50 border border-violet-200 text-violet-700 text-[10px] font-semibold rounded-md hover:bg-violet-100 transition-colors">
                              <ExternalLink className="w-2.5 h-2.5" /> Sign
                            </a>
                          )
                        )}
                        {rec.school_fee_receipt && (
                          rec.school_fee_receipt.startsWith('data:') ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-semibold rounded-md cursor-default" title="Click View to see document">
                              <Eye className="w-2.5 h-2.5" /> Fees ✓
                            </span>
                          ) : (
                            <a href={getDriveViewUrl(rec.school_fee_receipt)} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-semibold rounded-md hover:bg-blue-100 transition-colors">
                              <ExternalLink className="w-2.5 h-2.5" /> Fees
                            </a>
                          )
                        )}
                        {rec.marksheet_prev_year && (
                          rec.marksheet_prev_year.startsWith('data:') ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-semibold rounded-md cursor-default" title="Click View to see document">
                              <Eye className="w-2.5 h-2.5" /> Mark ✓
                            </span>
                          ) : (
                            <a href={getDriveViewUrl(rec.marksheet_prev_year)} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-semibold rounded-md hover:bg-emerald-100 transition-colors">
                              <ExternalLink className="w-2.5 h-2.5" /> Mark
                            </a>
                          )
                        )}
                        {!rec.thumb_impression && !rec.school_fee_receipt && !rec.marksheet_prev_year && (
                          <span className="text-gray-400 text-[10px]">None</span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex justify-end items-center gap-2">
                        {/* View */}
                        <button
                          type="button"
                          onClick={() => handleView(rec)}
                          className="flex items-center gap-1.5 px-3 h-8 text-xs border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 font-semibold transition-colors"
                          title="View full record"
                        >
                          <Eye size={12} /> View
                        </button>

                        {/* Edit */}
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => handleEdit(rec)}
                            className="flex items-center gap-1.5 px-3 h-8 text-xs border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
                            title="Edit record"
                          >
                            <Edit2 size={12} /> Edit
                          </button>
                        )}

                        {/* Delete / Undo */}
                        {canDelete && (
                          undoTimeoutsRef.current[rec._uuid] ? (
                            <button
                              type="button"
                              onClick={() => handleUndoDelete(rec)}
                              className="flex items-center gap-1.5 px-3 h-8 text-xs border border-emerald-200 text-emerald-700 rounded-lg hover:bg-emerald-50 font-semibold transition-colors"
                            >
                              <RotateCcw size={12} /> Undo
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleDelete(rec)}
                              className="flex items-center gap-1.5 px-3 h-8 text-xs border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-semibold transition-colors"
                              title="Delete record"
                            >
                              <Trash2 size={12} /> Delete
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
            <span className="text-xs text-gray-500">
              Page <strong className="text-gray-900">{page}</strong> of <strong className="text-gray-900">{totalPages}</strong> · {searched.length} records
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="flex items-center gap-1 px-3 h-8 text-xs border border-gray-200 text-gray-700 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed font-semibold transition-colors"
              >
                <ChevronLeft size={13} /> Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="flex items-center gap-1 px-3 h-8 text-xs border border-gray-200 text-gray-700 rounded-lg hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed font-semibold transition-colors"
              >
                Next <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Modal */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        {selectedRecord && <ViewModal record={selectedRecord} onClose={() => setIsViewOpen(false)} />}
      </Dialog>

      {/* Add Record Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto bg-white border border-gray-200 rounded-3xl p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900 font-extrabold text-base">Add New Registry Record</DialogTitle>
            <DialogDescription className="text-gray-500 text-xs">
              Manually map child details. For interactive voice-guidance, use the "Voice Form" tab.
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
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto bg-white border border-gray-200 rounded-3xl p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-gray-900 font-extrabold text-base">Edit Child Registry</DialogTitle>
            <DialogDescription className="text-gray-500 text-xs">
              Update child health, nutritional checks, and support metadata.
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

// ─── Record Form ─────────────────────────────────────────────────────────────

interface RecordFormProps {
  initialData?: Patient;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
}

const RecordForm: React.FC<RecordFormProps> = ({ initialData, onSave, onCancel }) => {
  const [formValues, setFormValues] = React.useState<any>(initialData || {
    consent_obtained: 'yes',
    visitdate: new Date().toISOString().split('T')[0],
    childname: '', dateofbirth: '', gender: '',
    orphanstatus: 'both_alive', caregivername: '',
    caregiverrelation: 'mother', caregivercontact: '',
    address: '', addressstate: '', addressdistrict: '',
    householdmembers: 0, noofchildren: 0,
    householdincomemonthly: 0, incomesource: '',
    current_weight: 0, current_height: 0,
    bmicalc: 0, bmicategory: 'Normal',
    hemoglobin: 0, hb_category: 'Normal',
    comorbidities: '', appetite: 'good',
    mealsperday: 3, educationstatus: 'school_going',
  });

  const [saving, setSaving] = React.useState(false);
  const set = (k: string, v: any) => setFormValues((p: any) => ({ ...p, [k]: v }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValues.childname || !formValues.dateofbirth || !formValues.addressstate || !formValues.addressdistrict) {
      alert('Please fill in: Child name, Date of birth, State and District.');
      return;
    }
    setSaving(true);
    try { await onSave(formValues); } finally { setSaving(false); }
  };

  const sectionHead = (label: string) => (
    <h4 className="text-xs font-extrabold text-gray-600 uppercase tracking-wider pb-1 border-b border-gray-100">{label}</h4>
  );

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-4 text-left">
      <div className="flex flex-col gap-5 max-h-[55vh] overflow-y-auto pr-1">

        {/* Child details */}
        <div className="flex flex-col gap-3">
          {sectionHead('Child Details')}
          <div className="grid grid-cols-2 gap-3">
            <Input label="Child's Full Name *" value={formValues.childname} onChange={(e) => set('childname', e.target.value)} />
            <Input label="Date of Birth *" type="date" value={formValues.dateofbirth} onChange={(e) => set('dateofbirth', e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">Gender</label>
              <Select value={formValues.gender} onValueChange={(v) => set('gender', v)}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">Orphan Status</label>
              <Select value={formValues.orphanstatus} onValueChange={(v) => set('orphanstatus', v)}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="both_alive">Both Alive</SelectItem>
                  <SelectItem value="single_orphan">Single Orphan</SelectItem>
                  <SelectItem value="double_orphan">Double Orphan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input label="Contact" value={formValues.caregivercontact} onChange={(e) => set('caregivercontact', e.target.value)} />
          </div>
        </div>

        {/* Location */}
        <div className="flex flex-col gap-3">
          {sectionHead('Location')}
          <div className="grid grid-cols-2 gap-3">
            <Input label="State / UT *" value={formValues.addressstate} onChange={(e) => set('addressstate', e.target.value)} placeholder="e.g. maharashtra" />
            <Input label="District *" value={formValues.addressdistrict} onChange={(e) => set('addressdistrict', e.target.value)} placeholder="e.g. pune" />
          </div>
          <Input label="Address" value={formValues.address} onChange={(e) => set('address', e.target.value)} />
        </div>

        {/* Clinical */}
        <div className="flex flex-col gap-3">
          {sectionHead('Clinical Records')}
          <div className="grid grid-cols-2 gap-3">
            <Input label="Weight (kg)" type="number" step="0.1" value={formValues.current_weight || ''} onChange={(e) => set('current_weight', Number(e.target.value))} />
            <Input label="Height (cm)" type="number" value={formValues.current_height || ''} onChange={(e) => set('current_height', Number(e.target.value))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Haemoglobin (g/dL)" type="number" step="0.1" value={formValues.hemoglobin || ''} onChange={(e) => set('hemoglobin', Number(e.target.value))} />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600">Appetite</label>
              <Select value={formValues.appetite} onValueChange={(v) => set('appetite', v)}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
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
        <Button variant="secondary" onClick={onCancel} type="button" disabled={saving} className="rounded-xl text-gray-700">
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
