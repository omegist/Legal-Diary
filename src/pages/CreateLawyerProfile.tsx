import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Scale, Upload, ArrowRight } from 'lucide-react';
import { Button } from '@/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/card';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Textarea } from '@/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { createUser } from '@/lib/storage';
import { LawyerProfile } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/avatar';

export default function CreateLawyerProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { setUser } = useAuth();
  
  const { email, password } = (location.state as { email: string; password: string }) || {};

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    enrollmentNumber: '',
    practiceArea: '',
    courtName: '',
    experienceYears: '',
    description: '',
    profilePhoto: '',
  });

  if (!email) {
    navigate('/get-started');
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.enrollmentNumber) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    const newUser: LawyerProfile = {
      id: crypto.randomUUID(),
      email,
      role: 'lawyer',
      name: formData.name,
      phone: formData.phone,
      enrollmentNumber: formData.enrollmentNumber,
      practiceArea: formData.practiceArea || undefined,
      courtName: formData.courtName || undefined,
      experienceYears: formData.experienceYears ? parseInt(formData.experienceYears) : undefined,
      description: formData.description || undefined,
      profilePhoto: formData.profilePhoto || undefined,
      createdAt: new Date().toISOString(),
    };

    createUser(newUser);
    setUser(newUser);

    toast({
      title: 'Profile Created!',
      description: 'Welcome to Legal Diary.',
    });

    navigate('/dashboard');
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
    <div className="min-h-screen bg-background legal-pattern py-8 px-4">
      <div className="container max-w-2xl">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <Scale className="h-10 w-10 text-primary" />
            <span className="font-serif text-2xl font-semibold text-gold-gradient">
              Legal Diary
            </span>
          </Link>
        </div>

        <Card className="glass-effect border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="font-serif text-2xl">Create Lawyer Profile</CardTitle>
            <CardDescription>
              Complete your professional profile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Photo */}
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-24 w-24 border-2 border-primary/30">
                  <AvatarImage src={formData.profilePhoto} />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                    {formData.name?.charAt(0) || 'L'}
                  </AvatarFallback>
                </Avatar>
                <Label
                  htmlFor="photo"
                  className="cursor-pointer inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Upload className="h-4 w-4" />
                  Upload Photo
                </Label>
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="Advocate Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-secondary/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Mobile Number *</Label>
                  <Input
                    id="phone"
                    placeholder="+91 XXXXX XXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-secondary/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="enrollment">Enrollment Number *</Label>
                <Input
                  id="enrollment"
                  placeholder="BAR/XXXX/XXXX"
                  value={formData.enrollmentNumber}
                  onChange={(e) => setFormData({ ...formData, enrollmentNumber: e.target.value })}
                  className="bg-secondary/50"
                />
                <p className="text-xs text-muted-foreground">
                  This is private and will never be visible to partners
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="practiceArea">Practice Area</Label>
                  <Input
                    id="practiceArea"
                    placeholder="e.g., Civil, Criminal"
                    value={formData.practiceArea}
                    onChange={(e) => setFormData({ ...formData, practiceArea: e.target.value })}
                    className="bg-secondary/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="court">Primary Court</Label>
                  <Input
                    id="court"
                    placeholder="e.g., Delhi High Court"
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
                  placeholder="e.g., 5"
                  value={formData.experienceYears}
                  onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                  className="bg-secondary/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Short Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of your practice..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-secondary/50 min-h-[100px]"
                />
              </div>

              <Button type="submit" className="w-full gold-gradient text-primary-foreground">
                Create Profile
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
