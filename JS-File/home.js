
  // Navbar
  const navbar = document.getElementById('navbar');
  const scrollTopBtn = document.getElementById('scrollTop');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 10);
    scrollTopBtn.classList.toggle('show', window.scrollY > 400);
  });

  // Mobile menu
  function toggleMenu() {
    document.getElementById('hamburger').classList.toggle('open');
    document.getElementById('mobileMenu').classList.toggle('open');
  }
  document.querySelectorAll('.mobile-menu a').forEach(a => a.addEventListener('click', () => {
    document.getElementById('hamburger').classList.remove('open');
    document.getElementById('mobileMenu').classList.remove('open');
  }));

  // Hero slider
  let current = 0;
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.dot');
  const nums = ['01','02','03'];
  let timer;
  function goToSlide(n) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = n;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
    document.getElementById('currentNum').textContent = nums[current];
    const bar = document.getElementById('progressBar');
    bar.classList.remove('running');
    void bar.offsetWidth;
    bar.classList.add('running');
    clearInterval(timer);
    startAuto();
  }
  function startAuto() { timer = setInterval(() => goToSlide((current + 1) % slides.length), 5000); }
  startAuto();

  // Scroll reveal
  const revealEls = document.querySelectorAll('.reveal, .reveal-right, .reveal-left');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 100);
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => observer.observe(el));

  // Catalog upload
  const uploadZone = document.getElementById('uploadZone');
  const filesList = document.getElementById('filesList');
  const catalogGrid = document.getElementById('catalogGrid');
  const catalogGridSection = document.getElementById('catalogGridSection');
  const catalogEmpty = document.getElementById('catalogEmpty');
  const catalogCount = document.getElementById('catalogCount');
  let allCatalogs = [];

  uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('dragover'); });
  uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
  uploadZone.addEventListener('drop', e => { e.preventDefault(); uploadZone.classList.remove('dragover'); handleFiles(e.dataTransfer.files); });

  function handleFiles(files) {
    [...files].forEach(file => {
      if (file.size > 52428800) { showToast('File too large: ' + file.name, 'error'); return; }
      simulateUpload(file);
    });
  }
  function getFileType(name) {
    const ext = name.split('.').pop().toLowerCase();
    if (ext === 'pdf') return 'pdf';
    if (['jpg','jpeg','png','webp'].includes(ext)) return 'img';
    return 'other';
  }
  function getFileIcon(type) {
    if (type === 'pdf') return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="9" y1="15" x2="15" y2="15"/></svg>';
    if (type === 'img') return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>';
    return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>';
  }
  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes/1024).toFixed(1) + ' KB';
    return (bytes/1048576).toFixed(1) + ' MB';
  }
  function simulateUpload(file) {
    const id = 'f' + Date.now() + Math.random().toString(36).slice(2);
    const type = getFileType(file.name);
    filesList.classList.add('show');
    const item = document.createElement('div');
    item.className = 'file-item'; item.id = id;
    item.innerHTML = `
      <div class="file-icon ${type}">${getFileIcon(type)}</div>
      <div class="file-info">
        <span class="file-name">${file.name}</span>
        <span class="file-meta">${formatSize(file.size)} &nbsp;•&nbsp; ${type.toUpperCase()}</span>
        <div class="file-progress-wrap"><div class="file-progress-bar" id="bar-${id}"></div></div>
      </div>
      <span class="file-status uploading" id="status-${id}">Uploading...</span>`;
    filesList.appendChild(item);
    let prog = 0;
    const bar = document.getElementById('bar-' + id);
    const status = document.getElementById('status-' + id);
    const iv = setInterval(() => {
      prog += Math.random() * 18 + 8;
      if (prog >= 100) {
        prog = 100; clearInterval(iv);
        bar.style.width = '100%';
        status.textContent = 'Done'; status.className = 'file-status done';
        const url = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
        addToCatalog({id, name: file.name, size: file.size, type, url, date: new Date().toLocaleDateString('en-IN')});
        showToast(file.name + ' uploaded!', 'success');
        setTimeout(() => {
          item.style.opacity='0'; item.style.transform='translateX(20px)'; item.style.transition='all 0.3s';
          setTimeout(() => { item.remove(); if (!filesList.children.length) filesList.classList.remove('show'); }, 300);
        }, 1200);
      } else { bar.style.width = prog + '%'; }
    }, 120);
  }
  function addToCatalog(file) { allCatalogs.push(file); renderCatalogGrid(); }
  function removeCatalog(id) { allCatalogs = allCatalogs.filter(f => f.id !== id); renderCatalogGrid(); showToast('Catalog removed', 'error'); }
  function renderCatalogGrid() {
    const count = allCatalogs.length;
    if (count === 0) { catalogGridSection.style.display='none'; catalogEmpty.style.display='flex'; return; }
    catalogEmpty.style.display='none'; catalogGridSection.style.display='block';
    catalogCount.textContent = count + (count===1?' file':' files');
    catalogGrid.innerHTML = allCatalogs.map(f => `
      <div class="catalog-card" id="card-${f.id}">
        <div class="catalog-card-thumb">
          ${f.url ? `<img src="${f.url}" alt="${f.name}"/>` : `<div class="thumb-icon">${getFileIcon(f.type)}</div>`}
          <span class="catalog-card-type type-${f.type}">${f.type.toUpperCase()}</span>
        </div>
        <div class="catalog-card-body">
          <span class="catalog-card-name">${f.name}</span>
          <div class="catalog-card-meta">${formatSize(f.size)} &nbsp;•&nbsp; ${f.date}</div>
          <div class="catalog-card-actions">
            <a href="#" class="card-btn card-btn-primary" onclick="downloadFile('${f.id}');return false;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Download
            </a>
            <a href="#" class="card-btn card-btn-ghost" onclick="shareFile('${f.id}');return false;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>Share
            </a>
            <button class="card-btn card-btn-danger" onclick="removeCatalog('${f.id}')">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            </button>
          </div>
        </div>
      </div>`).join('');
  }
  function downloadFile(id) { const f=allCatalogs.find(x=>x.id===id); if(f) showToast('Downloading: '+f.name,'info'); }
  function shareFile(id) { const f=allCatalogs.find(x=>x.id===id); if(f) { const msg=encodeURIComponent('Check out Jexira catalog: '+f.name); window.open('https://wa.me/?text='+msg,'_blank'); } }
  function showToast(msg, type) {
    const toast=document.getElementById('toast');
    const icon=document.getElementById('toastIcon');
    document.getElementById('toastMsg').textContent=msg;
    icon.className='toast-icon '+type;
    icon.innerHTML = type==='success'
      ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20,6 9,17 4,12"/></svg>'
      : type==='error'
      ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
      : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
    toast.classList.add('show');
    setTimeout(()=>toast.classList.remove('show'), 3000);
  }
