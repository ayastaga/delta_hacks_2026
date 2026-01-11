// app/people/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Plus, User } from "lucide-react";
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
}

export default function PeoplePage() {
  const router = useRouter();
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPeople();
  }, []);

  const fetchPeople = async () => {
    const token = Cookies.get("token");
    try {
      const response = await fetch(`${API_URL}/people`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setPeople(data);
      }
    } catch (error) {
      console.error("Failed to fetch people:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this person?")) return;

    const token = Cookies.get("token");
    try {
      const response = await fetch(`${API_URL}/people/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchPeople();
      }
    } catch (error) {
      console.error("Failed to delete person:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mt-4 mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <Button variant={"outline"}>
              <ArrowLeft size={20} /> Back to Dashboard
            </Button>
          </Link>
          <Button onClick={() => router.push("/people/add")}>
            <Plus size={20} className="mr-2" />
            Add Person
          </Button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">People You Know</h1>
          <p className="text-gray-600 mt-2">
            Keep track of the important people in your life
          </p>
        </div>

        {people.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <User size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">
                You haven't added any people yet
              </p>
              <Button onClick={() => router.push("/people/add")}>
                <Plus size={20} className="mr-2" />
                Add Your First Person
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {people.map((person) => (
              <Card key={person._id} className="overflow-hidden">
                <div className="relative h-48 bg-gray-200">
                  <Image
                    src={person.photo}
                    alt={person.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle>{person.name}</CardTitle>
                  <CardDescription className="capitalize">
                    {person.relation}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {person.summary}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => router.push(`/people/${person._id}`)}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(person._id)}
                    >
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
