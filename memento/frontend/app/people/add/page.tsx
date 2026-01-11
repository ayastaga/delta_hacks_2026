// app/people/add/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Upload, X, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Cookies from "js-cookie";

const API_URL = "http://localhost:8080/api";

export default function AddPersonPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("");
  const [summary, setSummary] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError("");
    }
  };

  const removeImage = () => {
    setPhoto(null);
    setPhotoPreview("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    if (!relation) {
      setError("Please select a relationship");
      return;
    }

    if (!summary.trim()) {
      setError("Summary is required");
      return;
    }

    if (!photo) {
      setError("Please upload a photo");
      return;
    }

    setLoading(true);

    try {
      // Convert image to base64
      const reader = new FileReader();
      const imageData = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(photo);
      });

      const token = Cookies.get("token");
      const response = await fetch(`${API_URL}/people`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          relation,
          summary,
          photo: imageData,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add person");
      }

      // Redirect to people list or dashboard
      router.push("/people");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/people"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            <span>Back to People</span>
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Add New Person</CardTitle>
            <CardDescription>
              Add someone you know to help you remember them
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {/* Photo Upload */}
              <div className="space-y-2">
                <Label>Photo *</Label>
                <p className="text-xs text-gray-500 mb-2">
                  Upload a clear photo of the person
                </p>
                {photoPreview ? (
                  <div className="flex items-center gap-4">
                    <div className="relative w-32 h-32">
                      <Image
                        src={photoPreview}
                        alt="Person preview"
                        fill
                        className="rounded-lg object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={removeImage}
                      variant="destructive"
                      size="sm"
                    >
                      <X size={16} className="mr-2" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors bg-gray-50">
                    <Upload size={32} className="text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">
                      Click to upload photo
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter person's name"
                  required
                />
              </div>

              {/* Relation */}
              <div className="space-y-2">
                <Label htmlFor="relation">Relationship *</Label>
                <Select value={relation} onValueChange={setRelation} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="family">Family</SelectItem>
                    <SelectItem value="friend">Friend</SelectItem>
                    <SelectItem value="coworker">Coworker</SelectItem>
                    <SelectItem value="neighbor">Neighbor</SelectItem>
                    <SelectItem value="acquaintance">Acquaintance</SelectItem>
                    <SelectItem value="healthcare">
                      Healthcare Provider
                    </SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Summary */}
              <div className="space-y-2">
                <Label htmlFor="summary">Summary *</Label>
                <Textarea
                  id="summary"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Write a brief description about this person (e.g., their personality, how you know them, important details to remember)"
                  rows={4}
                  required
                />
                <p className="text-xs text-gray-500">
                  Include details that will help you remember this person
                </p>
              </div>

              <div className="flex gap-3">
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? "Adding Person..." : "Add Person"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/people")}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
