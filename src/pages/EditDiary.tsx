import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Bell } from 'lucide-react';
import { Button } from '@/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Textarea } from '@/ui/textarea';
import { Switch } from '@/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/layout/Header';
import { getDiaryById, updateDiary, canPartnerEditDiary } from '@/lib/storage';
import { Diary } from '@/types';

export default function EditDiary() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  const [diary, setDiary] = useState<Diary | null>(null);
  const [loading, setLoading] = useState(true);
  const [canEdit, setCanEdit] = useState(false);

  const [formData, setFormData] = useState({
    matterDate: '',
    courtName: '',
    caseType: '',
    caseNumber: '',
    partyNames: '',
    opponentAdvocate: '',
    stageOfCase: '',
    purposeOfHearing: '',
    notes: '',
    reminderEnabled: false,
    reminderDate: '',
    reminderTime: '',
  });

  useEffect(() => {
    const loadDiary = async () => {
      if (!id || !user) {
        setLoading(false);
        return;
      }
      try {
        const diaryData = await getDiaryById(id);
        if (!diaryData) {
          navigate('/diaries');
          return;
        }
        setDiary(diaryData);
        
        const isOwner = diaryData.lawyerId === user.id;
        const hasPermission = user.role === 'partner' ? await canPartnerEditDiary(user.id, id) : false;
        const canEditDiary = isOwner || hasPermission;
        setCanEdit(canEditDiary);
        
        if (!canEditDiary) {
          navigate(`/diaries/${id}`);
          return;
        }
        
        setFormData({
          matterDate: diaryData.matterDate,
          courtName: diaryData.courtName,
          caseType: diaryData.caseType,
          caseNumber: diaryData.caseNumber,
          partyNames: diaryData.partyNames,
          opponentAdvocate: diaryData.opponentAdvocate || '',
          stageOfCase: diaryData.stageOfCase,
          purposeOfHearing: diaryData.purposeOfHearing,
          notes: diaryData.notes || '',
          reminderEnabled: diaryData.reminderEnabled,
          reminderDate: diaryData.reminderDate || '',
          reminderTime: diaryData.reminderTime || '',
        });
      } catch (error) {
        console.error('Error loading diary:', error);
        navigate('/diaries');
      } finally {
        setLoading(false);
      }
    };
    loadDiary();
  }, [id, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading diary...</p>
          </div>
        </main>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!diary) return;

    const requiredFields = ['matterDate', 'courtName', 'caseType', 'caseNumber', 'partyNames', 'stageOfCase', 'purposeOfHearing'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);

    if (missingFields.length > 0) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    // Validate reminder time is in the future
    if (formData.reminderEnabled && formData.reminderDate && formData.reminderTime) {
      const reminderDateTime = new Date(`${formData.reminderDate}T${formData.reminderTime}`);
      const now = new Date();
      
      if (reminderDateTime <= now) {
        toast({
          title: 'Invalid Reminder Time',
          description: 'Reminder must be set for a future date and time.',
          variant: 'destructive',
        });
        return;
      }
    }

    try {
      await updateDiary({
        ...diary,
        ...formData,
        notes: formData.notes || undefined,
        reminderDate: formData.reminderDate || undefined,
        reminderTime: formData.reminderTime || undefined,
        updatedAt: new Date().toISOString(),
      });

      // If partner edited, revoke permission after save
      if (user?.role === 'partner' && canEdit) {
        const { revokeEditPermission } = await import('@/lib/storage');
        await revokeEditPermission(user.id, diary.id);
      }

      toast({
        title: 'Diary Updated',
        description: user?.role === 'partner' 
          ? 'Your changes have been saved. You will need to request permission again to edit.'
          : 'Your changes have been saved.',
      });

      navigate(`/diaries/${id}`);
    } catch (error) {
      console.error('Error updating diary:', error);
      toast({
        title: 'Error',
        description: 'Failed to update diary. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8 max-w-3xl">
        <Button
          variant="ghost"
          onClick={() => navigate(`/diaries/${id}`)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Diary
        </Button>

        <Card className="glass-effect border-primary/20">
          <CardHeader>
            <CardTitle className="font-serif text-2xl">Edit Diary Entry</CardTitle>
            <CardDescription>
              Update the case details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Date and Court */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="matterDate">Matter Date *</Label>
                  <Input
                    id="matterDate"
                    type="date"
                    value={formData.matterDate}
                    onChange={(e) => setFormData({ ...formData, matterDate: e.target.value })}
                    className="bg-secondary/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="courtName">Court Name *</Label>
                  <Input
                    id="courtName"
                    placeholder="e.g., Delhi High Court"
                    value={formData.courtName}
                    onChange={(e) => setFormData({ ...formData, courtName: e.target.value })}
                    className="bg-secondary/50"
                  />
                </div>
              </div>

              {/* Case Type and Number */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="caseType">Case Type *</Label>
                  <Input
                    id="caseType"
                    placeholder="e.g., Civil, Criminal, Writ"
                    value={formData.caseType}
                    onChange={(e) => setFormData({ ...formData, caseType: e.target.value })}
                    className="bg-secondary/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="caseNumber">Case Number *</Label>
                  <Input
                    id="caseNumber"
                    placeholder="e.g., CS(OS) 123/2024"
                    value={formData.caseNumber}
                    onChange={(e) => setFormData({ ...formData, caseNumber: e.target.value })}
                    className="bg-secondary/50"
                  />
                </div>
              </div>

              {/* Party Names */}
              <div className="space-y-2">
                <Label htmlFor="partyNames">Party Name(s) *</Label>
                <Input
                  id="partyNames"
                  placeholder="e.g., ABC vs XYZ"
                  value={formData.partyNames}
                  onChange={(e) => setFormData({ ...formData, partyNames: e.target.value })}
                  className="bg-secondary/50"
                />
              </div>

              {/* Opponent Advocate */}
              <div className="space-y-2">
                <Label htmlFor="opponentAdvocate">Opponent Advocate</Label>
                <Input
                  id="opponentAdvocate"
                  placeholder="Name of opposing counsel"
                  value={formData.opponentAdvocate}
                  onChange={(e) => setFormData({ ...formData, opponentAdvocate: e.target.value })}
                  className="bg-secondary/50"
                />
              </div>

              {/* Stage and Purpose */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="stageOfCase">Stage of Case *</Label>
                  <Input
                    id="stageOfCase"
                    placeholder="e.g., Arguments, Evidence"
                    value={formData.stageOfCase}
                    onChange={(e) => setFormData({ ...formData, stageOfCase: e.target.value })}
                    className="bg-secondary/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purposeOfHearing">Purpose of Hearing *</Label>
                  <Input
                    id="purposeOfHearing"
                    placeholder="e.g., Final Arguments"
                    value={formData.purposeOfHearing}
                    onChange={(e) => setFormData({ ...formData, purposeOfHearing: e.target.value })}
                    className="bg-secondary/50"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes about this matter..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="bg-secondary/50 min-h-[100px]"
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {formData.notes.length}/500
                </p>
              </div>

              {/* Reminder Toggle */}
              <div className="space-y-4 p-4 rounded-lg bg-secondary/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-primary" />
                    <Label htmlFor="reminder">Set Reminder</Label>
                  </div>
                  <Switch
                    id="reminder"
                    checked={formData.reminderEnabled}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, reminderEnabled: checked })
                    }
                  />
                </div>

                {formData.reminderEnabled && (
                  <div className="grid gap-4 md:grid-cols-2 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="reminderDate">Reminder Date</Label>
                      <Input
                        id="reminderDate"
                        type="date"
                        value={formData.reminderDate}
                        onChange={(e) => setFormData({ ...formData, reminderDate: e.target.value })}
                        className="bg-secondary/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reminderTime">Reminder Time</Label>
                      <Input
                        id="reminderTime"
                        type="time"
                        value={formData.reminderTime}
                        onChange={(e) => setFormData({ ...formData, reminderTime: e.target.value })}
                        className="bg-secondary/50"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/diaries/${id}`)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 gold-gradient text-primary-foreground">
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
