import { useEffect, useState } from "react"
import { emails } from "./data/emails"

type Email = {
  id: number
  sender: string
  subject: string
  preview: string
  time: string
  category: string
  priority: string
  unread: boolean
  aiSummary: string
  suggestedReply: string
}

function App() {
  const [selectedCategory, setSelectedCategory] = useState("Inbox")
  const [search, setSearch] = useState("")
  const [allEmails, setAllEmails] = useState<Email[]>(emails)
  const [selectedEmail, setSelectedEmail] = useState<Email>(emails[0])
  const [showCompose, setShowCompose] = useState(false)
  const [loading, setLoading] = useState(false)

  const [newEmail, setNewEmail] = useState({
    sender: "",
    subject: "",
    preview: "",
  })

  const categories = ["Inbox", "Important", "AI Priority", "Spam", "Sent"]

  const getCount = (category: string) => {
    if (category === "Sent") {
      return allEmails.filter((email) => email.category === "Sent").length
    }

    return allEmails.filter(
      (email) => email.category === category && email.unread
    ).length
  }

  const filteredEmails = allEmails.filter((email) => {
    const matchesCategory = email.category === selectedCategory

    const matchesSearch =
      email.sender.toLowerCase().includes(search.toLowerCase()) ||
      email.subject.toLowerCase().includes(search.toLowerCase()) ||
      email.preview.toLowerCase().includes(search.toLowerCase())

    return matchesCategory && matchesSearch
  })

  useEffect(() => {
    if (selectedEmail && selectedEmail.category !== "Sent") {
      setAllEmails((prevEmails) =>
        prevEmails.map((email) =>
          email.id === selectedEmail.id ? { ...email, unread: false } : email
        )
      )
    }
  }, [selectedEmail])

  const analyzeEmail = async () => {
    setLoading(true)

    try {
      const response = await fetch("http://127.0.0.1:8000/analyze-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: selectedEmail.subject,
          message: selectedEmail.preview,
        }),
      })

      const data = await response.json()

      const updatedEmail = {
        ...selectedEmail,
        category: data.category,
        priority: data.priority,
        aiSummary: data.summary,
        suggestedReply: data.suggested_reply,
      }

      setSelectedEmail(updatedEmail)

      setAllEmails((prevEmails) =>
        prevEmails.map((email) =>
          email.id === selectedEmail.id ? updatedEmail : email
        )
      )

      setSelectedCategory(data.category)
    } catch (error) {
      console.error("AI analysis failed:", error)
      alert("Backend is not running. Start FastAPI first.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen bg-zinc-950 text-white flex">
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 p-6">
        <h1 className="text-2xl font-bold mb-6">SmartMail AI</h1>

        <button
          onClick={() => setShowCompose(true)}
          className="w-full mb-8 bg-blue-600 hover:bg-blue-500 transition py-3 rounded-2xl font-medium"
        >
          + Compose
        </button>

        <nav className="space-y-4">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category)

                const firstEmail = allEmails.find(
                  (email) => email.category === category
                )

                if (firstEmail) {
                  setSelectedEmail(firstEmail)
                }
              }}
              className={`w-full flex justify-between items-center px-4 py-3 rounded-xl transition ${
                selectedCategory === category
                  ? "bg-blue-600 hover:bg-blue-500"
                  : "hover:bg-zinc-800"
              }`}
            >
              <span>{category}</span>

              <span className="bg-white/10 px-2 py-1 rounded-lg text-sm">
                {getCount(category)}
              </span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="h-20 border-b border-zinc-800 flex items-center px-8">
          <input
            type="text"
            placeholder="Search emails..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
          />
        </header>

        <div className="flex flex-1 overflow-hidden">
          <section className="w-96 border-r border-zinc-800 p-6 overflow-y-auto">
            <h2 className="text-xl font-semibold mb-6">{selectedCategory}</h2>

            <div className="space-y-4">
              {filteredEmails.length > 0 ? (
                filteredEmails.map((email) => (
                  <div
                    key={email.id}
                    onClick={() => setSelectedEmail(email)}
                    className={`p-4 rounded-2xl transition cursor-pointer border ${
                      selectedEmail?.id === email.id
                        ? "bg-blue-600/20 border-blue-500"
                        : "bg-zinc-900 border-zinc-800 hover:bg-zinc-800"
                    }`}
                  >
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {email.unread && email.category !== "Sent" && (
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        )}

                        <h3
                          className={
                            email.unread && email.category !== "Sent"
                              ? "font-bold"
                              : "font-medium"
                          }
                        >
                          {email.sender}
                        </h3>
                      </div>

                      <span className="text-sm text-zinc-400">
                        {email.time}
                      </span>
                    </div>

                    <p className="font-medium mb-1">{email.subject}</p>
                    <p className="text-sm text-zinc-400">{email.preview}</p>

                    <div className="flex gap-2 mt-4">
                      <span className="text-xs bg-blue-600/20 text-blue-400 px-2 py-1 rounded-lg">
                        {email.category}
                      </span>

                      <span className="text-xs bg-red-600/20 text-red-400 px-2 py-1 rounded-lg">
                        {email.priority}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-zinc-500">No emails found.</p>
              )}
            </div>
          </section>

          <section className="flex-1 p-8">
            <div className="bg-zinc-900 rounded-3xl p-8 h-full overflow-y-auto">
              {selectedEmail ? (
                <>
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h2 className="text-3xl font-bold mb-2">
                        {selectedEmail.subject}
                      </h2>

                      <p className="text-zinc-400">
                        {selectedEmail.category === "Sent"
                          ? `To: ${selectedEmail.sender}`
                          : `From: ${selectedEmail.sender}`}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <span className="text-xs bg-blue-600/20 text-blue-400 px-3 py-2 rounded-lg">
                        {selectedEmail.category}
                      </span>

                      <span className="text-xs bg-red-600/20 text-red-400 px-3 py-2 rounded-lg">
                        {selectedEmail.priority} Priority
                      </span>
                    </div>
                  </div>

                  <div className="space-y-6 text-zinc-300 leading-relaxed">
                    <p>
                      {selectedEmail.category === "Sent"
                        ? "Sent message:"
                        : "Hello Aya,"}
                    </p>

                    <p>{selectedEmail.preview}</p>

                    <button
                      onClick={analyzeEmail}
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition px-5 py-3 rounded-xl font-medium"
                    >
                      {loading ? "Analyzing..." : "Analyze with AI"}
                    </button>

                    {(selectedEmail.aiSummary ||
                      selectedEmail.suggestedReply) && (
                      <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-5 space-y-4">
                        <div>
                          <h3 className="text-blue-400 font-semibold mb-2">
                            AI Summary
                          </h3>
                          <p>{selectedEmail.aiSummary}</p>
                        </div>

                        <div>
                          <h3 className="text-blue-400 font-semibold mb-2">
                            Suggested Reply
                          </h3>
                          <p>{selectedEmail.suggestedReply}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-zinc-500">
                  No email selected
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {showCompose && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-zinc-900 w-[600px] rounded-3xl p-8 border border-zinc-800 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">New Email</h2>

              <button
                onClick={() => setShowCompose(false)}
                className="text-zinc-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Recipient"
                value={newEmail.sender}
                onChange={(e) =>
                  setNewEmail({ ...newEmail, sender: e.target.value })
                }
                className="w-full bg-zinc-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="text"
                placeholder="Subject"
                value={newEmail.subject}
                onChange={(e) =>
                  setNewEmail({ ...newEmail, subject: e.target.value })
                }
                className="w-full bg-zinc-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

              <textarea
                placeholder="Message..."
                value={newEmail.preview}
                onChange={(e) =>
                  setNewEmail({ ...newEmail, preview: e.target.value })
                }
                className="w-full h-40 bg-zinc-800 rounded-xl px-4 py-3 outline-none resize-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                onClick={() => {
                  if (
                    !newEmail.sender.trim() ||
                    !newEmail.subject.trim() ||
                    !newEmail.preview.trim()
                  ) {
                    return
                  }

                  const emailToAdd: Email = {
                    id: Date.now(),
                    sender: newEmail.sender,
                    subject: newEmail.subject,
                    preview: newEmail.preview,
                    time: "Now",
                    category: "Sent",
                    priority: "Low",
                    unread: false,
                    aiSummary: "",
                    suggestedReply: "",
                  }

                  setAllEmails([emailToAdd, ...allEmails])
                  setSelectedCategory("Sent")
                  setSelectedEmail(emailToAdd)
                  setShowCompose(false)
                  setNewEmail({
                    sender: "",
                    subject: "",
                    preview: "",
                  })
                }}
                className="bg-blue-600 hover:bg-blue-500 transition px-6 py-3 rounded-xl font-medium"
              >
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App