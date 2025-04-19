"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Send, User, Bot, Plus } from "lucide-react"
import { sendChatMessage, loadChatHistory } from "@/api/chat"
import { addMessage, setActiveChat, startNewChat } from "@/store/slices/chatSlice"
import type { RootState } from "@/store"
import type { ChatMessage } from "@/types/chat"
import { formatDistanceToNow } from "date-fns"

export default function Chat() {
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const dispatch = useDispatch()
  const { activeChat, chats } = useSelector((state: RootState) => state.chat)
  const currentChat = chats.find((chat) => chat.id === activeChat)

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const history = await loadChatHistory()
        if (history.length > 0) {
          // Set the most recent chat as active
          dispatch(setActiveChat(history[0].id))
        } else {
          // Create a new chat if there's no history
          handleNewChat()
        }
      } catch (error) {
        console.error("Failed to load chat history:", error)
      }
    }

    fetchChatHistory()
  }, [dispatch])

  useEffect(() => {
    scrollToBottom()
  }, [currentChat?.messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!message.trim() || isLoading || !activeChat) return

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      content: message,
      role: "user",
      timestamp: new Date().toISOString(),
    }

    dispatch(addMessage({ chatId: activeChat, message: userMessage }))
    setMessage("")
    setIsLoading(true)

    try {
      const response = await sendChatMessage(activeChat, message)

      const aiMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        content: response.content,
        role: "assistant",
        timestamp: new Date().toISOString(),
      }

      dispatch(addMessage({ chatId: activeChat, message: aiMessage }))
    } catch (error) {
      console.error("Failed to send message:", error)
      // Add error message to chat
      const errorMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        content: "Sorry, there was an error processing your request. Please try again.",
        role: "system",
        timestamp: new Date().toISOString(),
      }

      dispatch(addMessage({ chatId: activeChat, message: errorMessage }))
    } finally {
      setIsLoading(false)
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }

  const handleNewChat = () => {
    const newChatId = `chat-${Date.now()}`
    dispatch(startNewChat({ id: newChatId, title: "New Chat", messages: [] }))
    dispatch(setActiveChat(newChatId))
  }

  const handleChatSelect = (chatId: string) => {
    dispatch(setActiveChat(chatId))
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-2xl font-bold mb-6">AI Chat Assistant</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <div className="flex flex-col h-full">
            <Button onClick={handleNewChat} className="mb-4 flex items-center">
              <Plus className="mr-2 h-4 w-4" /> New Chat
            </Button>

            <Card className="flex-1">
              <CardContent className="p-2">
                <ScrollArea className="h-[500px]">
                  {chats.length > 0 ? (
                    <div className="space-y-2 p-2">
                      {chats.map((chat) => (
                        <Button
                          key={chat.id}
                          variant={chat.id === activeChat ? "default" : "ghost"}
                          className="w-full justify-start text-left"
                          onClick={() => handleChatSelect(chat.id)}
                        >
                          <div className="truncate">{chat.title || "New Chat"}</div>
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">No chat history</div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="md:col-span-3">
          <Card className="h-full flex flex-col">
            <CardContent className="flex-1 p-0">
              <div className="flex flex-col h-[600px]">
                <ScrollArea className="flex-1 p-4">
                  {currentChat ? (
                    currentChat.messages.length > 0 ? (
                      <div className="space-y-4">
                        {currentChat.messages.map((msg) => (
                          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                            <div
                              className={`max-w-[80%] rounded-lg p-4 ${
                                msg.role === "user"
                                  ? "bg-primary text-primary-foreground"
                                  : msg.role === "assistant"
                                    ? "bg-muted"
                                    : "bg-destructive/10"
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                {msg.role === "user" ? (
                                  <User className="h-4 w-4" />
                                ) : msg.role === "assistant" ? (
                                  <Bot className="h-4 w-4" />
                                ) : (
                                  <span className="h-4 w-4" />
                                )}
                                <span className="text-xs opacity-70">
                                  {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                                </span>
                              </div>
                              <div className="whitespace-pre-wrap">{msg.content}</div>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <div className="text-center">
                          <Bot className="h-12 w-12 mx-auto mb-4 opacity-20" />
                          <h3 className="text-lg font-medium">How can I help you today?</h3>
                          <p className="text-muted-foreground">Ask me anything and I'll do my best to assist you.</p>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="space-y-4">
                      <Skeleton className="h-16 w-[70%]" />
                      <Skeleton className="h-16 w-[50%] ml-auto" />
                      <Skeleton className="h-16 w-[60%]" />
                      <Skeleton className="h-16 w-[40%] ml-auto" />
                    </div>
                  )}
                </ScrollArea>

                <div className="p-4 border-t">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      ref={inputRef}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message..."
                      disabled={isLoading || !activeChat}
                      className="flex-1"
                    />
                    <Button type="submit" disabled={isLoading || !message.trim() || !activeChat}>
                      {isLoading ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                      <span className="sr-only">Send</span>
                    </Button>
                  </form>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
