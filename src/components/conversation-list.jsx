import React, {
  useState,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  Box,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Divider,
  Avatar,
  useTheme,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import {
  Search,
  Chat as ChatIcon,
  Description,
  EventNote,
  InsertDriveFile,
  VideoLibrary,
  Mic,
  MoreVert,
  Edit,
  Delete,
  Check,
  Close,
} from "@mui/icons-material";
import { parseDate, scrollbar } from "../utils/utils";

/* ---------- icons for insight types ---------- */
function InsightIcon({ type }) {
  const size = "small";
  if (!type) return <InsertDriveFile fontSize={size} />;
  const t = String(type).toLowerCase();
  if (t.includes("meet")) return <EventNote fontSize={size} />;
  if (t.includes("doc")) return <Description fontSize={size} />;
  if (t.includes("record")) return <VideoLibrary fontSize={size} />;
  if (t.includes("transcript") || t.includes("audio"))
    return <Mic fontSize={size} />;
  return <InsertDriveFile fontSize={size} />;
}

const ConversationList = forwardRef(function ConversationList(
  {
    onOpenChat,
    defaultTab = "chats",
    chats = [],
    insights = [],
    onRenameChat,
    onDeleteChat,
  },
  ref
) {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(defaultTab === "insights" ? 1 : 0);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState({ tab: null, id: null });

  // inline rename state
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  // menu + delete confirm
  const [menuEl, setMenuEl] = useState(null);
  const [menuForId, setMenuForId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const isChats = activeTab === 0;
  const visibleChats = useMemo(
    () => chats.filter((c) => (c.messageCount ?? 0) > 0),
    [chats]
  );
  const data = isChats ? visibleChats : insights;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter((item) => {
      const text = [item.title, item.summary, item.lastMessage]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return text.includes(q);
    });
  }, [search, data]);

  useImperativeHandle(ref, () => ({
    selectTab: (nameOrIndex) => {
      if (nameOrIndex === "insights" || nameOrIndex === 1) setActiveTab(1);
      else setActiveTab(0);
      // reset transient UI
      setEditingId(null);
      setMenuEl(null);
      setMenuForId(null);
      setConfirmDeleteId(null);
    },
    getLatestInsight: () => {
      const latest = [...insights].sort(
        (a, b) => parseDate(b.updatedAt) - parseDate(a.updatedAt)
      )[0];
      return latest;
    },
    setSelected: (tabName, id) => setSelected({ tab: tabName, id }),
    clearSelection: () => setSelected({ tab: null, id: null }),
  }));

  /* ---------- actions ---------- */
  const openMenu = (e, id) => {
    e.stopPropagation();
    setMenuEl(e.currentTarget);
    setMenuForId(id);
  };
  const closeMenu = () => {
    setMenuEl(null);
    setMenuForId(null);
  };

  const startInlineRename = (item) => {
    closeMenu();
    setTimeout(() => {
      setEditingId(item.id);
      setEditValue(item.title || "");
    }, 0);
  };
  const commitInlineRename = () => {
    const v = editValue.trim();
    if (v && editingId) onRenameChat?.(editingId, v);
    setEditingId(null);
  };
  const cancelInlineRename = () => {
    setEditingId(null);
  };
  const PRIMARY = !isChats
    ? theme.palette.info.main
    : theme.palette.success.main;

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, v) => {
          setActiveTab(v);
          setSelected({ tab: null, id: null });
          setEditingId(null);
        }}
        variant="fullWidth"
        textColor="inherit"
        TabIndicatorProps={{ style: { display: "none" } }}
        sx={{
          p: 1,
          "& .MuiTab-root": {
            textTransform: "none",
            fontWeight: 600,
            minHeight: 40,
            borderRadius: 999,
            mx: 0.5,
            px: 2,
            bgcolor: theme.palette.mode === "dark" ? "#1C2430" : "#F3F4F6",
            color: theme.palette.text.primary,
            "&:hover": {
              bgcolor: theme.palette.mode === "dark" ? "#222B38" : "#E5E7EB",
            },
          },
          "& .MuiTab-root.Mui-selected:nth-of-type(1)": {
            bgcolor: theme.palette.success.main,
            color: "#fff !important",
          },
          "& .MuiTab-root.Mui-selected:nth-of-type(2)": {
            bgcolor: theme.palette.info.main,
            color: "#fff !important",
          },
        }}
      >
        <Tab label="Chats" />
        <Tab label="Insights" />
      </Tabs>

      {/* Search */}
      <Box sx={{ p: 1.5 }}>
        <TextField
          fullWidth
          size="small"
          placeholder={`Search ${isChats ? "chats" : "insights"}…`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: theme.palette.text.secondary }} />
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 10,
              backgroundColor:
                theme.palette.mode === "dark" ? "#0F1520" : "#FFFFFF",
              "& fieldset": { borderColor: theme.palette.divider },
              "&:hover fieldset": {
                borderColor:
                  theme.palette.mode === "dark" ? "#2B3542" : "#D1D5DB",
              },
              "&.Mui-focused fieldset": {
                borderColor: isChats
                  ? theme.palette.success.main
                  : theme.palette.info.main,
              },
            },
          }}
        />
      </Box>

      {/* List */}
      <List
        dense
        disablePadding
        sx={{ flex: 1, overflowY: "auto", ...scrollbar(theme, PRIMARY) }}
      >
        {filtered.map((item, idx) => {
          const rowSelected =
            (isChats && selected.tab === "chats" && selected.id === item.id) ||
            (!isChats &&
              selected.tab === "insights" &&
              selected.id === item.id);

          const isEditing = editingId === item.id;

          const handleRowClick = () => {
            if (isEditing) return;
            setSelected({ tab: isChats ? "chats" : "insights", id: item.id });
            onOpenChat(
              isChats
                ? { ...item, chatType: "regular" }
                : {
                    id: item.id,
                    title: item.title,
                    timestamp: item.date,
                    chatType: "insight",
                    insightData: item,
                  }
            );
          };

          return (
            <Box key={item.id} sx={{ position: "relative" }}>
              <ListItemButton
                className="row"
                disableRipple
                disableTouchRipple
                onClick={handleRowClick}
                sx={{
                  px: 2,
                  py: 1.25,
                  borderLeft: rowSelected
                    ? `3px solid ${
                        isChats
                          ? theme.palette.success.main
                          : theme.palette.info.main
                      }`
                    : "3px solid transparent",
                  bgcolor: rowSelected
                    ? theme.palette.mode === "dark"
                      ? "#151C25"
                      : "#EFF2F6"
                    : "transparent",
                  boxShadow: rowSelected
                    ? theme.palette.mode === "dark"
                      ? "0 0 0 1px rgba(148,163,184,0.08)"
                      : "inset 0 -1px 0 rgba(0,0,0,0.04)"
                    : "none",
                  "&:hover": {
                    backgroundColor:
                      theme.palette.mode === "dark" ? "#121922" : "#F3F4F6",
                    "& .row-actions": { opacity: 1 },
                  },
                }}
              >
                {/* Leading avatar */}
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    mr: 1.5,
                    ...(isChats
                      ? {
                          bgcolor:
                            theme.palette.mode === "dark"
                              ? "#0B3B2D"
                              : "#ECFDF5",
                          color:
                            theme.palette.mode === "dark"
                              ? "#8EF6C5"
                              : "#065F46",
                        }
                      : {
                          bgcolor:
                            theme.palette.mode === "dark"
                              ? "#0C2B6B"
                              : "#EFF6FF",
                          color:
                            theme.palette.mode === "dark"
                              ? "#99B8FF"
                              : "#075985",
                        }),
                  }}
                >
                  {isChats ? (
                    <ChatIcon fontSize="small" />
                  ) : (
                    <InsightIcon type={item.type} />
                  )}
                </Avatar>

                {/* Title / summary — inline rename for CHATS only */}
                <ListItemText
                  primary={
                    isChats && isEditing ? (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          width: "100%",
                        }}
                      >
                        <TextField
                          autoFocus
                          fullWidth
                          size="small"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              commitInlineRename();
                            }
                            if (e.key === "Escape") {
                              e.preventDefault();
                              cancelInlineRename();
                            }
                          }}
                          onBlur={commitInlineRename}
                          InputProps={{
                            endAdornment: (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.25,
                                  mr: 0.25,
                                }}
                              >
                                <IconButton
                                  size="small"
                                  color="success"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    commitInlineRename();
                                  }}
                                >
                                  <Check fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    cancelInlineRename();
                                  }}
                                >
                                  <Close fontSize="small" />
                                </IconButton>
                              </Box>
                            ),
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              height: 32,
                              borderRadius: 1,
                              pr: 0.75,
                              "& fieldset": {
                                borderColor: theme.palette.divider,
                              },
                              "&.Mui-focused fieldset": {
                                borderColor: theme.palette.success.main,
                              },
                            },
                          }}
                        />
                      </Box>
                    ) : (
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: rowSelected ? 800 : 600 }}
                      >
                        {item.title}
                      </Typography>
                    )
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary">
                      {isChats ? item.lastMessage : item.summary}
                    </Typography>
                  }
                />

                {/* 3-dots actions (Chats only). Hidden until row hover */}
                {isChats && (
                  <IconButton
                    size="small"
                    className="row-actions"
                    onClick={(e) => openMenu(e, item.id)}
                    sx={{
                      ml: 1,
                      opacity: isEditing ? 0 : 0,
                      transition: "opacity 120ms",
                    }}
                  >
                    <MoreVert fontSize="small" />
                  </IconButton>
                )}
              </ListItemButton>

              {idx < filtered.length - 1 && <Divider />}
            </Box>
          );
        })}
      </List>

      {/* Row menu (styled) */}
      <Menu
        anchorEl={menuEl}
        open={Boolean(menuEl)}
        onClose={closeMenu}
        disableRestoreFocus
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          elevation: 0,
          sx: {
            borderRadius: 2,
            boxShadow:
              theme.palette.mode === "dark"
                ? "0 8px 28px rgba(0,0,0,.45), 0 0 0 1px rgba(148,163,184,.15)"
                : "0 8px 28px rgba(16,24,40,.15)",
            overflow: "hidden",
            minWidth: 180,
          },
        }}
      >
        <MenuItem
          onClick={() => {
            const row = filtered.find((x) => x.id === menuForId);
            if (row) startInlineRename(row);
          }}
        >
          <Edit fontSize="small" style={{ marginRight: 10, opacity: 0.9 }} />
          Rename
        </MenuItem>
        <MenuItem
          onClick={() => {
            setConfirmDeleteId(menuForId);
            closeMenu();
          }}
          sx={{ color: "error.main", fontWeight: 600 }}
        >
          <Delete fontSize="small" style={{ marginRight: 10 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Delete confirm dialog */}
      <Dialog
        open={Boolean(confirmDeleteId)}
        onClose={() => setConfirmDeleteId(null)}
      >
        <DialogTitle>Delete this chat?</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            This will permanently delete the chat and its messages. This action
            can’t be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteId(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              const id = confirmDeleteId;
              setConfirmDeleteId(null);
              onDeleteChat?.(id);
              if (editingId === id) setEditingId(null);
              setSelected((sel) =>
                sel?.id === id ? { tab: null, id: null } : sel
              );
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
});

export default ConversationList;
