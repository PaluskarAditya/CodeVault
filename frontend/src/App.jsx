import { Editor } from "@monaco-editor/react";
import { useEffect, useState, useMemo } from "react";
import { nanoid } from "nanoid";
import {
  Save,
  Share2,
  Copy,
  Lock,
  Globe,
  Clock,
  LockIcon,
  XIcon,
  ShieldCheckIcon,
  Menu,
} from "lucide-react";

export default function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = useMemo(() => urlParams.get("id"), []);
  const [isProtected, setIsProtected] = useState(false);
  const [protectModal, setProtectModal] = useState(false);
  const [snipp, setSnipp] = useState({
    uuid: id,
    name: "",
    code: "",
    desc: "",
    visibility: "public",
    expiry: "none",
    lang: "python",
    pass: "",
    confPass: "",
    protect: isProtected ? true : false,
  });
  const [qrUrl, setQrUrl] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Handle missing ID in URL
  useEffect(() => {
    if (!id) {
      const newId = nanoid(8);
      urlParams.set("id", newId);
      window.location.search = urlParams.toString();
    } else {
      setQrUrl(
        `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
          window.location.href
        )}`
      );
    }
  }, [id]);

  // Fetch Snippet if ID exists
  useEffect(() => {
    if (!id) return;
    setIsLoading(true);

    const getSnipp = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/snipp`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              id: id,
            },
          }
        );

        if (!res.ok) return;

        const data = await res.json();
        if (data.success && data.snipp) {
          const { name, description, code, visibility, expiry, lang, isProtected } =
            data.snipp;
          setSnipp((prev) => ({
            ...prev,
            name,
            desc: description,
            code,
            visibility,
            expiry,
            lang,
            protect: isProtected,
          }));
          setIsProtected(isProtected);
        }
      } catch (err) {
        console.error("Error fetching snippet:", err.message);
      } finally {
        setIsLoading(false);
      }
    };

    getSnipp();
  }, [id]);

  // Handle Create / Save
  const handleSnippCreate = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(snipp),
        }
      );

      if (!res.ok) return;

      const data = await res.json();
      if (data.success && data.snip) {
        const { name, desc, code } = data.snip;
        setSnipp((prev) => ({ ...prev, name, desc, code }));
      }
    } catch (err) {
      console.error("Error saving snippet:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${window.location.origin}/view?id=${id}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Password Protection Modal */}
      {protectModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                Password Protection
              </h2>
              <button 
                className="text-gray-500 hover:text-gray-700 transition-colors"
                onClick={() => setProtectModal(false)}
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <p className="text-sm text-gray-600">
                Set a password to protect this snippet.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={snipp.pass}
                    onChange={(e) =>
                      setSnipp((prev) => ({ ...prev, pass: e.target.value }))
                    }
                    placeholder="Enter new password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={snipp.confPass}
                    onChange={(e) =>
                      setSnipp((prev) => ({
                        ...prev,
                        confPass: e.target.value,
                      }))
                    }
                    placeholder="Confirm your password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 flex justify-end gap-3 border-t">
              <button
                onClick={() => setProtectModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsProtected(true);
                  setProtectModal(false);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Save Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-3 px-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <h1 className="text-lg font-bold text-gray-800">
            Code<span className="text-blue-600">Vault</span>
          </h1>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            Beta
          </span>
        </div>
        <div className="flex space-x-2">
          <button
            className="md:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100"
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden md:flex space-x-2">
            <button
              onClick={() => setProtectModal(!snipp.protect && true)}
              className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm text-black bg-gray-200 hover:bg-gray-300"
            >
              {isProtected ? (
                <ShieldCheckIcon className="w-4 h-4" />
              ) : (
                <LockIcon className="w-4 h-4" />
              )}
              <span>{snipp.protect ? "Protected" : "Protect"}</span>
            </button>
            <button
              onClick={handleSnippCreate}
              disabled={isLoading}
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm text-white ${
                isLoading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              <Save className="w-4 h-4" />
              <span>{isLoading ? "Saving..." : "Save"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Editor Panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Language Selector */}
          <div className="bg-gray-100 border-b border-gray-200 px-3 py-2 flex items-center">
            <select
              value={snipp.lang}
              onChange={(e) =>
                setSnipp((prev) => ({ ...prev, lang: e.target.value }))
              }
              className="bg-white border border-gray-300 rounded-md px-3 py-1 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="java">Java</option>
              <option value="csharp">C#</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
            </select>
          </div>

          {/* Editor */}
          <div className="flex-1 overflow-hidden">
            <Editor
              value={snipp.code}
              onChange={(val) => setSnipp((prev) => ({ ...prev, code: val }))}
              className="h-full"
              defaultValue="// Enter your code here"
              language={snipp.lang.toLowerCase()}
              theme="vs-light"
              options={{
                fontFamily: "'Fira Code', monospace",
                fontLigatures: true,
                fontSize: 14,
                wordWrap: "on",
                automaticLayout: true,
                minimap: { enabled: false }, // Disabled on mobile
                padding: { top: 8 },
                scrollBeyondLastLine: false,
                renderWhitespace: "selection",
              }}
            />
          </div>
        </div>

        {/* Mobile Sidebar Toggle Button */}
        {!isMobileSidebarOpen && (
          <button
            className="md:hidden fixed bottom-4 right-4 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
            onClick={() => setIsMobileSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Sidebar - Mobile */}
        {isMobileSidebarOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm">
            <div className="absolute right-0 top-0 bottom-0 w-4/5 max-w-sm bg-white shadow-xl">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">
                  Snippet Details
                </h2>
                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="h-full overflow-y-auto p-4 space-y-4">
                {/* Mobile sidebar content */}
                <MobileSidebarContent 
                  snipp={snipp} 
                  setSnipp={setSnipp}
                  copyToClipboard={copyToClipboard}
                  isCopied={isCopied}
                  qrUrl={qrUrl}
                  setProtectModal={setProtectModal}
                  isProtected={isProtected}
                  handleSnippCreate={handleSnippCreate}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </div>
        )}

        {/* Sidebar - Desktop */}
        <div className="hidden md:flex md:w-80 border-l border-gray-200 bg-white flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Snippet Details
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Desktop sidebar content */}
            <DesktopSidebarContent 
              snipp={snipp} 
              setSnipp={setSnipp}
              copyToClipboard={copyToClipboard}
              isCopied={isCopied}
              qrUrl={qrUrl}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

// Mobile Sidebar Content Component
function MobileSidebarContent({ snipp, setSnipp, copyToClipboard, isCopied, qrUrl, setProtectModal, isProtected, handleSnippCreate, isLoading }) {
  return (
    <>
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          value={snipp.name}
          onChange={(e) => setSnipp((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="My Awesome Snippet"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={snipp.desc}
          onChange={(e) => setSnipp((prev) => ({ ...prev, desc: e.target.value }))}
          placeholder="What does this snippet do?"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Visibility</label>
        <div className="flex space-x-2">
          <button
            onClick={() => setSnipp((prev) => ({ ...prev, visibility: "public" }))}
            className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-md text-sm ${
              snipp.visibility === "public"
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Public</span>
          </button>
          <button
            onClick={() => setSnipp((prev) => ({ ...prev, visibility: "private" }))}
            className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-md text-sm ${
              snipp.visibility === "private"
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Private</span>
          </button>
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Expiration</label>
        <div className="relative">
          <input 
            type="date" 
            value={snipp.expiry} 
            onChange={e => setSnipp({...snipp, expiry: e.target.value})} 
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Share URL</label>
        <div className="flex">
          <input
            type="text"
            readOnly
            value={`${window.location.origin}/view?id=${snipp.uuid}`}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md text-sm truncate bg-gray-50"
          />
          <button
            onClick={copyToClipboard}
            className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-r-md text-sm flex items-center"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
        {isCopied && (
          <p className="text-xs text-green-600">Copied to clipboard!</p>
        )}
      </div>

      {qrUrl && (
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">QR Code</label>
          <div className="p-3 bg-white border border-gray-200 rounded-md flex justify-center">
            <img src={qrUrl} alt="QR Code" className="rounded-md w-32 h-32" />
          </div>
          <p className="text-xs text-gray-500 text-center">
            Scan to open on mobile
          </p>
        </div>
      )}

      <div className="pt-4 space-y-2">
        <button
          onClick={() => setProtectModal(!snipp.protect && true)}
          className="w-full flex items-center justify-center space-x-1 px-4 py-2 rounded-md text-sm text-black bg-gray-200 hover:bg-gray-300"
        >
          {isProtected ? (
            <ShieldCheckIcon className="w-4 h-4" />
          ) : (
            <LockIcon className="w-4 h-4" />
          )}
          <span>{snipp.protect ? "Protected" : "Protect"}</span>
        </button>
        <button
          onClick={handleSnippCreate}
          disabled={isLoading}
          className={`w-full flex items-center justify-center space-x-1 px-4 py-2 rounded-md text-sm text-white ${
            isLoading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          <Save className="w-4 h-4" />
          <span>{isLoading ? "Saving..." : "Save"}</span>
        </button>
      </div>
    </>
  );
}

// Desktop Sidebar Content Component
function DesktopSidebarContent({ snipp, setSnipp, copyToClipboard, isCopied, qrUrl }) {
  return (
    <>
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          value={snipp.name}
          onChange={(e) => setSnipp((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="My Awesome Snippet"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={snipp.desc}
          onChange={(e) => setSnipp((prev) => ({ ...prev, desc: e.target.value }))}
          placeholder="What does this snippet do?"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Visibility</label>
        <div className="flex space-x-2">
          <button
            onClick={() => setSnipp((prev) => ({ ...prev, visibility: "public" }))}
            className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm ${
              snipp.visibility === "public"
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Public</span>
          </button>
          <button
            onClick={() => setSnipp((prev) => ({ ...prev, visibility: "private" }))}
            className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm ${
              snipp.visibility === "private"
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Private</span>
          </button>
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Expiration</label>
        <div className="relative">
          <input 
            type="date" 
            value={snipp.expiry} 
            onChange={e => setSnipp({...snipp, expiry: e.target.value})} 
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Share URL</label>
        <div className="flex">
          <input
            type="text"
            readOnly
            value={`${window.location.origin}/view?id=${snipp.uuid}`}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md text-sm truncate bg-gray-50"
          />
          <button
            onClick={copyToClipboard}
            className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-r-md text-sm flex items-center"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
        {isCopied && (
          <p className="text-xs text-green-600">Copied to clipboard!</p>
        )}
      </div>

      {qrUrl && (
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">QR Code</label>
          <div className="p-3 bg-white border border-gray-200 rounded-md flex justify-center">
            <img src={qrUrl} alt="QR Code" className="rounded-md" />
          </div>
          <p className="text-xs text-gray-500 text-center">
            Scan to open on mobile
          </p>
        </div>
      )}
    </>
  );
}