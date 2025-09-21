import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  Fragment,
} from "react";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Paper,
  Avatar,
  Chip,
  Divider,
  Fade,
  useTheme,
  Tooltip,
  Button,
} from "@mui/material";
import {
  ArrowBack,
  Send,
  SmartToy,
  Person,
  FiberManualRecord,
} from "@mui/icons-material";
import ThinkingIndicator from "./thinking-indicator";
import {
  genId,
  CHAT_SUGGESTIONS,
  headerLabel,
  messageLabel,
  scrollbar,
  formatDate,
  formatTime,
} from "../utils/utils";

/* chips for docs */
function DocChip({ doc, inverted = false }) {
  const theme = useTheme();
  return (
    <Chip
      label={doc.name}
      variant={inverted ? "filled" : "outlined"}
      size="small"
      sx={
        inverted
          ? {
              bgcolor: "rgba(255,255,255,0.12)",
              color: "#fff",
              "& .MuiChip-label": { px: 1 },
            }
          : {
              borderColor: theme.palette.divider,
              color: theme.palette.text.secondary,
              bgcolor: "transparent",
              "& .MuiChip-label": { px: 1 },
            }
      }
    />
  );
}

function DateDivider({ label }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, my: 1.5 }}>
      <Divider sx={{ flex: 1 }} />
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ whiteSpace: "nowrap" }}
      >
        {label}
      </Typography>
      <Divider sx={{ flex: 1 }} />
    </Box>
  );
}

function MessageBubble({ m, isInsight }) {
  const theme = useTheme();
  const isUser = m.type === "user";

  const PRIMARY = isInsight
    ? theme.palette.info.main
    : theme.palette.success.main;
  const AI_SURFACE = theme.palette.mode === "dark" ? "#0F1520" : "#FFFFFF";
  const AI_BORDER = isInsight
    ? theme.palette.mode === "dark"
      ? "#243A6B"
      : "#BFDBFE"
    : theme.palette.mode === "dark"
    ? "#1D4A3C"
    : "#BBF7D0";

  return (
    <Fade in>
      <Box
        sx={{
          position: "relative",
          display: "flex",
          gap: 1.5,
          justifyContent: isUser ? "flex-end" : "flex-start",
        }}
      >
        {!isUser && (
          <Avatar
            sx={{ bgcolor: PRIMARY, color: "#fff", width: 32, height: 32 }}
          >
            <SmartToy sx={{ fontSize: 18 }} />
          </Avatar>
        )}

        <Box
          sx={{
            maxWidth: "72%",
            px: 2.5,
            py: 2,
            borderRadius: 3,
            boxShadow:
              theme.palette.mode === "dark"
                ? "0 0 0 1px rgba(148,163,184,0.08)"
                : "0 2px 8px rgba(17,24,39,0.06)",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            bgcolor: isUser ? PRIMARY : AI_SURFACE,
            color: isUser ? "#fff" : theme.palette.text.primary,
            border: isUser ? "none" : `1px solid ${AI_BORDER}`,
          }}
        >
          <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
            {m.content}
          </Typography>

          {!!m.docs?.length && (
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1.25 }}>
              {m.docs.map((d) => (
                <DocChip key={d.id} doc={d} inverted={isUser} />
              ))}
            </Box>
          )}
        </Box>

        {isUser && (
          <Avatar
            sx={{ bgcolor: "#111827", color: "#fff", width: 32, height: 32 }}
          >
            <Person sx={{ fontSize: 18 }} />
          </Avatar>
        )}
      </Box>
    </Fade>
  );
}

function FollowUpChips({ items = [], onPick, isInsight }) {
  const theme = useTheme();
  const tone = isInsight ? theme.palette.info.main : theme.palette.success.main;

  return (
    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
      {items.map((q) => (
        <Chip
          key={q}
          label={q}
          onClick={() => onPick(q)}
          size="small"
          clickable
          sx={{
            borderRadius: 999,
            px: 0.75,
            fontWeight: 500,
            bgcolor: theme.palette.mode === "dark" ? "#111A25" : "#F3F4F6",
            color: theme.palette.text.primary,
            border: `1px solid ${tone}`,
            "&:hover": {
              bgcolor: theme.palette.mode === "dark" ? "#152130" : "#EEF2F6",
            },
            "& .MuiChip-label": { px: 1 },
          }}
          variant="outlined"
        />
      ))}
    </Box>
  );
}

export default function ChatWindow({
  chat,
  messages = [],
  onAddMessage,
  onCreateChat,
  onBack,
  embedded = false,
  starterMessage,
}) {
  const theme = useTheme();
  const [inputValue, setInputValue] = useState(starterMessage || "");
  const [isThinking, setIsThinking] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const messagesEndRef = useRef(null);

  // keep relative labels fresh
  useEffect(() => {
    const idTimer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(idTimer);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const lastAiMessageId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i]?.type === "ai") return messages[i].id;
    }
    return null;
  }, [messages]);

  const isInsight = chat.chatType === "insight";
  const PRIMARY = isInsight
    ? theme.palette.info.main
    : theme.palette.success.main;

  const sendMessage = useCallback(
    (text) => {
      const content = (typeof text === "string" ? text : inputValue).trim();
      if (!content) return;

      const userMsg = {
        id: genId("m"),
        type: "user",
        content,
        createdAt: new Date().toISOString(),
      };
      onAddMessage?.(userMsg);
      if (typeof text !== "string") setInputValue("");
      setIsThinking(true);

      // mock AI reply; swap out with real service later
      setTimeout(() => {
        const aiMsg = {
          id: genId("m"),
          type: "ai",
          content: "Here’s a structured response with insights and links.",
          createdAt: new Date().toISOString(),
          docs: [{ id: genId("doc"), name: "Summary.pdf", kind: "PDF" }],
          followUps: isInsight
            ? ["Show decisions", "Who decided what?", "Attach minutes"]
            : ["Summarize latest docs", "Show related files", "Draft an email"],
        };
        onAddMessage?.(aiMsg);
        setIsThinking(false);
      }, 800);
    },
    [inputValue, isInsight, onAddMessage]
  );

  const onKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  // suggestion bar logic
  const isNewChat = messages.length === 0 && !isInsight;
  const isEmptyChat = chat.chatType === "regular" && messages.length === 0;

  // group messages by day
  const sections = useMemo(() => {
    if (!messages.length) return [];
    const out = [];
    let currentKey = null;
    messages.forEach((m) => {
      const d = m.createdAt ? new Date(m.createdAt) : new Date();
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (key !== currentKey) {
        out.push({ header: headerLabel(d, now), items: [] });
        currentKey = key;
      }
      out[out.length - 1].items.push({ ...m, _d: d });
    });
    return out;
  }, [messages, now]);

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Paper
        variant="outlined"
        sx={{
          px: 2,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          borderRadius: 0,
        }}
      >
        {!embedded && (
          <IconButton onClick={onBack} size="small">
            <ArrowBack />
          </IconButton>
        )}

        <FiberManualRecord fontSize="small" sx={{ color: PRIMARY, mr: 0.25 }} />

        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {chat.title}
        </Typography>

        {!isEmptyChat && (
          <Button
            onClick={onCreateChat}
            variant="contained"
            sx={{
              bgcolor: theme.palette.success.main,
              color: "#fff",
              px: 2,
              borderRadius: 2,
              "&:hover": { bgcolor: "#059669" },
            }}
          >
            New Chat
          </Button>
        )}
      </Paper>

      {/* Suggestions — only for brand-new Chat */}
      {isNewChat && (
        <Box
          sx={{
            px: 2,
            py: 1,
            borderBottom: (t) => `1px solid ${t.palette.divider}`,
            bgcolor: (t) => (t.palette.mode === "dark" ? "#0F1520" : "#F8FAFC"),
            display: "flex",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          {CHAT_SUGGESTIONS.map((s) => (
            <Chip
              key={s}
              label={s}
              onClick={() => sendMessage(s)}
              size="small"
              clickable
              sx={(t) => ({
                borderRadius: 999,
                px: 0.75,
                fontWeight: 500,
                bgcolor: t.palette.mode === "dark" ? "#111A25" : "#F3F4F6",
                color: t.palette.text.primary,
                border: `1px solid ${t.palette.divider}`,
                cursor: "pointer",
                transition:
                  "background-color 120ms ease, border-color 120ms ease, box-shadow 120ms ease, transform 60ms ease",
                "&:hover": {
                  bgcolor: t.palette.mode === "dark" ? "#152130" : "#EEF2F6",
                  borderColor:
                    t.palette.mode === "dark" ? "#304050" : "#D1D5DB",
                  boxShadow:
                    t.palette.mode === "dark"
                      ? "0 0 0 1px rgba(148,163,184,0.18)"
                      : "0 1px 2px rgba(16,24,40,0.06)",
                },
                "&:active": {
                  transform: "translateY(1px) scale(0.98)",
                  boxShadow:
                    t.palette.mode === "dark"
                      ? "inset 0 1px 0 rgba(0,0,0,0.25)"
                      : "inset 0 1px 0 rgba(0,0,0,0.08)",
                },
                "&.Mui-focusVisible": {
                  outline: "none",
                  boxShadow: `0 0 0 2px ${t.palette.background.paper}, 0 0 0 4px ${t.palette.success.main}`,
                },
                "& .MuiChip-label": { px: 1 },
              })}
            />
          ))}
        </Box>
      )}

      {/* Messages */}
      <Box
        sx={{
          flex: 1,
          p: 2,
          overflowY: "auto",
          bgcolor: theme.palette.mode === "dark" ? "#0B0F14" : "#F6F7F9",
          minHeight: 0,
          ...scrollbar(theme, PRIMARY),
        }}
      >
        {sections.map((section) => (
          <Box key={section.header} sx={{ mb: 1.5 }}>
            <DateDivider label={section.header} />
            {section.items.map((m) => {
              const label = messageLabel(m._d, now);
              const hoverTitle = `${formatDate(m._d)} · ${formatTime(m._d)}`;
              const isUser = m.type === "user";
              return (
                <Fragment key={m.id}>
                  <Box sx={{ mb: 2 }}>
                    <MessageBubble m={m} isInsight={isInsight} />
                    {/* Follow-ups from data (AI messages only) */}
                    {m.type === "ai" &&
                      m.id === lastAiMessageId &&
                      Array.isArray(m.followUps) &&
                      m.followUps.length > 0 && (
                        <Box
                          sx={{
                            mt: 1,
                            display: "flex",
                            justifyContent: "flex-start",
                            px: 6,
                          }}
                        >
                          <FollowUpChips
                            items={m.followUps}
                            onPick={(text) => sendMessage(text)}
                            isInsight={isInsight}
                          />
                        </Box>
                      )}
                    <Box
                      sx={{
                        mt: 0.5,
                        display: "flex",
                        justifyContent: isUser ? "flex-end" : "flex-start",
                        px: 6,
                      }}
                    >
                      <Tooltip
                        title={hoverTitle}
                        arrow
                        placement={isUser ? "left" : "right"}
                      >
                        <Typography variant="caption" color="text.secondary">
                          {label}
                        </Typography>
                      </Tooltip>
                    </Box>
                  </Box>
                </Fragment>
              );
            })}
          </Box>
        ))}

        {isThinking && (
          <Box sx={{ display: "flex", gap: 1.5, mt: 1 }}>
            <Avatar
              sx={{ bgcolor: PRIMARY, color: "#fff", width: 32, height: 32 }}
            >
              <SmartToy sx={{ fontSize: 18 }} />
            </Avatar>
            <Box
              sx={{
                bgcolor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                px: 2,
                py: 1,
                borderRadius: 3,
              }}
            >
              <ThinkingIndicator variant={isInsight ? "insight" : "chat"} />
            </Box>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Composer */}
      <Paper variant="outlined" sx={{ px: 1.5, py: 1, borderRadius: 0 }}>
        <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1 }}>
          <TextField
            fullWidth
            multiline
            maxRows={6}
            placeholder={
              isInsight ? "Ask about this insight…" : "Ask anything here…"
            }
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={onKeyDown}
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor:
                  theme.palette.mode === "dark" ? "#0F1520" : "#FFFFFF",
                "& fieldset": { borderColor: theme.palette.divider },
                "&:hover fieldset": {
                  borderColor:
                    theme.palette.mode === "dark" ? "#2B3542" : "#D1D5DB",
                },
                "&.Mui-focused fieldset": { borderColor: PRIMARY },
              },
            }}
          />
          <IconButton
            onClick={() => sendMessage()}
            disabled={!inputValue.trim() || isThinking}
            sx={{
              bgcolor: PRIMARY,
              color: "white",
              "&:hover": { bgcolor: isInsight ? "#1D4ED8" : "#059669" },
              "&:disabled": { bgcolor: "#2E3846", color: "#9CA3AF" },
            }}
          >
            <Send sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
}
