'use client';

import { useState, useRef, useCallback } from 'react';

const API = 'http://localhost:3001';

interface Post {
  id: number;
  title: string;
  body: string;
}

interface NodeState {
  'node-browser': string;
  'node-next': string;
  'node-nest': string;
  'node-db': string;
}

interface ArrowState {
  'arrow-1': string;
  'arrow-2': string;
  'arrow-3': string;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function time() {
  return new Date().toLocaleTimeString('tr-TR', { hour12: false });
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [statusMsg, setStatusMsg] = useState('İstek bekleniyor...');
  const [statusColor, setStatusColor] = useState('var(--muted)');
  const [toast, setToast] = useState({ msg: '', color: 'var(--next)', show: false });
  const [activeCodeTab, setActiveCodeTab] = useState<'next' | 'nest'>('next');
  const [flashIds, setFlashIds] = useState<Set<number>>(new Set());
  const [nodes, setNodes] = useState<NodeState>({
    'node-browser': '',
    'node-next': '',
    'node-nest': '',
    'node-db': '',
  });
  const [arrows, setArrows] = useState<ArrowState>({
    'arrow-1': '',
    'arrow-2': '',
    'arrow-3': '',
  });

  const logRef = useRef<HTMLDivElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();

  // ── Logging ──────────────────────────────────────────────────
  const log = useCallback((html: string) => {
    if (!logRef.current) return;
    const line = document.createElement('span');
    line.className = 'log-line';
    line.innerHTML = html;
    logRef.current.appendChild(line);
    logRef.current.scrollTop = logRef.current.scrollHeight;
  }, []);

  // ── Toast ────────────────────────────────────────────────────
  const showToast = useCallback((msg: string, color = 'var(--next)') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, color, show: true });
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), 2500);
  }, []);

  const setStatus = (msg: string, color = 'var(--muted)') => {
    setStatusMsg(msg);
    setStatusColor(color);
  };

  // ── Architecture animation ────────────────────────────────────
  const animateFlow = useCallback(async (steps: any[]) => {
    setNodes({ 'node-browser': '', 'node-next': '', 'node-nest': '', 'node-db': '' });
    setArrows({ 'arrow-1': '', 'arrow-2': '', 'arrow-3': '' });

    for (const s of steps) {
      if (s.node) {
        setNodes((prev) => ({ ...prev, [s.node]: s.cls }));
      }
      if (s.arrow) {
        setArrows((prev) => ({ ...prev, [s.arrow]: s.arrowCls || 'lit' }));
      }
      await sleep(s.delay || 400);
    }
  }, []);

  const flowSteps = (delay = 300) => [
    { node: 'node-browser', cls: 'active-browser', delay },
    { arrow: 'arrow-1', arrowCls: 'lit', delay },
    { node: 'node-next', cls: 'active-next', delay },
    { arrow: 'arrow-2', arrowCls: 'lit', delay },
    { node: 'node-nest', cls: 'active-nest', delay },
    { arrow: 'arrow-3', arrowCls: 'lit-nest', delay },
    { node: 'node-db', cls: 'active-nest', delay },
  ];

  // ── FETCH POSTS (GET) ─────────────────────────────────────────
  const fetchPosts = async () => {
    setStatus('⏳ GET /posts — istek gönderiliyor...', 'var(--next)');
    log(`<span class="log-muted">${time()}</span> <span class="log-next">[Next.js]</span> <span class="log-white">Kullanıcı sayfayı açtı → fetch('${API}/posts')</span>`);

    animateFlow(flowSteps(300));

    await sleep(300);
    log(`<span class="log-muted">${time()}</span> <span class="log-nest">[Nest]</span> <span class="log-yellow">GET /posts</span> <span class="log-muted">— PostsController.findAll() çağrıldı</span>`);

    try {
      const res = await fetch(`${API}/posts`);
      const data: Post[] = await res.json();

      await sleep(200);
      log(`<span class="log-muted">${time()}</span> <span class="log-nest">[Nest]</span> <span class="log-green">PostsService.findAll()</span> <span class="log-muted">→ ${data.length} kayıt bulundu</span>`);
      await sleep(200);
      log(`<span class="log-muted">${time()}</span> <span class="log-nest">[Nest]</span> <span class="log-green">200 OK</span> <span class="log-muted">→ JSON[${data.length}] döndürüldü</span>`);
      await sleep(250);
      log(`<span class="log-muted">${time()}</span> <span class="log-next">[Next.js]</span> <span class="log-white">Veri alındı → SSR ile HTML oluşturuluyor...</span>`);
      await sleep(300);
      log(`<span class="log-muted">${time()}</span> <span class="log-next">[Next.js]</span> <span class="log-green">Render tamamlandı → kullanıcıya gönderildi ✓</span>`);

      setPosts(data);
      setFlashIds(new Set(data.map((p) => p.id)));
      setTimeout(() => setFlashIds(new Set()), 1400);
      setStatus(`✓ ${data.length} post render edildi`, 'var(--green)');
      showToast(`✓ Next.js ${data.length} postu Nest.js'ten çekti & render etti`);
    } catch {
      log(`<span class="log-muted">${time()}</span> <span class="log-nest">[Nest]</span> <span style="color:var(--nest)">HATA: Nest.js'e bağlanılamadı → localhost:3001 çalışıyor mu?</span>`);
      setStatus('✗ Bağlantı hatası', 'var(--nest)');
      showToast('✗ Nest.js API\'ye bağlanılamadı!', 'var(--nest)');
    }
  };

  // ── ADD POST (POST) ───────────────────────────────────────────
  const addPost = async () => {
    const title = newTitle.trim();
    if (!title) { showToast('⚠ Bir başlık yaz!', 'var(--yellow)'); return; }

    setStatus('⏳ POST /posts — istek gönderiliyor...', 'var(--nest)');
    animateFlow(flowSteps(200));

    log(`<span class="log-muted">${time()}</span> <span class="log-next">[Next.js]</span> <span class="log-white">Form gönderildi → POST /posts body: {title: "${title}"}</span>`);
    await sleep(300);
    log(`<span class="log-muted">${time()}</span> <span class="log-nest">[Nest]</span> <span class="log-yellow">POST /posts</span> <span class="log-muted">— PostsController.create() çağrıldı</span>`);
    await sleep(300);
    log(`<span class="log-muted">${time()}</span> <span class="log-nest">[Nest]</span> <span class="log-muted">@Body() DTO validate edildi ✓</span>`);

    try {
      const res = await fetch(`${API}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      const created: Post = await res.json();

      await sleep(200);
      log(`<span class="log-muted">${time()}</span> <span class="log-nest">[Nest]</span> <span class="log-green">PostsService.create()</span> <span class="log-muted">→ ID: ${created.id} olarak kaydedildi</span>`);
      await sleep(200);
      log(`<span class="log-muted">${time()}</span> <span class="log-nest">[Nest]</span> <span class="log-green">201 Created</span> <span class="log-muted">→ yeni post döndürüldü</span>`);
      await sleep(250);
      log(`<span class="log-muted">${time()}</span> <span class="log-next">[Next.js]</span> <span class="log-green">UI güncellendi → yeni post render edildi ✓</span>`);

      setPosts((prev) => [...prev, created]);
      setFlashIds(new Set([created.id]));
      setTimeout(() => setFlashIds(new Set()), 1400);
      setNewTitle('');
      setStatus(`✓ Post #${created.id} oluşturuldu`, 'var(--green)');
      showToast(`✓ "${title}" Nest.js'e POST edildi & eklendi`);
    } catch {
      log(`<span class="log-muted">${time()}</span> <span class="log-nest">[Nest]</span> <span style="color:var(--nest)">HATA: POST isteği başarısız</span>`);
      setStatus('✗ POST hatası', 'var(--nest)');
    }
  };

  // ── DELETE POST ───────────────────────────────────────────────
  const deletePost = async (id: number) => {
    setStatus(`⏳ DELETE /posts/${id} — istek gönderiliyor...`, 'var(--nest)');
    animateFlow(flowSteps(200));

    log(`<span class="log-muted">${time()}</span> <span class="log-next">[Next.js]</span> <span class="log-white">Sil butonu → DELETE /posts/${id}</span>`);
    await sleep(300);
    log(`<span class="log-muted">${time()}</span> <span class="log-nest">[Nest]</span> <span class="log-yellow">DELETE /posts/${id}</span> <span class="log-muted">— PostsController.remove(${id})</span>`);

    try {
      await fetch(`${API}/posts/${id}`, { method: 'DELETE' });

      await sleep(250);
      log(`<span class="log-muted">${time()}</span> <span class="log-nest">[Nest]</span> <span class="log-green">PostsService.remove(${id})</span> <span class="log-muted">→ silindi</span>`);
      await sleep(200);
      log(`<span class="log-muted">${time()}</span> <span class="log-nest">[Nest]</span> <span class="log-green">200 OK</span> <span class="log-muted">→ işlem tamamlandı</span>`);
      await sleep(200);
      log(`<span class="log-muted">${time()}</span> <span class="log-next">[Next.js]</span> <span class="log-green">UI güncellendi → post kaldırıldı ✓</span>`);

      setPosts((prev) => prev.filter((p) => p.id !== id));
      setStatus(`✓ Post #${id} silindi`, 'var(--nest)');
      showToast(`🗑 Post #${id} Nest.js'ten DELETE edildi`, 'var(--nest)');
    } catch {
      log(`<span class="log-muted">${time()}</span> <span class="log-nest">[Nest]</span> <span style="color:var(--nest)">HATA: DELETE isteği başarısız</span>`);
      setStatus('✗ DELETE hatası', 'var(--nest)');
    }
  };

  const nodeClass = (id: keyof NodeState) =>
    `arch-node${nodes[id] ? ' ' + nodes[id] : ''}`;
  const arrowClass = (id: keyof ArrowState) =>
    `arch-arrow${arrows[id] ? ' ' + arrows[id] : ''}`;

  return (
    <>
      {/* Top Bar */}
      <div className="topbar">
        <div className="topbar-title">
          <span className="next">Next.js</span>
          <span style={{ color: 'var(--muted)' }}> + </span>
          <span className="nest">Nest.js</span>
          <span style={{ color: 'var(--muted)' }}> — Live Demo</span>
        </div>
        <div className="badge">monorepo · REST API</div>
      </div>

      <div className="main">
        {/* Architecture Bar */}
        <div className="arch-bar">
          <div className={nodeClass('node-browser')} id="node-browser">
            <span className="arch-node-icon">🌐</span>
            <span className="arch-node-label">BROWSER</span>
            <span className="arch-node-sub">React UI</span>
          </div>
          <div className={arrowClass('arrow-1')} id="arrow-1">
            <div className="arch-arrow-line" />
            <span className="arch-arrow-label">HTTP req</span>
          </div>
          <div className={nodeClass('node-next')} id="node-next">
            <span className="arch-node-icon">▲</span>
            <span className="arch-node-label" style={{ color: 'var(--next)' }}>NEXT.JS</span>
            <span className="arch-node-sub">:3000</span>
          </div>
          <div className={arrowClass('arrow-2')} id="arrow-2">
            <div className="arch-arrow-line" />
            <span className="arch-arrow-label">fetch()</span>
          </div>
          <div className={nodeClass('node-nest')} id="node-nest">
            <span className="arch-node-icon">🐱</span>
            <span className="arch-node-label" style={{ color: 'var(--nest)' }}>NEST.JS</span>
            <span className="arch-node-sub">:3001</span>
          </div>
          <div className={arrowClass('arrow-3')} id="arrow-3">
            <div className="arch-arrow-line" />
            <span className="arch-arrow-label">query</span>
          </div>
          <div className={nodeClass('node-db')} id="node-db">
            <span className="arch-node-icon">🗄️</span>
            <span className="arch-node-label">DATABASE</span>
            <span className="arch-node-sub">in-memory</span>
          </div>
        </div>

        {/* Left Panel — Next.js */}
        <div className="panel panel-next">
          <div className="panel-header">
            <div className="panel-dot" />
            ▲ Next.js — localhost:3000 · Posts Page
          </div>

          <div className="post-list-wrapper">
            {posts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📭</div>
                <div className="empty-state-text">
                  &ldquo;GET /posts&rdquo; butonuna bas —<br />
                  Next.js, Nest.js API&rsquo;den veri çeksin
                </div>
              </div>
            ) : (
              posts.map((p) => (
                <div
                  key={p.id}
                  className={`post-card${flashIds.has(p.id) ? ' flash-next' : ''}`}
                >
                  <div className="post-card-header">
                    <span className="post-card-id">id: {p.id}</span>
                    <span className="post-card-title">{p.title}</span>
                    <button className="btn btn-danger" onClick={() => deletePost(p.id)}>
                      🗑 Sil
                    </button>
                  </div>
                  <div className="post-card-body">{p.body}</div>
                  <div className="post-card-footer">
                    <span className="post-card-tag">// Next.js tarafından render edildi · SSR</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="action-bar">
            <button className="btn btn-next" onClick={fetchPosts}>
              ▶ GET /posts
            </button>
            <input
              className="action-input"
              id="new-title"
              placeholder="Yeni post başlığı..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addPost()}
            />
            <button className="btn btn-nest" onClick={addPost}>
              + POST
            </button>
          </div>
        </div>

        {/* Right Panel — Nest.js */}
        <div className="panel panel-nest">
          <div className="panel-header">
            <div className="panel-dot" />
            🐱 Nest.js — localhost:3001 · API Logs & Code
          </div>

          {/* Code Tabs */}
          <div className="code-tabs">
            <button
              className={`code-tab${activeCodeTab === 'next' ? ' active-next' : ''}`}
              onClick={() => setActiveCodeTab('next')}
            >
              page.tsx
            </button>
            <button
              className={`code-tab${activeCodeTab === 'nest' ? ' active-nest' : ''}`}
              onClick={() => setActiveCodeTab('nest')}
            >
              posts.controller.ts
            </button>
          </div>

          {/* Next.js Code */}
          <div className={`code-block${activeCodeTab === 'next' ? ' visible' : ''}`}>
            <span className="c-cm">// app/page.tsx — Next.js (Client Component)</span><br />
            <span className="c-kw">&apos;use client&apos;</span><br />
            <br />
            <span className="c-kw">import</span> {'{'} useState {'}'} <span className="c-kw">from</span> <span className="c-str">&apos;react&apos;</span><br />
            <br />
            <span className="c-kw">export default function</span> <span className="c-fn">Page</span>() {'{'}<br />
            &nbsp;&nbsp;<span className="c-kw">const</span> [posts, setPosts] = <span className="c-fn">useState</span>([])<br />
            <br />
            &nbsp;&nbsp;<span className="c-kw">async function</span> <span className="c-fn">fetchPosts</span>() {'{'}<br />
            &nbsp;&nbsp;&nbsp;&nbsp;<span className="c-kw">const</span> res = <span className="c-kw">await</span> <span className="c-fn">fetch</span>(<span className="c-str">&apos;http://localhost:3001/posts&apos;</span>)<br />
            &nbsp;&nbsp;&nbsp;&nbsp;<span className="c-kw">const</span> data = <span className="c-kw">await</span> res.<span className="c-fn">json</span>()<br />
            &nbsp;&nbsp;&nbsp;&nbsp;<span className="c-fn">setPosts</span>(data) <span className="c-cm">← state güncellendi → re-render</span><br />
            &nbsp;&nbsp;{'}'}<br />
            <br />
            &nbsp;&nbsp;<span className="c-kw">return</span> (<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&lt;<span className="c-cls">button</span> <span className="c-dec">onClick</span>={'{'}fetchPosts{'}'}&gt;<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Postları Getir<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&lt;/<span className="c-cls">button</span>&gt;<br />
            &nbsp;&nbsp;)<br />
            {'}'}
          </div>

          {/* Nest.js Code */}
          <div className={`code-block${activeCodeTab === 'nest' ? ' visible' : ''}`}>
            <span className="c-cm">// posts/posts.controller.ts — Nest.js</span><br />
            <br />
            <span className="c-dec">@Controller</span>(<span className="c-str">&apos;posts&apos;</span>)<br />
            <span className="c-kw">export class</span> <span className="c-cls">PostsController</span> {'{'}<br />
            &nbsp;&nbsp;<span className="c-kw">constructor</span>(<span className="c-kw">private</span> service: <span className="c-cls">PostsService</span>) {'{}'}<br />
            <br />
            &nbsp;&nbsp;<span className="c-dec">@Get</span>() <span className="c-cm">← GET /posts</span><br />
            &nbsp;&nbsp;<span className="c-fn">findAll</span>() {'{'} <span className="c-kw">return</span> this.service.<span className="c-fn">findAll</span>(); {'}'}<br />
            <br />
            &nbsp;&nbsp;<span className="c-dec">@Post</span>() <span className="c-cm">← POST /posts</span><br />
            &nbsp;&nbsp;<span className="c-fn">create</span>(<span className="c-dec">@Body</span>() dto) {'{'} <span className="c-kw">return</span> this.service.<span className="c-fn">create</span>(dto); {'}'}<br />
            <br />
            &nbsp;&nbsp;<span className="c-dec">@Delete</span>(<span className="c-str">&apos;:id&apos;</span>) <span className="c-cm">← DELETE /posts/:id</span><br />
            &nbsp;&nbsp;<span className="c-fn">remove</span>(<span className="c-dec">@Param</span>(<span className="c-str">&apos;id&apos;</span>) id) {'{'} <span className="c-kw">return</span> this.service.<span className="c-fn">remove</span>(+id); {'}'}<br />
            {'}'}
          </div>

          {/* Log */}
          <div className="panel-header" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="panel-dot" />
            Terminal — API Log
          </div>
          <div className="nest-log" ref={logRef} />
        </div>
      </div>

      {/* Status Bar */}
      <div className="status-bar">
        <div className="status-item">
          <div className="status-dot next" /> Next.js :3000 · RUNNING
        </div>
        <div className="status-item">
          <div className="status-dot nest" /> Nest.js :3001 · RUNNING
        </div>
        <div className="status-item" style={{ marginLeft: 'auto', color: statusColor }}>
          {statusMsg}
        </div>
      </div>

      {/* Toast */}
      <div
        className={`toast${toast.show ? ' show' : ''}`}
        style={{ borderColor: toast.color }}
      >
        {toast.msg}
      </div>
    </>
  );
}
