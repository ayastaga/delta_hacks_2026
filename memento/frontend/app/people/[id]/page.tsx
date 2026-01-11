// app/people/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowLeft, Edit, Upload, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Cookies from "js-cookie";

const API_URL = "http://localhost:8080/api";

interface Person {
  _id: string;
  name: string;
  relation: string;
  summary: string;
  photo: string;
  created_at: string;
  updated_at: string;
}

export default function PersonDetailPage() {
  const router = useRouter();
  const params = useParams();
  const personId = params.id as string;

  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    relation: "",
    summary: "",
  });
  const [newPhoto, setNewPhoto] = useState<File | null>(null);
  const [newPhotoPreview, setNewPhotoPreview] = useState<string>("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPerson();
  }, [personId]);

  const fetchPerson = async () => {
    const token = Cookies.get("token");
    try {
      const response = await fetch(`${API_URL}/people/${personId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setPerson(data);
        setEditForm({
          name: data.name,
          relation: data.relation,
          summary: data.summary,
        });
      } else {
        router.push("/people");
      }
    } catch (error) {
      console.error("Failed to fetch person:", error);
      router.push("/people");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file");
        return;
      }

      setNewPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError("");
    }
  };

  const removeNewImage = () => {
    setNewPhoto(null);
    setNewPhotoPreview("");
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const updateData: any = {
        name: editForm.name,
        relation: editForm.relation,
        summary: editForm.summary,
      };

      // If new photo, convert to base64
      if (newPhoto) {
        const reader = new FileReader();
        const imageData = await new Promise<string>((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(newPhoto);
        });
        updateData.photo = imageData;
      }

      const token = Cookies.get("token");
      const response = await fetch(`${API_URL}/people/${personId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update person");
      }

      setIsEditOpen(false);
      setNewPhoto(null);
      setNewPhotoPreview("");
      fetchPerson();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!person) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link
            href="/people"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <Button variant={"outline"}>
              <ArrowLeft size={20} />
              Back to People
            </Button>
          </Link>
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger asChild>
              <Button>
                <Edit size={20} className="mr-2" />
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Person</DialogTitle>
                <DialogDescription>
                  Update the information for this person
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpdate} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                {/* Photo Update */}
                <div className="space-y-2">
                  <Label>Update Photo (Optional)</Label>
                  {newPhotoPreview ? (
                    <div className="flex items-center gap-4">
                      <div className="relative w-32 h-32">
                        <Image
                          src={newPhotoPreview}
                          alt="New photo preview"
                          fill
                          className="rounded-lg object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={removeNewImage}
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
                        Click to upload new photo
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

                <div className="space-y-2">
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-relation">Relationship</Label>
                  <Select
                    value={editForm.relation}
                    onValueChange={(value) =>
                      setEditForm({ ...editForm, relation: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
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

                <div className="space-y-2">
                  <Label htmlFor="edit-summary">Summary</Label>
                  <Textarea
                    id="edit-summary"
                    value={editForm.summary}
                    onChange={(e) =>
                      setEditForm({ ...editForm, summary: e.target.value })
                    }
                    rows={4}
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  Update Person
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <div className="relative h-96 bg-gray-200">
            <Image
              src={person.photo}
              alt={person.name}
              fill
              className="object-cover"
            />
          </div>
          <CardHeader>
            <CardTitle className="text-3xl">{person.name}</CardTitle>
            <p className="text-lg text-gray-600 capitalize">
              {person.relation}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">
                About
              </h3>
              <p className="text-gray-700 leading-relaxed">{person.summary}</p>
            </div>

            <div className="pt-6 border-t">
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Added</p>
                  <p className="font-medium">
                    {new Date(person.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Last Updated</p>
                  <p className="font-medium">
                    {new Date(person.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
