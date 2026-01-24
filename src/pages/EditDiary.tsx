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

export default function EditDiary() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user } = useAuth();

  const diary = id ? getDiaryById(id) : null;

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
    if (diary) {
      setFormData({
        matterDate: diary.matterDate,
        courtName: diary.courtName,
        caseType: diary.caseType,
        caseNumber: diary.caseNumber,
        partyNames: diary.partyNames,
        opponentAdvocate: diary.opponentAdvocate || '',
        stageOfCase: diary.stageOfCase,
        purposeOfHearing: diary.purposeOfHearing,
        notes: diary.notes || '',
        reminderEnabled: diary.reminderEnabled,
        reminderDate: diary.reminderDate || '',
        reminderTime: diary.reminderTime || '',
      });
    }
  }, [diary]);

  if (!user) {
    navigate('/login');
    return null;
  }

  if (!diary) {
    navigate('/diaries');
    return null;
  }

  const isOwner = diary.lawyerId === user.id;
  const canEdit = isOwner || (user.role === 'partner' && canPartnerEditDiary(user.id, diary.id));

  if (!canEdit) {
    navigate(`/diaries/${id}`);
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

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

    updateDiary({
      ...diary,
      ...formData,
      notes: formData.notes || undefined,
      reminderDate: formData.reminderDate || undefined,
      reminderTime: formData.reminderTime || undefined,
    });

    toast({
      title: 'Diary Updated',
      description: 'Your changes have been saved.',
    });

    navigate(`/diaries/${id}`);
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
