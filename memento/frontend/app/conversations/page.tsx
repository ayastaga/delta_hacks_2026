// app/conversations/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, MessageSquare, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const API_URL = "http://localhost:8080/api";

interface Message {
  speaker: string;
  text: string;
}

interface Conversation {
  _id: string;
  summary: string;
  transcript: Message[];
  createdAt: string;
}

export default function ConversationsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (user) {
      fetchAllConversations();
    }
  }, [user]);

  const fetchAllConversations = async () => {
    const token = Cookies.get("token");
    try {
      const response = await fetch(`${API_URL}/conversations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    setConversationToDelete(conversationId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!conversationToDelete) return;

    const token = Cookies.get("token");
    try {
      const response = await fetch(
        `${API_URL}/conversations/${conversationToDelete}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setConversations(
          conversations.filter((c) => c._id !== conversationToDelete)
        );
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    } finally {
      setDeleteDialogOpen(false);
      setConversationToDelete(null);
    }
  };

  const getConversationTitle = (conversation: Conversation) => {
    if (!conversation.createdAt) return "Conversation";

    try {
      const date = new Date(conversation.createdAt);
      if (isNaN(date.getTime())) return "Conversation";

      return `Conversation – ${date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`;
    } catch (error) {
      return "Conversation";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown date";

    try {
      const date = new Date(dateString);

      if (isNaN(date.getTime())) {
        return "Invalid date";
      }

      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
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
      <nav className="bg-white border">
        <div className="max-w-7xl mt-4 mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button
            onClick={() => router.push("/dashboard")}
            variant="outline"
            className="mb-2 mt-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl mt-4 font-bold">All Conversations</h1>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {conversations.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <MessageSquare size={64} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500 text-xl mb-2">No conversations yet</p>
              <p className="text-gray-400">
                Your conversations will appear here once you start chatting
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {conversations.map((conversation) => (
              <Card
                key={conversation._id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() =>
                  router.push(`/conversations/${conversation._id}`)
                }
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">
                        {getConversationTitle(conversation)}
                      </CardTitle>
                      <CardDescription>
                        {formatDate(conversation.createdAt)}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDeleteClick(e, conversation._id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 line-clamp-2">
                    {conversation.summary}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this conversation? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
