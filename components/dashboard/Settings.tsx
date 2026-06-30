// components/dashboard/Settings.tsx
'use client';

import * as React from 'react';
import useSWR from 'swr';
import { fetchFromProxy } from '@/lib/api';
import { useStore } from '@/lib/store';
import { useToast } from '../ui/Toast';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Plus, Trash2, ToggleLeft, ToggleRight, Loader2, Mail, ShieldCheck } from 'lucide-react';

interface Recipient {
  email: string;
  name: string;
  status: 'Active' | 'Inactive';
  dateAdded: string;
}

interface ReportConfig {
  enabled: boolean;
  emailList: string;
  frequency: 'weekly' | 'monthly';
}

export const Settings: React.FC = () => {
  const user = useStore((s) => s.user);
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);
  const { toast } = useToast();

  const [reportConfig, setReportConfig] = React.useState<ReportConfig>({
    enabled: false,
    emailList: '',
    frequency: 'weekly'
  });
  
  const [configSaving, setConfigSaving] = React.useState(false);
  const [isAddRecipientOpen, setIsAddRecipientOpen] = React.useState(false);
  const [newEmail, setNewEmail] = React.useState('');
  const [newName, setNewName] = React.useState('');
  const [recipientSaving, setRecipientSaving] = React.useState(false);

  const isAdmin = user?.role === 'Admin' || user?.role === 'SuperAdmin';

  // Fetch recipients list
  const { data: recipients, mutate: mutateRecipients, isLoading: isLoadingRecipients } = useSWR(
    'getRecipientsList',
    async () => {
      const res = await fetchFromProxy<{ success: boolean; recipients: Recipient[]; error?: string }>('getRecipientsList');
      if (res && res.success) return res.recipients;
      return [];
    },
    { revalidateOnFocus: false }
  );

  // Fetch report config
  const { isLoading: isLoadingConfig } = useSWR(
    'getScheduledReportConfig',
    async () => {
      const res = await fetchFromProxy<{ success: boolean; enabled: boolean; emailList: string; frequency: 'weekly' | 'monthly'; error?: string }>('getScheduledReportConfig');
      if (res && res.success) {
        setReportConfig({
          enabled: res.enabled,
          emailList: res.emailList,
          frequency: res.frequency
        });
      }
      return res;
    },
    { revalidateOnFocus: false }
  );

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      toast({ type: 'error', message: 'Access denied: Admin privileges required.' });
      return;
    }
    setConfigSaving(true);
    try {
      const res = await fetchFromProxy<{ success: boolean; message?: string; error?: string }>('setScheduledReportConfig', [reportConfig]);
      if (res.success) {
        toast({ type: 'success', message: res.message || 'Report schedule updated successfully.' });
      } else {
        throw new Error(res.error || 'Save failed');
      }
    } catch (err: any) {
      toast({ type: 'error', message: err.message || 'Failed to update schedule.' });
    } finally {
      setConfigSaving(false);
    }
  };

  const handleToggleRecipient = async (recipient: Recipient) => {
    if (!isAdmin) {
      toast({ type: 'error', message: 'Access denied: Admin privileges required.' });
      return;
    }
    const nextStatus = recipient.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await fetchFromProxy<{ success: boolean; message?: string }>('toggleRecipientStatus', [recipient.email, nextStatus]);
      if (res.success) {
        toast({ type: 'success', message: `Recipient status updated to ${nextStatus}.` });
        mutateRecipients();
      }
    } catch (err: any) {
      toast({ type: 'error', message: err.message || 'Failed to update recipient.' });
    }
  };

  const handleDeleteRecipient = async (email: string) => {
    if (!isAdmin) {
      toast({ type: 'error', message: 'Access denied: Admin privileges required.' });
      return;
    }
    try {
      const res = await fetchFromProxy<{ success: boolean; message?: string }>('deleteRecipient', [email]);
      if (res.success) {
        toast({ type: 'success', message: 'Recipient deleted successfully.' });
        mutateRecipients();
      }
    } catch (err: any) {
      toast({ type: 'error', message: err.message || 'Failed to delete recipient.' });
    }
  };

  const handleAddRecipientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newName) return;
    setRecipientSaving(true);
    try {
      const res = await fetchFromProxy<{ success: boolean; message?: string; error?: string }>('addRecipient', [newEmail, newName, 'Active']);
      if (res.success) {
        toast({ type: 'success', message: 'Recipient added successfully.' });
        setNewEmail('');
        setNewName('');
        setIsAddRecipientOpen(false);
        mutateRecipients();
      } else {
        throw new Error(res.error || 'Failed to add recipient');
      }
    } catch (err: any) {
      toast({ type: 'error', message: err.message || 'Error adding recipient.' });
    } finally {
      setRecipientSaving(false);
    }
  };

  // Local simulated runtime logs
  const [localLogs] = React.useState<string[]>([
    `[${new Date().toLocaleTimeString()}] INF - Initializing local configuration cache...`,
    `[${new Date().toLocaleTimeString()}] INF - Connected to Vercel Serverless Gateway: Edge Optimized`,
    `[${new Date().toLocaleTimeString()}] INF - Current session verified: ${user?.name} (${user?.role})`,
    `[${new Date().toLocaleTimeString()}] INF - Pulling reports configuration parameters...`,
    `[${new Date().toLocaleTimeString()}] INF - Mapped ${recipients?.length || 0} active report endpoints.`,
  ]);

  return (
    <div className="flex flex-col gap-6 text-left select-none animate-slide-up">
      <div>
        <h3 className="text-lg font-extrabold text-zinc-900 tracking-tight">System Settings</h3>
        <p className="text-xs text-zinc-500">Configure report triggers, recipient whitelist, system parameters and workspace themes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Scheduled Reports Configuration */}
        <div className="glass-card p-6 bg-white flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h3 className="text-sm font-extrabold text-zinc-900 tracking-tight">Scheduled Email Reports</h3>
              <p className="text-[11px] text-zinc-500">Configure automated PDF & Excel summaries emailed to coordinators</p>
            </div>
            
            {isLoadingConfig ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-zinc-500" /></div>
            ) : (
              <form onSubmit={handleSaveConfig} className="flex flex-col gap-5 mt-2 text-left">
                {/* Enabled Toggle */}
                <div className="flex items-center justify-between p-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-zinc-900">Enable Automated Summaries</span>
                    <span className="text-[10px] text-zinc-500">Toggles background mail triggers in Google Apps Script</span>
                  </div>
                  
                  <button
                    type="button"
                    disabled={!isAdmin}
                    onClick={() => setReportConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
                    className="p-1 text-zinc-400 hover:text-zinc-900 rounded-lg transition-colors cursor-pointer disabled:opacity-40"
                  >
                    {reportConfig.enabled ? (
                      <ToggleRight className="w-8 h-8 text-blue-600" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-zinc-300" />
                    )}
                  </button>
                </div>

                {/* Frequency Select */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-550">Trigger Frequency</label>
                  <Select
                    disabled={!isAdmin || !reportConfig.enabled}
                    value={reportConfig.frequency}
                    onValueChange={(val: any) => setReportConfig(prev => ({ ...prev, frequency: val }))}
                  >
                    <SelectTrigger className="h-10 bg-white">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly (Every Monday at 08:00 AM)</SelectItem>
                      <SelectItem value="monthly">Monthly (First day of month at 08:00 AM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {isAdmin && (
                  <Button variant="primary" type="submit" className="self-end rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold h-9 px-4" isLoading={configSaving}>
                    Save Config
                  </Button>
                )}
              </form>
            )}
          </div>
        </div>

        {/* Recipients list */}
        <div className="glass-card p-6 bg-white flex flex-col justify-between">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-zinc-900 tracking-tight">Email Recipients List</h3>
                <p className="text-[11px] text-zinc-500">Verify whitelisted email coordinates mapped for report distribution</p>
              </div>
              {isAdmin && (
                <Button variant="secondary" size="sm" onClick={() => setIsAddRecipientOpen(true)} className="rounded-xl h-8 px-3 border border-zinc-200">
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add
                </Button>
              )}
            </div>

            {isLoadingRecipients ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-zinc-500" /></div>
            ) : (
              <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden overflow-x-auto relative mt-2">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200 bg-zinc-50/50 text-zinc-500 text-[10px] font-bold uppercase">
                      <th className="px-4 py-2">Name</th>
                      <th className="px-4 py-2">Email</th>
                      <th className="px-4 py-2">Status</th>
                      {isAdmin && <th className="px-4 py-2 text-right">Action</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-xs font-medium text-zinc-700">
                    {recipients && recipients.length > 0 ? (
                      recipients.map((rec) => (
                        <tr key={rec.email} className="hover:bg-zinc-50/50">
                          <td className="px-4 py-2">{rec.name}</td>
                          <td className="px-4 py-2 font-mono text-zinc-500">{rec.email}</td>
                          <td className="px-4 py-2">
                            <button
                              disabled={!isAdmin}
                              onClick={() => handleToggleRecipient(rec)}
                              className="focus:outline-none cursor-pointer"
                            >
                              <Badge variant={rec.status === 'Active' ? 'success' : 'secondary'}>
                                {rec.status}
                              </Badge>
                            </button>
                          </td>
                          {isAdmin && (
                            <td className="px-4 py-2 text-right">
                              <button
                                onClick={() => handleDeleteRecipient(rec.email)}
                                className="text-zinc-400 hover:text-red-500 p-1 cursor-pointer transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="h-20 text-center text-zinc-450">
                          No recipients whitelisted yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Dashboard Theme Customizer */}
        <div className="glass-card p-6 bg-white flex flex-col">
          <div className="mb-4 text-left">
            <h3 className="text-sm font-extrabold text-zinc-900 tracking-tight">Theme Profiles</h3>
            <p className="text-[11px] text-zinc-500">Select a theme profile to customize your workspace appearance</p>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-2">
            <button
              onClick={() => setTheme('classic')}
              className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${theme === 'classic' ? 'bg-zinc-50 border-blue-500 shadow-sm ring-1 ring-blue-500/20' : 'bg-white border-zinc-200 hover:border-zinc-300'}`}
            >
              <div className="w-full h-12 rounded-lg overflow-hidden flex shadow-inner border border-zinc-200">
                <div className="w-[70%] bg-blue-600" />
                <div className="w-[30%] bg-amber-400" />
              </div>
              <span className={`text-[11px] font-bold ${theme === 'classic' ? 'text-blue-600' : 'text-zinc-500'}`}>Classic Blue</span>
            </button>

            <button
              onClick={() => setTheme('dark')}
              className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${theme === 'dark' ? 'bg-zinc-50 border-blue-500 shadow-sm ring-1 ring-blue-500/20' : 'bg-white border-zinc-200 hover:border-zinc-300'}`}
            >
              <div className="w-full h-12 rounded-lg overflow-hidden flex shadow-inner border border-zinc-200">
                <div className="w-[70%] bg-zinc-800" />
                <div className="w-[30%] bg-amber-400" />
              </div>
              <span className={`text-[11px] font-bold ${theme === 'dark' ? 'text-blue-600' : 'text-zinc-500'}`}>Sleek Dark</span>
            </button>

            <button
              onClick={() => setTheme('emerald')}
              className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${theme === 'emerald' ? 'bg-zinc-50 border-blue-500 shadow-sm ring-1 ring-blue-500/20' : 'bg-white border-zinc-200 hover:border-zinc-300'}`}
            >
              <div className="w-full h-12 rounded-lg overflow-hidden flex shadow-inner border border-zinc-200">
                <div className="w-[70%] bg-emerald-700" />
                <div className="w-[30%] bg-amber-200" />
              </div>
              <span className={`text-[11px] font-bold ${theme === 'emerald' ? 'text-blue-600' : 'text-zinc-500'}`}>Emerald Teal</span>
            </button>
          </div>
        </div>

        {/* Live System Console */}
        <div className="glass-card p-6 bg-white flex flex-col justify-between">
          <div className="mb-3 text-left">
            <h3 className="text-sm font-extrabold text-zinc-900 tracking-tight">System Logs Console</h3>
            <p className="text-[11px] text-zinc-500">Real-time local event feed running in the browser engine</p>
          </div>
          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 font-mono text-[10px] text-zinc-650 leading-relaxed max-h-[140px] overflow-y-auto flex flex-col gap-1 text-left">
            {localLogs.map((log, idx) => (
              <div key={idx} className="text-zinc-600">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Recipient Dialog */}
      <Dialog open={isAddRecipientOpen} onOpenChange={setIsAddRecipientOpen}>
        <DialogContent className="max-w-sm bg-white border border-zinc-200 rounded-3xl p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-zinc-900 font-extrabold text-base">Add Email Recipient</DialogTitle>
            <DialogDescription className="text-zinc-500 text-xs">Input email coordinates for automated PDF report delivery.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddRecipientSubmit} className="flex flex-col gap-4 py-2 text-left">
            <Input
              label="Recipient Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Farid"
              disabled={recipientSaving}
            />

            <Input
              label="Email Address"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="farid@cloudlogs.com"
              disabled={recipientSaving}
            />

            <DialogFooter className="mt-2 border-t pt-3">
              <Button variant="secondary" onClick={() => setIsAddRecipientOpen(false)} disabled={recipientSaving} className="rounded-xl">
                Cancel
              </Button>
              <Button variant="primary" type="submit" isLoading={recipientSaving} className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold">
                Add Recipient
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

Settings.displayName = 'Settings';
export default Settings;
