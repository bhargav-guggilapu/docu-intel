import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useParams,
} from "react-router-dom";
import { Box, Typography, Paper, IconButton, CssBaseline } from "@mui/material";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import { ThemeProvider, createTheme, alpha } from "@mui/material/styles";
import ConversationList from "./components/conversation-list";
import ChatWindow from "./components/chat-window";
import InteractiveEmptyState from "./components/interactive-empty-state";
import { LS_KEY, makeId as id, daysAgo, iso } from "./utils/utils";
import logo from "./logo.png";

/** realistic seed data */
function seedData() {
  const c1 = "chat-q4-strategy";
  const c2 = "chat-vendor-followup";
  const c3 = "chat-revenue-forecast";

  const i1 = "insight-board-q4";
  const i2 = "insight-budget-q4";
  const i3 = "insight-ops-review";

  return {
    chats: [
      {
        id: c1,
        title: "Q4 Strategy",
        lastMessage: "Summarize latest docs",
        updatedAt: iso(daysAgo(0)),
        messageCount: 3,
      },
      {
        id: c2,
        title: "Vendor follow-up",
        lastMessage: "Draft an email",
        updatedAt: iso(daysAgo(1)),
        messageCount: 2,
      },
      {
        id: c3,
        title: "Revenue forecast",
        lastMessage: "Can you project FY numbers?",
        updatedAt: iso(daysAgo(5)),
        messageCount: 4,
      },
    ],
    insights: [
      {
        id: i1,
        title: "Board Meeting – Q4",
        type: "Meeting",
        date: "09/12/2025",
        summary: "Quarterly performance & strategy.",
        updatedAt: iso(daysAgo(0)),
      },
      {
        id: i2,
        title: "Budget Report Q4",
        type: "Document",
        date: "09/08/2025",
        summary: "Detailed budgets & forecasts.",
        updatedAt: iso(daysAgo(3)),
      },
      {
        id: i3,
        title: "Ops Review – August",
        type: "Recording",
        date: "08/28/2025",
        summary: "Operational KPIs and actions.",
        updatedAt: iso(daysAgo(20)),
      },
    ],
    messagesById: {
      [c1]: [
        {
          id: id("m"),
          type: "user",
          content: "Summarize latest docs",
          createdAt: iso(daysAgo(0)),
        },
        {
          id: id("m"),
          type: "ai",
          content:
            "Docs summarized. Revenue +7% QoQ; key risks: churn, infra cost.",
          createdAt: iso(daysAgo(0)),
          docs: [{ id: "DOC-11", name: "Q4-Summary.pdf" }],
          followUps: [
            "Show QoQ chart",
            "List risks by impact",
            "Attach minutes",
          ],
        },
        {
          id: id("m"),
          type: "user",
          content: "List action items by owner",
          createdAt: iso(daysAgo(0)),
        },
      ],
      [c2]: [
        {
          id: id("m"),
          type: "user",
          content: "Draft an email to Acme about SLA",
          createdAt: iso(daysAgo(1)),
        },
        {
          id: id("m"),
          type: "ai",
          content:
            "Drafted. Subject: SLA Clarification for October. Want to send?",
          createdAt: iso(daysAgo(1)),
        },
      ],
      [c3]: [
        {
          id: id("m"),
          type: "ai",
          content: "Hi! What forecast horizon do you need?",
          createdAt: iso(daysAgo(5)),
        },
        {
          id: id("m"),
          type: "user",
          content: "Can you project FY numbers?",
          createdAt: iso(daysAgo(5)),
        },
        {
          id: id("m"),
          type: "ai",
          content: "Projected FY: base 14.8M, best 16.1M, worst 13.6M.",
          createdAt: iso(daysAgo(5)),
        },
        {
          id: id("m"),
          type: "user",
          content: "Break down by region",
          createdAt: iso(daysAgo(4)),
        },
      ],
      [i1]: [
        {
          id: id("m"),
          type: "ai",
          content:
            "Board Meeting recap: approved FY roadmap, cut infra cost by 12%, 5 action items assigned.",
          createdAt: iso(daysAgo(0)),
          docs: [{ id: "DOC-21", name: "Minutes.pdf" }],
          followUps: ["Show decisions", "Who decided what?", "Attach minutes"],
        },
      ],
      [i2]: [
        {
          id: id("m"),
          type: "ai",
          content:
            "Budget Report Q4 highlights: +9% revenue, +4% cost, net +5%.",
          createdAt: iso(daysAgo(3)),
          docs: [{ id: "DOC-22", name: "Budget-Q4.xlsx" }],
        },
      ],
      [i3]: [
        {
          id: id("m"),
          type: "ai",
          content:
            "Ops Review: NPS 54, uptime 99.93%, focus on onboarding speed.",
          createdAt: iso(daysAgo(20)),
        },
      ],
    },
  };
}

const loadStore = () => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore and seed
  }
  return seedData();
};

/** ---------- App Shell: URL-driven, ID-only ---------- */
function AppShell({ threadId }) {
  const [darkMode, setDarkMode] = useState(false);
  const [store, setStore] = useState(loadStore);
  const conversationListRef = useRef(null);
  const navigate = useNavigate();

  // persist
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(store));
  }, [store]);

  // theme
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? "dark" : "light",
          success: { main: "#10B981" }, // chat
          info: { main: "#2563EB" }, // insight
          background: {
            default: darkMode ? "#0B0F14" : "#F7F8FA",
            paper: darkMode ? "#12171F" : "#FFFFFF",
          },
          divider: darkMode ? alpha("#93A1B3", 0.16) : "#E5E7EB",
          text: {
            primary: darkMode ? "#E8EDF2" : "#111827",
            secondary: darkMode ? "#A9B4C2" : "#6B7280",
          },
        },
        shape: { borderRadius: 12 },
        typography: {
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial',
          button: { textTransform: "none", fontWeight: 600 },
          subtitle2: { fontWeight: 600 },
        },
        components: {
          MuiButtonBase: { defaultProps: { disableRipple: true } },
          MuiListItemButton: { defaultProps: { disableTouchRipple: true } },
          MuiTab: { defaultProps: { disableRipple: true } },
          MuiButton: { defaultProps: { disableRipple: true } },
          MuiIconButton: { defaultProps: { disableRipple: true } },
          MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
        },
      }),
    [darkMode]
  );

  /** ---------- Derive selected chat/insight from ID + store ---------- */
  const selectedFromUrl = useMemo(() => {
    if (!threadId) return null;
    const c = store.chats.find((x) => x.id === threadId);
    if (c) return { ...c, chatType: "regular" };
    const i = store.insights.find((x) => x.id === threadId);
    if (i)
      return { id: i.id, title: i.title, chatType: "insight", insightData: i };
    return null;
  }, [threadId, store.chats, store.insights]);

  // keep last non-null to avoid flicker during transitions
  const lastNonNullRef = useRef(null);
  useEffect(() => {
    if (selectedFromUrl) lastNonNullRef.current = selectedFromUrl;
  }, [selectedFromUrl]);

  const activeChat = selectedFromUrl ?? lastNonNullRef.current;
  const messagesForActive = activeChat
    ? store.messagesById[activeChat.id] || []
    : [];

  // sync left list selection based on activeChat (no section in URL anymore)
  useLayoutEffect(() => {
    if (activeChat) {
      const tabName = activeChat.chatType === "insight" ? "insights" : "chats";
      conversationListRef.current?.selectTab(tabName);
      conversationListRef.current?.setSelected?.(tabName, activeChat.id);
    } else {
      conversationListRef.current?.clearSelection?.();
      conversationListRef.current?.selectTab?.("insights");
    }
  }, [activeChat?.id, activeChat?.chatType]);

  const navigateTo = (id) => {
    if (id) navigate(`/${encodeURIComponent(id)}`);
    else navigate(`/home`);
  };

  /* ---------- data actions ---------- */
  const createChat = (title = "New Chat", starterMessage) => {
    const chatId = id("chat");
    const nowIso = iso(new Date());
    const newChat = {
      id: chatId,
      title,
      lastMessage: starterMessage || "",
      updatedAt: nowIso,
      messageCount: starterMessage ? 1 : 0,
    };

    setStore((s) => ({
      ...s,
      chats: [newChat, ...s.chats],
      messagesById: {
        ...s.messagesById,
        [chatId]: starterMessage
          ? [
              {
                id: id("m"),
                type: "user",
                content: starterMessage,
                createdAt: nowIso,
              },
            ]
          : [],
      },
    }));

    navigateTo(chatId);
    return chatId;
  };

  const addMessage = (threadId, chatType, message) => {
    setStore((s) => {
      const msgs = (s.messagesById[threadId] || []).concat(message);

      if (chatType === "regular") {
        const chats = s.chats
          .map((c) =>
            c.id === threadId
              ? {
                  ...c,
                  lastMessage: message.content,
                  updatedAt: message.createdAt,
                  messageCount: (c.messageCount || 0) + 1,
                }
              : c
          )
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        return {
          ...s,
          chats,
          messagesById: { ...s.messagesById, [threadId]: msgs },
        };
      }
      return { ...s, messagesById: { ...s.messagesById, [threadId]: msgs } };
    });
  };

  const renameChat = (chatId, newTitle) => {
    setStore((s) => ({
      ...s,
      chats: s.chats.map((c) =>
        c.id === chatId ? { ...c, title: newTitle } : c
      ),
    }));
  };

  const deleteChat = (chatId) => {
    const isOpen = activeChat?.id === chatId;
    setStore((s) => {
      const chats = s.chats.filter((c) => c.id !== chatId);
      const { [chatId]: _removed, ...restMsgs } = s.messagesById;
      return { ...s, chats, messagesById: restMsgs };
    });
    if (isOpen) {
      // ensure no stale selection renders
      lastNonNullRef.current = null;
      conversationListRef.current?.selectTab?.("insights");
      conversationListRef.current?.clearSelection?.();
      navigateTo(null); // go to home
    }
  };

  const openLatestInsight = () => {
    const latest = [...store.insights].sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
    )[0];
    if (latest) navigateTo(latest.id);
  };

  const handleOpenChat = (chatData) => {
    navigateTo(chatData.id);
  };

  // compute default tab for left list
  const leftDefaultTab =
    activeChat?.chatType === "regular" ? "chats" : "insights";

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          background:
            theme.palette.mode === "dark"
              ? `radial-gradient(1200px 600px at -10% -10%, ${alpha(
                  "#1E2630",
                  0.25
                )}, transparent),
                 radial-gradient(900px 400px at 110% 120%, ${alpha(
                   "#1B2430",
                   0.18
                 )}, transparent)`
              : undefined,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 3,
            py: 2,
            borderBottom: (t) => `1px solid ${t.palette.divider}`,
            bgcolor: "background.paper",
          }}
        >
          {/* Left section: Logo + Text */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <img
              src={logo}
              alt="App Logo"
              style={{ width: 40, height: 40, cursor: "pointer" }}
              onClick={() => {
                lastNonNullRef.current = null;
                conversationListRef.current?.clearSelection?.();
                conversationListRef.current?.selectTab?.("insights");
                navigateTo(null); // go to /home
              }}
            />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Executive Intelligence Hub
              </Typography>
              <Typography variant="body2" color="text.secondary">
                AI-powered meeting & document insights
              </Typography>
            </Box>
          </Box>

          {/* Right section: Theme toggle */}
          <IconButton onClick={() => setDarkMode((v) => !v)}>
            {darkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Box>

        {/* Main split */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            p: 2,
            height: "calc(100vh - 64px)",
            overflow: "hidden",
          }}
        >
          {/* Left: List */}
          <Paper
            variant="outlined"
            sx={{
              width: 360,
              minWidth: 300,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <ConversationList
              ref={conversationListRef}
              onOpenChat={handleOpenChat}
              defaultTab={leftDefaultTab}
              chats={store.chats}
              insights={store.insights}
              onRenameChat={renameChat}
              onDeleteChat={deleteChat}
            />
          </Paper>

          {/* Right: Chat or Empty */}
          <Paper
            variant="outlined"
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {activeChat ? (
              <ChatWindow
                chat={activeChat}
                messages={messagesForActive}
                onAddMessage={(msg) =>
                  addMessage(activeChat.id, activeChat.chatType, msg)
                }
                onCreateChat={() => {
                  conversationListRef.current?.selectTab("chats");
                  conversationListRef.current?.clearSelection?.();
                  createChat("New Chat");
                }}
                onBack={() => {
                  // If it's a brand-new regular chat with no messages, purge it
                  if (activeChat?.chatType === "regular") {
                    const msgs = store.messagesById[activeChat.id] || [];
                    if (msgs.length === 0) {
                      setStore((s) => {
                        const chats = s.chats.filter(
                          (c) => c.id !== activeChat.id
                        );
                        const { [activeChat.id]: _rm, ...rest } =
                          s.messagesById;
                        return { ...s, chats, messagesById: rest };
                      });
                    }
                  }
                  // Clear selection so the right side shows InteractiveEmptyState
                  lastNonNullRef.current = null;
                  conversationListRef.current?.selectTab?.("insights");
                  conversationListRef.current?.clearSelection?.();
                  navigateTo(null); // go to home
                }}
                onRenameChat={(title) => renameChat(activeChat.id, title)}
                onDeleteChat={() => deleteChat(activeChat.id)}
              />
            ) : (
              <InteractiveEmptyState
                onStartChat={() => {
                  conversationListRef.current?.selectTab("chats");
                  conversationListRef.current?.clearSelection?.();
                  createChat("New Chat");
                }}
                onBrowseInsights={openLatestInsight}
                onUploadDocs={() => {
                  // hook for uploader
                  console.log("Upload docs clicked");
                }}
              />
            )}
          </Paper>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

/** ---------- Tiny router wrapper so AppShell can read params --------- */
function Routed() {
  const params = useParams();
  const { id } = params ?? {};
  return <AppShell threadId={id} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Routed />} />
        <Route path="/:id" element={<Routed />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
