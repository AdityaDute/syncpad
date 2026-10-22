import "./App.css"
import { Editor } from "@monaco-editor/react"
import { MonacoBinding } from "y-monaco"
import { useRef, useMemo, useState, useEffect } from "react"
import * as Y from "yjs"
import { SocketIOProvider } from "y-socket.io"

function App() {

  const editorRef = useRef(null)
  const [ username, setUsername ] = useState(() => {
    return new URLSearchParams(window.location.search).get("username") || ""
  })
  const [ users, setUsers ] = useState([])
  const [ connectionStatus, setConnectionStatus ] = useState(
    username ? "connecting" : "disconnected",
  )

  const ydoc = useMemo(() => new Y.Doc(), [])
  const yText = useMemo(() => ydoc.getText("monaco"), [ ydoc ])


  const handleMount = (editor) => {
    editorRef.current = editor

    new MonacoBinding(
      yText,
      editorRef.current.getModel(),
      new Set([ editorRef.current ]),
    )
  }




  const handleJoin = (e) => {
    e.preventDefault()
    setUsername(e.target.username.value)
    setConnectionStatus("connecting")
    window.history.pushState({}, "", "?username=" + e.target.username.value)
  }

  useEffect(() => {
    if (username) {
      const socketUrl = import.meta.env.VITE_SOCKET_URL
        || `${window.location.protocol}//${window.location.hostname}:3000`
      const provider = new SocketIOProvider(socketUrl, "monaco", ydoc, {
        autoConnect: false,
      })

      const handleAwarenessChange = () => {
        const states = Array.from(provider.awareness.getStates().values())
        setUsers(states.filter(state => state.user && state.user.username).map(state => state.user))
      }
      const handleConnect = () => setConnectionStatus("connected")
      const handleDisconnect = () => setConnectionStatus("disconnected")
      const handleConnectError = (error) => {
        console.error("Collaboration connection failed:", error.message)
        setConnectionStatus("error")
      }

      provider.awareness.on("change", handleAwarenessChange)
      provider.socket.on("connect", handleConnect)
      provider.socket.on("disconnect", handleDisconnect)
      provider.socket.on("connect_error", handleConnectError)
      provider.awareness.setLocalStateField("user", { username })
      provider.connect()

      function handleBeforeUnload() {
        provider.awareness.setLocalStateField("user", null)
      }

      window.addEventListener("beforeunload", handleBeforeUnload)


      return () => {
        provider.awareness.off("change", handleAwarenessChange)
        provider.socket.off("connect", handleConnect)
        provider.socket.off("disconnect", handleDisconnect)
        provider.socket.off("connect_error", handleConnectError)
        provider.destroy()
        window.removeEventListener("beforeunload", handleBeforeUnload)
      }
    }
  }, [ username, ydoc ])

  if (!username) {
    return (
      <main className="h-screen w-full bg-gray-950 flex gap-4 p-4 items-center justify-center" >
        <form
          onSubmit={handleJoin}
          className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Enter your username"
            className="p-2 rounded-lg bg-gray-800 text-white"
            name="username"
          />
          <button
            className="p-2 rounded-lg bg-amber-50 text-gray-950 font-bold"
          >
            Join
          </button>
        </form>
      </main>
    )
  }

  return (
    <main
      className="h-screen w-full bg-gray-950 flex gap-4 p-4"
    >
      <aside
        className="flex h-full w-1/4 flex-col overflow-hidden rounded-2xl border border-white/10 bg-gray-900 text-white shadow-xl"
      >
        <header className="border-b border-white/10 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Workspace</p>
              <h2 className="mt-1 text-xl font-bold tracking-tight">Collaborators</h2>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-gray-300">
              {users.length}
            </span>
          </div>
          <p
            className={`mt-4 flex items-center gap-2 text-xs font-medium ${
              connectionStatus === "connected"
                ? "text-emerald-400"
                : connectionStatus === "error"
                  ? "text-rose-400"
                  : "text-amber-300"
            }`}
            role="status"
          >
            <span className="relative flex h-2 w-2">
              {connectionStatus === "connected" && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
              )}
              <span className={`relative inline-flex h-2 w-2 rounded-full ${
                connectionStatus === "connected"
                  ? "bg-emerald-400"
                  : connectionStatus === "error"
                    ? "bg-rose-400"
                    : "bg-amber-300"
              }`} />
            </span>
            {connectionStatus === "connected"
              ? "Live collaboration"
              : connectionStatus === "error"
                ? "Connection error"
                : "Connecting"}
          </p>
        </header>
        <div className="flex items-center justify-between px-5 pb-2 pt-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">People here</h3>
          <span className="text-xs text-gray-500">{users.length} online</span>
        </div>
        <ul className="flex-1 space-y-2 overflow-y-auto px-3 pb-4">
          {users.length > 0 ? users.map((user, index) => {
            const avatarColors = [
              "bg-violet-500/20 text-violet-200",
              "bg-sky-500/20 text-sky-200",
              "bg-rose-500/20 text-rose-200",
              "bg-amber-500/20 text-amber-200",
              "bg-teal-500/20 text-teal-200",
            ]
            const initials = user.username.trim().slice(0, 2).toUpperCase()

            return (
              <li
                key={`${user.username}-${index}`}
                className="flex items-center gap-3 rounded-xl border border-transparent px-3 py-3 transition-colors hover:border-white/10 hover:bg-white/5"
              >
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${avatarColors[index % avatarColors.length]}`}>
                  {initials || "?"}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-100">
                  {user.username}
                  {user.username === username && (
                    <span className="ml-2 text-xs font-normal text-gray-500">you</span>
                  )}
                </span>
                <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400" aria-label="Online" />
              </li>
            )
          }) : (
            <li className="mx-2 mt-2 rounded-xl border border-dashed border-white/10 px-4 py-6 text-center">
              <p className="text-sm font-medium text-gray-300">No collaborators yet</p>
              <p className="mt-1 text-xs leading-relaxed text-gray-500">Others will appear here when they join.</p>
            </li>
          )}
        </ul>
      </aside>
      <section
        className="w-3/4 bg-neutral-800 rounded-lg overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          defaultValue="// some comment"
          theme="vs-dark"
          onMount={handleMount}
        />
      </section>

    </main>
  )
}

export default App