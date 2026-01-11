// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Cookies from "js-cookie";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import { Users } from "lucide-react";
import { useRouter } from "next/navigation";

const API_URL = "http://localhost:8080/api";

interface Item {
  _id: string;
  title: string;
  description: string;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [formData, setFormData] = useState({ title: "", description: "" });

  useEffect(() => {
    if (user) {
      fetchItems();
    }
  }, [user]);

  const fetchItems = async () => {
    const token = Cookies.get("token");
    try {
      const response = await fetch(`${API_URL}/items`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      console.error("Failed to fetch items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = Cookies.get("token");

    try {
      const response = await fetch(`${API_URL}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({ title: "", description: "" });
        setIsCreateOpen(false);
        fetchItems();
      }
    } catch (error) {
      console.error("Failed to create item:", error);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const token = Cookies.get("token");

    try {
      const response = await fetch(`${API_URL}/items/${editingItem._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({ title: "", description: "" });
        setEditingItem(null);
        fetchItems();
      }
    } catch (error) {
      console.error("Failed to update item:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    const token = Cookies.get("token");

    try {
      const response = await fetch(`${API_URL}/items/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchItems();
      }
    } catch (error) {
      console.error("Failed to delete item:", error);
    }
  };

  const openEditDialog = (item: Item) => {
    setEditingItem(item);
    setFormData({ title: item.title, description: item.description });
  };

  if (isLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {user?.profileImage && (
              <div className="relative w-10 h-10">
                <Image
                  src={user.profileImage}
                  alt={user.name}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
            )}
            <h1 className="text-2xl font-bold">
              Welcome, <span className="capitalize">{user?.name}</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={() => router.push("/people")} variant="outline">
              <Users size={20} className="mr-2" />
              People
            </Button>
            <Button onClick={logout} variant="outline">
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Conversations</h2>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>Create New Item</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Item</DialogTitle>
                <DialogDescription>
                  Add a new item to your collection
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="create-title">Title</Label>
                  <Input
                    id="create-title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-description">Description</Label>
                  <Input
                    id="create-description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
                <Button type="submit" className="w-full">
                  Create
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {items.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              No items yet. Create your first item to get started!
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <Card key={item._id}>
                <CardHeader>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Dialog
                      open={editingItem?._id === item._id}
                      onOpenChange={(open) => {
                        if (!open) {
                          setEditingItem(null);
                          setFormData({ title: "", description: "" });
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(item)}
                        >
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Item</DialogTitle>
                          <DialogDescription>
                            Make changes to your item
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleUpdate} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-title">Title</Label>
                            <Input
                              id="edit-title"
                              value={formData.title}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  title: e.target.value,
                                })
                              }
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-description">
                              Description
                            </Label>
                            <Input
                              id="edit-description"
                              value={formData.description}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  description: e.target.value,
                                })
                              }
                            />
                          </div>
                          <Button type="submit" className="w-full">
                            Update
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(item._id)}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* User Profile Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-xl font-semibold mb-6">User Profile</h2>
        <Card>
          <CardHeader>
            <CardTitle>Your Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="text-lg">{user?.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-lg">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Timezone</p>
                <p className="text-lg">{user?.timezone || "Not set"}</p>
              </div>
            </div>

            {user?.primaryCaregiver && (
              <div className="pt-4 border-t">
                <h3 className="text-sm font-semibold mb-3">
                  Primary Caregiver
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Name</p>
                    <p className="text-lg">{user.primaryCaregiver.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Relationship
                    </p>
                    <p className="text-lg capitalize">
                      {user.primaryCaregiver.relationship}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Contact</p>
                    <p className="text-lg">{user.primaryCaregiver.contact}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
