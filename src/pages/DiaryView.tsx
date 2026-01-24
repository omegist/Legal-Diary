import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Calendar, Building2, FileText, Users, Bell, Trash2 } from 'lucide-react';
import { Button } from '@/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/layout/Header';
import { getDiaryById, deleteDiary, canPartnerEditDiary } from '@/lib/storage';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/ui/alert-dialog';

export default function DiaryView() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user } = useAuth();

  const diary = id ? getDiaryById(id) : null;

  if (!user) {
    navigate('/login');
    return null;
  }

  if (!diary) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <Card className="glass-effect border-destructive/50">
            <CardContent className="py-16 text-center">
              <h2 className="font-serif text-2xl font-bold mb-2">Diary Not Found</h2>
              <p className="text-muted-foreground mb-4">
                This diary entry doesn't exist or has been deleted.
              </p>
              <Button onClick={() => navigate('/diaries')}>
                Back to Diaries
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const isOwner = diary.lawyerId === user.id;
  const canEdit = isOwner || (user.role === 'partner' && canPartnerEditDiary(user.id, diary.id));

  const handleDelete = () => {
    deleteDiary(diary.id);
    toast({
      title: 'Diary Deleted',
      description: 'The diary entry has been removed.',
    });
    navigate('/diaries');
  };

  const InfoRow = ({ label, value, icon: Icon }: { label: string; value: string; icon?: React.ElementType }) => (
    <div className="flex items-start gap-4 py-3 border-b border-border/50 last:border-0">
      <div className="w-1/3 flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-primary" />}
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <div className="w-2/3">
        <span className="text-sm font-medium">{value || '—'}</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/diaries')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Diaries
          </Button>

          <div className="flex gap-2">
            {canEdit && (
              <Button
                onClick={() => navigate(`/diaries/${diary.id}/edit`)}
                className="gold-gradient text-primary-foreground"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
            
            {isOwner && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Diary Entry?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the diary entry.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        <Card className="glass-effect border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                {diary.caseType}
              </span>
              <span className="text-sm text-muted-foreground">
                {diary.caseNumber}
              </span>
            </div>
            <CardTitle className="font-serif text-2xl">{diary.partyNames}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-0">
            <InfoRow label="Matter Date" value={new Date(diary.matterDate).toLocaleDateString('en-IN', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })} icon={Calendar} />
            <InfoRow label="Court Name" value={diary.courtName} icon={Building2} />
            <InfoRow label="Case Type" value={diary.caseType} icon={FileText} />
            <InfoRow label="Case Number" value={diary.caseNumber} />
            <InfoRow label="Party Names" value={diary.partyNames} icon={Users} />
            <InfoRow label="Opponent Advocate" value={diary.opponentAdvocate} />
            <InfoRow label="Stage of Case" value={diary.stageOfCase} />
            <InfoRow label="Purpose of Hearing" value={diary.purposeOfHearing} />
            
            {diary.notes && (
              <div className="pt-4">
                <h4 className="text-sm text-muted-foreground mb-2">Notes</h4>
                <p className="text-sm bg-secondary/30 p-4 rounded-lg">{diary.notes}</p>
              </div>
            )}

            {diary.reminderEnabled && (
              <div className="flex items-center gap-2 pt-4 text-primary">
                <Bell className="h-4 w-4" />
                <span className="text-sm">
                  Reminder set for {diary.reminderDate} at {diary.reminderTime}
                </span>
              </div>
            )}

            <div className="pt-6 text-xs text-muted-foreground">
              <p>Created: {new Date(diary.createdAt).toLocaleString('en-IN')}</p>
              <p>Last updated: {new Date(diary.updatedAt).toLocaleString('en-IN')}</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
