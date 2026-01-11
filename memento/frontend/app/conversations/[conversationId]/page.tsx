// app/conversations/[conversationId]/page.tsx
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
import { ArrowLeft, Calendar, FileText } from "lucide-react";
import { useRouter, useParams } from "next/navigation";

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

export default function ConversationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isLoading } = useAuth();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && params.conversationId) {
      fetchConversation();
    }
  }, [user, params.conversationId]);

  const fetchConversation = async () => {
    const token = Cookies.get("token");
    try {
      const response = await fetch(
        `${API_URL}/conversations/${params.conversationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setConversation(data);
      } else if (response.status === 404) {
        setError("Conversation not found");
      } else {
        setError("Failed to load conversation");
      }
    } catch (error) {
      console.error("Failed to fetch conversation:", error);
      setError("Failed to load conversation");
    } finally {
      setLoading(false);
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

  if (error || !conversation) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Button
              onClick={() => router.push("/conversations")}
              variant="ghost"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to Conversations
            </Button>
          </div>
        </nav>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <p className="text-xl text-gray-500">
            {error || "Conversation not found"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button
            onClick={() => router.push("/conversations")}
            variant="ghost"
            className="mb-2"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Conversations
          </Button>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar size={16} />
            <span>{formatDate(conversation.createdAt)}</span>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Section */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText size={24} className="text-blue-500" />
              <CardTitle className="text-2xl">Summary</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-gray-700 leading-relaxed">
              {conversation.summary}
            </p>
          </CardContent>
        </Card>

        {/* Full Transcript Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Conversation Transcript</CardTitle>
            <CardDescription>
              {conversation.transcript.length} message
              {conversation.transcript.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {conversation.transcript.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.speaker === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-3 ${
                      message.speaker === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <div className="text-xs font-semibold mb-1 opacity-75">
                      {message.speaker === "user" ? "You" : "Assistant"}
                    </div>
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.text}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
