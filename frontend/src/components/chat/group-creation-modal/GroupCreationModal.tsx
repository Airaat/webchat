import React, {useState, useMemo, useRef, useEffect} from 'react';
import {Modal as MUIModal} from '@mui/material';
import {useChatUIStore} from "../../../store/chatUIStore.ts";
import './styles.css'

interface DirectoryUser {
    id: string;
    name: string;
    color: string;
}

/* ----------------------------- Sample directory ---------------------------- */
const DIRECTORY: DirectoryUser[] = [
    {id: "u1", name: "Amelia Hart", color: "#1976d2"},
    {id: "u2", name: "Benjamin Cole", color: "#7b1fa2"},
    {id: "u3", name: "Clara Weiss", color: "#2e7d32"},
    {id: "u4", name: "Devon Park", color: "#ef6c00"},
    {id: "u5", name: "Elena Russo", color: "#c2185b"},
    {id: "u6", name: "Farouk Idris", color: "#00838f"},
    {id: "u7", name: "Grace Liang", color: "#5d4037"},
    {id: "u8", name: "Hassan Tariq", color: "#455a64"},
    {id: "u9", name: "Iris Nakamura", color: "#6a1b9a"},
    {id: "u10", name: "Jonas Berg", color: "#0277bd"},
    {id: "u11", name: "Kira Sokolova", color: "#ad1457"},
    {id: "u12", name: "Liam O'Connor", color: "#388e3c"},
    {id: "u13", name: "Mei Tanaka", color: "#f57c00"},
    {id: "u14", name: "Noah Schmidt", color: "#1565c0"},
    {id: "u15", name: "Olive Brooks", color: "#8e24aa"},
];

/* ------------------------------- Icons (SVG) ------------------------------- */
interface IconProps {
    size?: number;
}

const SearchIcon = ({size = 20}: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M11 4a7 7 0 1 1-4.95 11.95L3 19l-1.5-1.5 3.05-3.05A7 7 0 0 1 11 4Zm0 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z"
              fill="currentColor"/>
    </svg>
);
const CloseIcon = ({size = 16}: IconProps) => (
    // FIXME: "viewBox 3 0 24 24" is a hack to center icon for MemberChip
    <svg width={size} height={size} viewBox="3 0 24 24" fill="none">
        <path
            d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.59 13.4l-6.3 6.3-1.41-1.41 6.3-6.3-6.3-6.29 1.41-1.42 6.3 6.3 6.29-6.3 1.42 1.42Z"
            fill="currentColor"/>
    </svg>
);
const CheckIcon = ({size = 18}: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="m9 16.2-3.5-3.5L4 14.2 9 19.2 20 8.2l-1.5-1.5L9 16.2Z" fill="currentColor"/>
    </svg>
);
const PeopleIcon = ({size = 18}: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path
            d="M9 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-7 2c-3.3 0-7 1.65-7 4v2h14v-2c0-2.35-3.7-4-7-4Zm7.5 0c-.63 0-1.36.07-2.13.22 1.66.93 2.63 2.18 2.63 3.78v2H22v-2c0-2.35-3.2-4-5.5-4Z"
            fill="currentColor"/>
    </svg>
);
const SpinnerIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" className="spin">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" fill="none" strokeDasharray="14 40"
                strokeLinecap="round"/>
    </svg>
);

/* --------------------------------- Avatar & Chip -------------------------- */
interface AvatarProps {
    user: DirectoryUser;
    size?: number;
}

const Avatar = ({user, size = 36}: AvatarProps) => {
    const initial = user.name.split(" ").map(p => p[0]).slice(0, 2).join("");
    return (
        <div className="avatar" style={{
            width: size, height: size, borderRadius: "50%",
            background: user.color, color: "white",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: size * 0.38, fontWeight: 500, letterSpacing: 0.3,
            flexShrink: 0,
        }}>
            {initial}
        </div>
    );
};

interface MemberChipProps {
    user: DirectoryUser;
    onRemove: (id: string) => void;
}

const MemberChip = ({user, onRemove}: MemberChipProps) => (
    <div className="chip" onClick={() => onRemove(user.id)}>
        <Avatar user={user} size={24}/>
        <span className="chip-label">{user.name}</span>
        <button className="chip-close" aria-label={`Remove ${user.name}`}>
            <CloseIcon size={14}/>
        </button>
    </div>
);

/* -------------------------------- User Row -------------------------------- */
interface UserRowProps {
    user: DirectoryUser;
    added: boolean;
    onAdd: (user: DirectoryUser) => void;
    dense: boolean;
}

const UserRow = ({user, added, onAdd, dense}: UserRowProps) => (
    <button
        className={`user-row ${added ? "is-added" : ""}`}
        onClick={() => !added && onAdd(user)}
        disabled={added}
        style={{padding: dense ? "8px 12px" : "10px 12px"}}
    >
        <Avatar user={user} size={dense ? 32 : 36}/>
        <div className="user-meta">
            <div className="user-name">{user.name}</div>
        </div>
        <div className="user-action">
            {added ? (
                <span className="added-pill"><CheckIcon size={14}/> Already added</span>
            ) : (
                <span className="add-hint">Add</span>
            )}
        </div>
    </button>
);

/* -------------------------------- Skeletons ------------------------------- */
const SkeletonRow = () => (
    <div className="user-row skeleton-row">
        <div className="sk sk-avatar"/>
        <div className="user-meta">
            <div className="sk sk-line w60"/>
            <div className="sk sk-line w80"/>
        </div>
    </div>
);

/* ---------------------------------- Modal --------------------------------- */
export const GroupCreationModal = () => {
    const tweaks = {
        "primary": "#1976d2",
        "density": "comfortable",
        "hideAdded": true,
        "autoFocus": true,
        "background": "scrim"
    };
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [query, setQuery] = useState("");
    const [added, setAdded] = useState<DirectoryUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [shake, setShake] = useState(false);
    const [created, setCreated] = useState(false);
    const [errors, setErrors] = useState<{ name?: string; members?: string }>({});
    const nameRef = useRef<HTMLInputElement | null>(null);

    const open = useChatUIStore((s) => s.groupCreationModalOpen);
    const closeModal = useChatUIStore((s) => s.closeGroupCreationModal);

    // Simulated search latency
    useEffect(() => {
        if (!query) {
            setLoading(false);
            return;
        }
        setLoading(true);
        const t = setTimeout(() => setLoading(false), 380);
        return () => clearTimeout(t);
    }, [query]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return DIRECTORY;
        return DIRECTORY.filter(u =>
                u.name.toLowerCase().includes(q)
            // u.handle.toLowerCase().includes(q) ||
            // u.email.toLowerCase().includes(q)
        );
    }, [query]);

    const addedIds = new Set(added.map(u => u.id));

    const addUser = (user: DirectoryUser) => {
        setAdded(prev => [...prev, user]);
        setErrors(e => ({...e, members: undefined}));
    };
    const removeUser = (id: string) => setAdded(prev => prev.filter(u => u.id !== id));

    const handleCreate = () => {
        const e: { name?: string; members?: string } = {};
        if (!name.trim()) e.name = "Chat name is required";
        if (added.length === 0) e.members = "Add at least one member";
        setErrors(e);
        if (Object.keys(e).length) {
            setShake(true);
            setTimeout(() => setShake(false), 380);
            return;
        }
        setCreated(true);
    };

    const handleCancel = () => {
        setName("");
        setDescription("");
        setAdded([]);
        setQuery("");
        setErrors({});
        setCreated(false);
        closeModal();
    };

    const renderResults = () => {
        if (tweaks.hideAdded) {
            const visible = filtered.filter(u => !addedIds.has(u.id));
            if (loading) return Array.from({length: 4}).map((_, i) => <SkeletonRow key={i}/>);
            if (!visible.length) return <div className="empty-results">No matches.</div>;
            return visible.map(u => (
                <UserRow key={u.id} user={u} added={false} onAdd={addUser} dense={tweaks.density === "compact"}/>
            ));
        }
        if (loading) return Array.from({length: 4}).map((_, i) => <SkeletonRow key={i}/>);
        if (!filtered.length) return <div className="empty-results">No matches.</div>;
        return filtered.map(u => (
            <UserRow key={u.id} user={u} added={addedIds.has(u.id)} onAdd={addUser}
                     dense={tweaks.density === "compact"}/>
        ));
    };

    return (
        <MUIModal
            open={open}
            onClose={handleCancel}
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2,
            }}
        >
            <div
                className={`modal-card ${shake ? "shake" : ""}`}
                style={{"--primary": tweaks.primary, maxWidth: 880, outline: 'none'} as React.CSSProperties}
            >
                {/* header */}
                <header className="modal-head">
                    <div>
                        <h2 className="modal-title">Create group chat</h2>
                        <p className="modal-sub">Name your group, add a description, and invite teammates.</p>
                    </div>
                    <button className="icon-btn" onClick={handleCancel} aria-label="Close"><CloseIcon size={20}/>
                    </button>
                </header>

                {/* body */}
                <div className="modal-body">
                    {/* LEFT COLUMN */}
                    <section className="col col-left">
                        <div className="field">
                            <label className="field-label">Chat name</label>
                            <input
                                ref={nameRef}
                                className={`tf ${errors.name ? "tf-error" : ""}`}
                                type="text"
                                value={name}
                                maxLength={48}
                                placeholder="e.g. Q3 launch crew"
                                onChange={(e) => {
                                    setName(e.target.value);
                                    if (e.target.value) setErrors(er => ({...er, name: undefined}));
                                }}
                            />
                            <div className="helper-row">
                            <span
                                className={`helper ${errors.name ? "helper-error" : ""}`}>{errors.name || "Visible to everyone in the chat."}</span>
                                <span className="helper count">{name.length}/48</span>
                            </div>
                        </div>

                        <div className="field">
                            <label className="field-label">Chat description</label>
                            <textarea
                                className="tf tf-area"
                                value={description}
                                maxLength={140}
                                placeholder="What's this group for?"
                                rows={3}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                            <div className="helper-row">
                                <span className="helper">Optional. Up to 140 characters.</span>
                                <span className="helper count">{description.length}/140</span>
                            </div>
                        </div>

                        <div className="field field-grow">
                            <div className="members-head">
                                <label className="field-label" style={{margin: 0}}>Added members</label>
                                <span className={`badge ${added.length ? "badge-on" : ""}`}>
                <PeopleIcon size={14}/> {added.length}
              </span>
                            </div>
                            <div
                                className={`chips-well ${errors.members ? "well-error" : ""} ${added.length === 0 ? "is-empty" : ""}`}>
                                {added.length === 0 ? (
                                    <div className="empty-chips">
                                        <PeopleIcon size={20}/>
                                        <span>No members added yet</span>
                                        <em>Pick people from the list on the right →</em>
                                    </div>
                                ) : (
                                    added.map(u => <MemberChip key={u.id} user={u} onRemove={removeUser}/>)
                                )}
                            </div>
                            {errors.members &&
                                <span className="helper helper-error" style={{marginTop: 6}}>{errors.members}</span>}
                        </div>
                    </section>

                    {/* divider */}
                    <div className="col-divider" aria-hidden="true"/>

                    {/* RIGHT COLUMN */}
                    <section className="col col-right">
                        <div className="field">
                            <label className="field-label">Add members</label>
                            <div className="search-wrap">
                                <span className="search-ico"><SearchIcon size={20}/></span>
                                <input
                                    className="tf tf-search"
                                    type="text"
                                    value={query}
                                    placeholder="Search by name"
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                                {loading && <span className="search-spin"><SpinnerIcon/></span>}
                                {!loading && query && (
                                    <button className="search-clear" onClick={() => setQuery("")}><CloseIcon size={14}/>
                                    </button>
                                )}
                            </div>
                            <div className="helper-row">
                            <span
                                className="helper">{loading ? "Searching directory…" : `${filtered.filter(u => !(tweaks.hideAdded && addedIds.has(u.id))).length} of ${DIRECTORY.length} people`}</span>
                            </div>
                        </div>

                        <div className="results-wrap">
                            <div className="results-head">
                                <span>Suggested</span>
                            </div>
                            <div className="results-list">
                                {renderResults()}
                            </div>
                        </div>
                    </section>
                </div>

                {/* footer */}
                <footer className="modal-foot">
                    <div className="foot-summary">
                        {added.length > 0 && (
                            <span className="foot-pill">
              <PeopleIcon size={14}/> {added.length} member{added.length === 1 ? "" : "s"} ready
            </span>
                        )}
                    </div>
                    <div className="foot-actions">
                        <button className="btn btn-text" onClick={handleCancel}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleCreate} disabled={created}>
                            {created ? <><CheckIcon size={16}/> Created</> : "Create"}
                        </button>
                    </div>
                </footer>
            </div>
        </MUIModal>
    );
};