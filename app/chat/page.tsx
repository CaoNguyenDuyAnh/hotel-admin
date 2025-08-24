"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, MessageSquare, Send, Paperclip, Smile, MoreHorizontal } from "lucide-react";

// ShadCN + Tailwind + Next.js client component
// - Assumes shadcn/ui components are available under `@/components/ui/*`
// - Replace mock data with your API / websocket

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Message = { id: string; text: string; fromMe: boolean; time: string };


type Platform = "facebook" | "zalo";


type Contact = {
id: string;
platformId: string;
platform: Platform;
name: string;
avatar: string;
phone?: string;
preview?: string;
lastTime?: string;
subtitle?: string;
};


const mockContacts: Contact[] = [
{ id: "1", platformId: "fb_1001", platform: "facebook", name: "Nguyễn Thị Huyền Trân", avatar: "NT", phone: "0987456322", preview: "Dạ cho em xin số điện thoại...", lastTime: "18:06", subtitle: "Khách mới" },
{ id: "2", platformId: "zalo_2002", platform: "zalo", name: "Kim Sóc", avatar: "KS", phone: "", preview: "Chào anh Kim Sóc, anh vui...", lastTime: "09:41", subtitle: "Fanpage" },
{ id: "3", platformId: "fb_1003", platform: "facebook", name: "Toan Truyen", avatar: "TT", phone: "", preview: "Tin nhắn Remarketing...", lastTime: "17:13", subtitle: "Khách cũ" },
];


const mockMessagesMap: Record<string, Message[]> = {
"1": [
{ id: "m1", text: "Chào chị Nguyễn Thị Huyền Trân, chị hãy inbox để trao đổi trực tiếp nhé", fromMe: true, time: new Date().toISOString() },
{ id: "m2", text: "hi", fromMe: false, time: new Date().toISOString() },
{ id: "m3", text: "Dạ cho em xin số điện thoại người nhận hàng luôn ạ.", fromMe: true, time: new Date().toISOString() },
],
"2": [{ id: "m21", text: "Xin chào (Zalo)", fromMe: false, time: new Date().toISOString() }],
"3": [],
};

export default function ShadcnChatDashboard() {
  const [contacts, setContacts] = useState<Contact[]>(mockContacts);
  const [selected, setSelected] = useState<Contact | null>(mockContacts[0] ?? null);
  const [messages, setMessages] = useState<Record<string, Message[]>>(mockMessagesMap);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Platform | "all">("all");

  const filtered = useMemo(() => {
    return contacts
      .filter((c) => (filter === "all" ? true : c.platform === filter))
      .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
  }, [contacts, search, filter]);

  useEffect(() => {
    const t = setInterval(() => {
      const id = selected?.id || contacts[0]?.id;
      if (!id) return;
      const newMsg: Message = {
        id: Date.now().toString(),
        text: "Tin nhắn thử (auto)",
        fromMe: false,
        time: new Date().toISOString(),
      };
      setMessages((m) => ({ ...m, [id]: [...(m[id] || []), newMsg] }));
    }, 20000);
    return () => clearInterval(t);
  }, [selected, contacts]);

  const sendMessage = async () => {
    if (!input.trim() || !selected) return;
    const msg: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      fromMe: true,
      time: new Date().toISOString(),
    };
    setMessages((m) => ({ ...m, [selected.id]: [...(m[selected.id] || []), msg] }));
    setInput("");

    // TODO: call your Next.js API: /api/send with { platform, recipientId, message }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 py-6">
      <div className="max-w-[1400px] mx-auto px-4 grid grid-cols-[340px_1fr_360px] gap-6">
        {/* LEFT */}
        <Card className="h-[82vh] flex flex-col">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-sm">Hộp thư</CardTitle>
            <div className="flex items-center gap-2">
              <Select onValueChange={(v) => setFilter(v as Platform | "all")} defaultValue="all">
                <SelectTrigger className="h-8 w-28">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
              </Select>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm khách..."
                className=" h-8"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-hidden flex-1 flex flex-col">
            <div className="overflow-auto flex-1 p-2 space-y-2">
              {filtered.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className={`w-full text-left rounded-lg p-2 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition ${
                    selected?.id === c.id ? "ring-2 ring-sky-200 dark:ring-sky-700 bg-slate-50 dark:bg-slate-800" : ""
                  }`}
                >
                  <Avatar>
                    <AvatarFallback>{c.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <div className="truncate font-medium">{c.name}</div>
                      <div className="text-xs text-muted-foreground">{c.lastTime}</div>
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{c.preview}</div>
                  </div>
                  <div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      c.platform === "facebook" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"
                    }`}>
                      {c.platform === "facebook" ? "FB" : "Zalo"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
            <div className="p-3 border-t" />
            <div className="p-3 text-xs text-muted-foreground">Đang online: {contacts.length}</div>
          </CardContent>
        </Card>

        {/* CENTER */}
        <Card className="h-[82vh] flex flex-col">
          <CardHeader className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>{selected?.avatar}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold">{selected?.name}</div>
                <div className="text-xs text-muted-foreground">{selected?.subtitle} • <span className="uppercase text-[11px]">{selected?.platform}</span></div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm"><MessageSquare /></Button>
              <Button variant="ghost" size="sm"><MoreHorizontal /></Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 p-4 overflow-auto" id="chat-scroll">
            <div className="flex flex-col gap-4">
              {(messages[selected?.id || contacts[0].id] || []).map((m) => (
                <div key={m.id} className={`flex ${m.fromMe ? "justify-end" : "justify-start"}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`max-w-[72%] p-3 rounded-2xl ${
                      m.fromMe
                        ? "bg-gradient-to-br from-sky-600 to-sky-500 text-white rounded-br-none"
                        : selected?.platform === "facebook"
                        ? "bg-blue-50 text-slate-900 rounded-bl-none"
                        : "bg-emerald-50 text-slate-900 rounded-bl-none"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{m.text}</div>
                    <div className="text-[11px] opacity-60 mt-1 text-right">{new Date(m.time).toLocaleTimeString()}</div>
                  </motion.div>
                </div>
              ))}
            </div>
          </CardContent>

          <div className="p-4 border-t flex items-center gap-3">
            <Button variant="ghost" size="icon"><Paperclip /></Button>
            <Button variant="ghost" size="icon"><Smile /></Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Nhập nội dung tin nhắn (Enter để gửi)"
              className="flex-1 h-10"
            />
            <Button onClick={sendMessage}><Send className="mr-2" />Gửi</Button>
          </div>
        </Card>

        {/* RIGHT */}
        <Card className="h-[82vh] flex flex-col">
          <CardHeader>
            <CardTitle className="text-sm">Thông tin khách hàng</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>{selected?.avatar}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold">{selected?.name}</div>
                <div className="text-xs text-muted-foreground">{selected?.phone || "Chưa có số"}</div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Nền tảng</Label>
              <div className="text-sm font-medium">{selected?.platform === "facebook" ? "Facebook" : "Zalo"}</div>

              <Label>Email</Label>
              <Input placeholder="email@khach.com" />

              <Label>Địa chỉ</Label>
              <Input placeholder="Nhập địa chỉ" />

              <Label>Ghi chú</Label>
              <Textarea className="h-24" />

              <Label>Trạng thái</Label>
              <Select>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
              </Select>
              <Button>Lưu</Button>
            </div>

            <div className="mt-auto text-xs text-muted-foreground">ID nền tảng: <code className="font-mono">{selected?.platformId}</code></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
