import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import { Button } from '@/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Textarea } from '@/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/layout/Header';
import { updateUser } from '@/lib/storage';
import { LawyerProfile, PartnerProfile } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/avatar';

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, setUser } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    profilePhoto: user?.profilePhoto || '',
    practiceArea: (user as LawyerProfile)?.practiceArea || '',
    courtName: (user as LawyerProfile)?.courtName || '',
    experienceYears: (user as LawyerProfile)?.experienceYears?.toString() || '',
    description: (user as LawyerProfile)?.description || (user as PartnerProfile)?.description || '',
  });

  if (!user) {
    navigate('/login');
    return null;
  }

  const isLawyer = user.role === 'lawyer';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone) {
      toast({
        title: 'Missing Information',
        description: 'Name and phone are required.',
        variant: 'destructive',
      });
      return;
    }

    const updatedUser = {
      ...user,
      name: formData.name,
      phone: formData.phone,
      profilePhoto: formData.profilePhoto || undefined,
      description: formData.description || undefined,
      ...(isLawyer && {
        practiceArea: formData.practiceArea || undefined,
        courtName: formData.courtName || undefined,
        experienceYears: formData.experienceYears ? parseInt(formData.experienceYears) : undefined,
      }),
    };

    updateUser(updatedUser as LawyerProfile | PartnerProfile);
    setUser(updatedUser as LawyerProfile | PartnerProfile);

    toast({
      title: 'Profile Updated',
      description: 'Your changes have been saved.',
    });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profilePhoto: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card className="glass-effect border-primary/20">
          <CardHeader>
            <CardTitle className="font-serif text-2xl">Your Profile</CardTitle>
            <CardDescription>
              Update your personal information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Photo */}
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-24 w-24 border-2 border-primary/30">
                  <AvatarImage src={formData.profilePhoto} />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                    {formData.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <Label
                  htmlFor="photo"
                  className="cursor-pointer inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Upload className="h-4 w-4" />
                  Change Photo
                </Label>
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user.email} disabled className="bg-muted/50" />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <Input value={user.role === 'lawyer' ? 'Lawyer / Associate' : 'Partner'} disabled className="bg-muted/50 capitalize" />
                <p className="text-xs text-muted-foreground">Role cannot be changed</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-secondary/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Mobile Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-secondary/50"
                  />
                </div>
              </div>

              {isLawyer && (
                <>
                  <div className="space-y-2">
                    <Label>Enrollment Number</Label>
                    <Input value={(user as LawyerProfile).enrollmentNumber} disabled className="bg-muted/50" />
                    <p className="text-xs text-muted-foreground">Enrollment number cannot be changed</p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="practiceArea">Practice Area</Label>
                      <Input
                        id="practiceArea"
                        value={formData.practiceArea}
                        onChange={(e) => setFormData({ ...formData, practiceArea: e.target.value })}
                        className="bg-secondary/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="court">Primary Court</Label>
                      <Input
                        id="court"
                        value={formData.courtName}
                        onChange={(e) => setFormData({ ...formData, courtName: e.target.value })}
                        className="bg-secondary/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Input
                      id="experience"
                      type="number"
                      value={formData.experienceYears}
                      onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                      className="bg-secondary/50"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-secondary/50 min-h-[100px]"
                />
              </div>

              <Button type="submit" className="w-full gold-gradient text-primary-foreground">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
