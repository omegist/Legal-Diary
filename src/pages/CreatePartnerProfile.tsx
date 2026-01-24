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
import { PartnerProfile } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/avatar';

export default function CreatePartnerProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { setUser } = useAuth();
  
  const { email, password } = (location.state as { email: string; password: string }) || {};

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    description: '',
    profilePhoto: '',
  });

  if (!email) {
    navigate('/get-started');
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    const newUser: PartnerProfile = {
      id: crypto.randomUUID(),
      email,
      role: 'partner',
      name: formData.name,
      phone: formData.phone,
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
            <CardTitle className="font-serif text-2xl">Create Partner Profile</CardTitle>
            <CardDescription>
              Set up your partner account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Photo */}
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-24 w-24 border-2 border-primary/30">
                  <AvatarImage src={formData.profilePhoto} />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                    {formData.name?.charAt(0) || 'P'}
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

              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="Your Name"
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

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description about yourself..."
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
