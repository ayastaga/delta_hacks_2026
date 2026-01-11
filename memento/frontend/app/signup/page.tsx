// app/signup/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { ArrowLeft, Upload, X } from "lucide-react";
import Image from "next/image";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>("");
  const [timezone, setTimezone] = useState("");
  const [caregiverName, setCaregiverName] = useState("");
  const [caregiverRelationship, setCaregiverRelationship] = useState("");
  const [caregiverContact, setCaregiverContact] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();

  // Get user's timezone automatically
  useEffect(() => {
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimezone(userTimezone);
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file");
        return;
      }

      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError("");
    }
  };

  const removeImage = () => {
    setProfileImage(null);
    setProfileImagePreview("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Convert image to base64 if present
      let imageData = "";
      if (profileImage) {
        const reader = new FileReader();
        imageData = await new Promise((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(profileImage);
        });
      }

      await signup(email, password, {
        name,
        profileImage: imageData,
        timezone,
        primaryCaregiver: {
          name: caregiverName,
          relationship: caregiverRelationship,
          contact: caregiverContact,
        },
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="items-center justify-center min-h-screen">
      <div className="mt-10 ml-9">
        <Link href="/">
          <ArrowLeft className="hover:opacity-70 transition-opacity" />
        </Link>
      </div>
      <div className="flex justify-center p-4 pb-20">
        <Card className="w-full max-w-md border-none shadow-none bg-transparent">
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>
              Create a new account to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {/* Profile Image */}
              <div className="space-y-2">
                <Label>Profile Image (Optional)</Label>
                <p className="text-xs text-gray-500 mb-2">
                  Your image will be stored as a 512-dimensional embedding for
                  efficiency and privacy
                </p>
                {profileImagePreview ? (
                  <div className="flex items-center gap-4">
                    <div className="relative w-24 h-24">
                      <Image
                        src={profileImagePreview}
                        alt="Profile preview"
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-full cursor-pointer hover:border-gray-400 transition-colors">
                    <Upload size={24} className="text-gray-400" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input
                  id="timezone"
                  type="text"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  required
                  placeholder="Auto-detected"
                />
                <p className="text-xs text-gray-500">
                  Auto-detected, but you can change it
                </p>
              </div>

              {/* Primary Caregiver Section */}
              <div className="pt-4 border-t">
                <h3 className="text-sm font-semibold mb-3">
                  Primary Caregiver Information
                </h3>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="caregiverName">Caregiver Name</Label>
                    <Input
                      id="caregiverName"
                      type="text"
                      value={caregiverName}
                      onChange={(e) => setCaregiverName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="caregiverRelationship">Relationship</Label>
                    <Select
                      value={caregiverRelationship}
                      onValueChange={setCaregiverRelationship}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="parent">Parent</SelectItem>
                        <SelectItem value="spouse">Spouse</SelectItem>
                        <SelectItem value="partner">Partner</SelectItem>
                        <SelectItem value="sibling">Sibling</SelectItem>
                        <SelectItem value="child">Child</SelectItem>
                        <SelectItem value="friend">Friend</SelectItem>
                        <SelectItem value="professional">
                          Professional Caregiver
                        </SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="caregiverContact">
                      Contact Information
                    </Label>
                    <Input
                      id="caregiverContact"
                      type="text"
                      value={caregiverContact}
                      onChange={(e) => setCaregiverContact(e.target.value)}
                      placeholder="Phone or email"
                      required
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Sign Up"}
              </Button>

              <p className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="text-blue-600 hover:underline">
                  Login
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
