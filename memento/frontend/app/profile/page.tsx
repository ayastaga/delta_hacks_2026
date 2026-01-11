// app/profile/page.tsx
"use client";

import { useAuth } from "@/lib/auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function Profile() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>You must be logged in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Nav */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mt-4 mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <Button variant={"outline"}>
              <ArrowLeft size={20} /> Back to Dashboard
            </Button>
          </Link>
        </div>
      </nav>

      {/* Page Content */}
      <div className="container justify-center items-center max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-5xl font-baskerville font-semibold mb-6">
          User Profile
        </h2>

        <div className="items-center w-full flex justify-center">
          <Card className="w-5/6 ">
            <CardHeader className="flex flex-row items-center gap-4">
              {user.profileImage && (
                <div className="relative w-16 h-16">
                  <Image
                    src={user.profileImage}
                    alt={user.name}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
              )}
              <CardTitle className="capitalize font-normal tracking-tight text-4xl">
                {user.name}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6 tracking-tight">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-md">{user.email}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Timezone</p>
                  <p className="text-md">{user.timezone || "Not set"}</p>
                </div>
              </div>

              {user.primaryCaregiver && (
                <div className="pt-4 border-t">
                  <h3 className="text-sm font-semibold mb-3">
                    Primary Caregiver
                  </h3>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Name</p>
                      <p className="text-md capitalize">
                        {user.primaryCaregiver.name}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Relationship
                      </p>
                      <p className="text-md capitalize">
                        {user.primaryCaregiver.relationship}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Contact
                      </p>
                      <p className="text-md">{user.primaryCaregiver.contact}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
