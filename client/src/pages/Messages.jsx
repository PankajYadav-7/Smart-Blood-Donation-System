import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Send,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  User,
  Building,
  Droplets,
  Search,
  Bell,
} from "lucide-react";

const Messages = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [activeTab, setActiveTab] = useState("messages");

  const conversations = [
    { id: 1, type: "donor", name: "John Smith", lastMessage: "I can donate tomorrow at 10 AM", timestamp: "2 min ago", status: "unread", bloodType: "O+", requestId: "REQ-001" },
    { id: 2, type: "hospital", name: "Bir Hospital", lastMessage: "Thank you for accepting the request", timestamp: "1 hour ago", status: "read", bloodType: "A+", requestId: "REQ-002" },
    { id: 3, type: "donor", name: "Sarah Johnson", lastMessage: "What documents do I need to bring?", timestamp: "3 hours ago", status: "unread", bloodType: "B-", requestId: "REQ-003" },
  ];

  const messages = [
    { id: 1, sender: "John Smith", message: "Hi, I saw your blood request. I'm available to donate.", timestamp: "10:30 AM", isOwn: false },
    { id: 2, sender: "You", message: "Thank you so much! When would be a good time for you?", timestamp: "10:32 AM", isOwn: true },
    { id: 3, sender: "John Smith", message: "I can donate tomorrow at 10 AM. Should I come directly to the hospital?", timestamp: "10:35 AM", isOwn: false },
    { id: 4, sender: "You", message: "Yes, please come to Bir Hospital. I'll inform the staff about your visit.", timestamp: "10:36 AM", isOwn: true },
  ];

  const notifications = [
    { id: 1, type: "donor_accepted", message: "Sarah Johnson accepted your blood request REQ-003", timestamp: "5 min ago", status: "new" },
    { id: 2, type: "request_fulfilled", message: "Your blood request REQ-001 has been marked as fulfilled", timestamp: "2 hours ago", status: "read" },
    { id: 3, type: "new_donor", message: "3 new donors matched for your request REQ-004", timestamp: "1 day ago", status: "read" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Messages & Notifications</h1>
          <p className="text-gray-500 mt-1">Communicate securely with donors, hospitals, and patients</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-white rounded-xl p-1 shadow-sm border border-gray-200 mb-6 w-fit">
          {[
            { id: "messages", label: "💬 Messages" },
            { id: "notifications", label: "🔔 Notifications" },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id ? "bg-red-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-50"
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Messages Tab */}
        {activeTab === "messages" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Conversations */}
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageCircle className="h-5 w-5 text-red-600" />
                  Conversations
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    placeholder="Search conversations..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv.id)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 border-b transition-colors ${
                      selectedConversation === conv.id ? "bg-red-50 border-l-4 border-l-red-600" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center">
                          {conv.type === "donor"
                            ? <User className="h-4 w-4 text-red-600" />
                            : <Building className="h-4 w-4 text-red-600" />
                          }
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-gray-900">{conv.name}</p>
                            <Badge className="bg-red-100 text-red-700 text-xs">{conv.bloodType}</Badge>
                          </div>
                          <p className="text-xs text-gray-500 truncate max-w-32">{conv.lastMessage}</p>
                          <p className="text-xs text-gray-400">{conv.requestId}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs text-gray-400">{conv.timestamp}</span>
                        {conv.status === "unread" && (
                          <div className="w-2.5 h-2.5 bg-red-600 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Message Thread */}
            <div className="lg:col-span-2">
              {selectedConversation ? (
                <Card className="border-0 shadow-md flex flex-col h-[550px]">
                  <CardHeader className="flex-shrink-0 border-b border-gray-100 pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">John Smith</h3>
                          <p className="text-xs text-gray-500">Blood Request: REQ-001 • O+ Blood Type</p>
                        </div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-700">
                        <Droplets className="w-3 h-3 mr-1" />
                        Active Request
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 overflow-y-auto py-4 space-y-3">
                    {messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-xs lg:max-w-md p-3 rounded-2xl ${
                          msg.isOwn
                            ? "bg-red-600 text-white rounded-br-sm"
                            : "bg-gray-100 text-gray-900 rounded-bl-sm"
                        }`}>
                          <p className="text-sm">{msg.message}</p>
                          <p className={`text-xs mt-1 ${msg.isOwn ? "text-red-200" : "text-gray-400"}`}>
                            {msg.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>

                  <div className="p-4 border-t border-gray-100">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && newMessage.trim()) setNewMessage("");
                        }}
                        className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <Button
                        onClick={() => setNewMessage("")}
                        disabled={!newMessage.trim()}
                        className="rounded-xl"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="border-0 shadow-md h-[550px] flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="mx-auto h-16 w-16 text-gray-200 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Select a conversation</h3>
                    <p className="text-gray-400 text-sm">Choose from the list to start messaging</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-red-600" />
                Recent Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${
                      notif.status === "new"
                        ? "bg-red-50 border-red-200"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      notif.type === "donor_accepted" ? "bg-green-100 text-green-600" :
                      notif.type === "request_fulfilled" ? "bg-blue-100 text-blue-600" :
                      "bg-orange-100 text-orange-600"
                    }`}>
                      {notif.type === "donor_accepted"
                        ? <CheckCircle className="h-5 w-5" />
                        : notif.type === "request_fulfilled"
                        ? <Droplets className="h-5 w-5" />
                        : <AlertCircle className="h-5 w-5" />
                      }
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{notif.message}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-400">{notif.timestamp}</span>
                        {notif.status === "new" && (
                          <Badge className="bg-red-100 text-red-700 text-xs">New</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Messages;