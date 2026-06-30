import React, { useMemo, useState } from 'react';
import { useStore } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, AlertCircle, CheckCircle, ShieldAlert, Sparkles, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DataValidation() {
  const { records } = useStore();
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrResults, setOcrResults] = useState<any>(null);

  const validation = useMemo(() => {
    const conflicts: any[] = [];
    const missingDocs: any[] = [];

    records.forEach((r) => {
      // 1. Fee conflicts
      const eduStatus = (r.educationstatus || '').toLowerCase();
      const tuitionFee = r.private_tution_fee || 0;
      const schoolFees = r.eduschoolfees || 0;

      if ((eduStatus === 'dropout' || eduStatus === 'never_enrolled') && (tuitionFee > 0 || schoolFees > 0)) {
        conflicts.push({
          id: r._uuid,
          name: r.childname || 'Unknown',
          childId: r._id || 'N/A',
          type: 'Education Status Conflict',
          message: `Education status is "${r.educationstatus}" but registers School/Tuition Fees of ₹${tuitionFee || schoolFees}.`
        });
      }

      // 2. Age limit verification
      if (r.dateofbirth) {
        const dob = new Date(r.dateofbirth);
        const age = new Date().getFullYear() - dob.getFullYear();
        if (age > 18) {
          conflicts.push({
            id: r._uuid,
            name: r.childname || 'Unknown',
            childId: r._id || 'N/A',
            type: 'Age Limit Warning',
            message: `Registered child is ${age} years old (limit is 18).`
          });
        }
      }

      // 3. Document check
      const missing: string[] = [];
      if (!r.thumb_impression && !r.consent_obtained) missing.push('Consent Form / Signature');
      if (!r.school_fee_receipt) missing.push('School Fee Receipt');
      if (!r.marksheet_prev_year) missing.push('Marksheet Photo');

      if (missing.length > 0) {
        missingDocs.push({
          id: r._uuid,
          name: r.childname || 'Unknown',
          childId: r._id || 'N/A',
          missing
        });
      }
    });

    return {
      conflicts,
      missingDocs
    };
  }, [records]);

  const handleSimulateOcr = () => {
    setOcrLoading(true);
    setOcrResults(null);
    
    setTimeout(() => {
      setOcrLoading(false);
      setOcrResults({
        success: true,
        extractedName: records[0]?.childname || 'Karan Kumar Shaik',
        extractedId: 'Aadhaar ID matched',
        matchScore: '96%',
        matchedChild: records[0]?.childname || 'Karan Kumar',
        childUuid: records[0]?._uuid || '',
        matchedFields: [
          { field: 'Aadhaar Status', value: 'Verified' },
          { field: 'Consent status', value: 'Consent Form Matches Signature' },
          { field: 'Gender', value: records[0]?.gender || 'Male' }
        ]
      });
    }, 1800);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900">
          Data Validation & OCR Helper
        </h2>
        <p className="font-sans text-xs text-slate-500">
          Automatic conflict checks, missing file audits, and optical character recognition (OCR) helpers
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column: Warnings and conflicts */}
        <div className="bg-white border border-slate-100 p-5 lg:col-span-2 flex flex-col gap-4 rounded-2xl shadow-sm">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2 text-red-500">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="font-display text-sm font-bold text-slate-800">
              Database Conflict Reports
            </h3>
          </div>

          <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
            {validation.conflicts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                <CheckCircle className="h-10 w-10 text-emerald-500/40 mb-2" />
                <p className="font-sans text-xs font-semibold text-emerald-600">No conflicts found</p>
                <p className="font-sans text-[10px] mt-0.5">All children records conform to standard validation rules.</p>
              </div>
            ) : (
              validation.conflicts.map((c, i) => (
                <div key={i} className="flex gap-3 rounded-xl border border-red-100 bg-red-50/50 p-4 text-xs">
                  <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">{c.name}</span>
                      <span className="font-mono text-[9px] text-slate-400">ID: {c.childId}</span>
                      <Badge variant="danger">{c.type}</Badge>
                    </div>
                    <p className="font-sans text-slate-600">{c.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right column: Missing Documents Audit */}
        <div className="bg-white border border-slate-100 p-5 flex flex-col gap-4 rounded-2xl shadow-sm">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2 text-amber-500">
            <ShieldAlert className="h-5 w-5" />
            <h3 className="font-display text-sm font-bold text-slate-800">
              Missing Documents Audit
            </h3>
          </div>

          <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto">
            {validation.missingDocs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                <CheckCircle className="h-10 w-10 text-emerald-500/40 mb-2" />
                <p className="font-sans text-xs font-semibold text-emerald-600">All documents complete</p>
                <p className="font-sans text-[10px] mt-0.5">Every registered child has a complete file attachment record.</p>
              </div>
            ) : (
              validation.missingDocs.map((doc) => (
                <div key={doc.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 text-xs flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{doc.name}</span>
                    <span className="font-mono text-[9px] text-slate-400">ID: {doc.childId}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {doc.missing.map((m: string) => (
                      <span key={m} className="rounded bg-amber-50 border border-amber-200 text-amber-600 text-[9px] font-semibold px-2 py-0.5">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Optical Character Recognition (OCR) section */}
      <div className="bg-white border border-slate-100 p-5 flex flex-col gap-4 rounded-2xl shadow-sm">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-500">
            <Sparkles className="h-5 w-5" />
            <h3 className="font-display text-sm font-bold text-slate-800">
              Intelligent Document Auditing (OCR)
            </h3>
          </div>
          <span className="font-mono text-[9px] text-blue-500 font-bold uppercase tracking-wider">
            AI Helper Powered
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* File Picker input area */}
          <div className="flex flex-col gap-3">
            <span className="font-sans text-xs font-semibold text-slate-600">Scan Beneficiary Document</span>
            <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-xl cursor-pointer bg-slate-50 transition-all duration-200 text-center p-4">
              <Upload className="h-10 w-10 text-slate-300 mb-2" />
              <span className="font-display text-xs font-semibold text-slate-700">Upload Aadhaar or Passbook</span>
              <span className="font-sans text-[9px] text-slate-400 mt-1">Accepts PNG/JPEG images up to 10MB</span>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleSimulateOcr}
                disabled={ocrLoading}
              />
            </label>
            <Button 
              variant="ghost" 
              onClick={handleSimulateOcr} 
              disabled={ocrLoading}
              className="w-full text-xs"
            >
              {ocrLoading ? 'Scanning document file...' : 'Simulate OCR Scan'}
            </Button>
          </div>

          {/* OCR Scan Results display */}
          <div className="md:col-span-2 rounded-xl border border-slate-100 bg-slate-50 p-4 flex flex-col gap-3 min-h-[160px] justify-center">
            {ocrLoading ? (
              <div className="flex flex-col items-center justify-center py-6 gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <p className="font-mono text-[10px] text-slate-500">Extracting text coordinates and matching names...</p>
              </div>
            ) : ocrResults ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-blue-600">{ocrResults.extractedName}</span>
                    <span className="text-[10px] text-slate-400">extracted</span>
                  </div>
                  <Badge variant="info">Confidence Match: {ocrResults.matchScore}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-slate-400 text-[10px]">Aadhaar / Passport details:</span>
                    <span className="font-mono text-slate-700">{ocrResults.extractedId}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-slate-400 text-[10px]">Matched Registry Child:</span>
                    <span className="font-semibold text-slate-800">{ocrResults.matchedChild}</span>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-2 flex flex-col gap-1.5">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Matched Key-Value Pairs:</span>
                  <div className="flex flex-wrap gap-2">
                    {ocrResults.matchedFields.map((f: any, i: number) => (
                      <span key={i} className="rounded bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-mono text-slate-600">
                        {f.field}: <strong className="text-emerald-500">{f.value}</strong>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-400 py-6 text-xs">
                <AlertCircle className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                <p>No document loaded yet for optical auditing.</p>
                <p className="text-[10px] mt-0.5">Select a child document image to scan details and check for registry inconsistencies.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DataValidation;
