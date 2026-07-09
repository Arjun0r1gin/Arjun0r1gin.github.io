import React, { useState, useEffect, useRef } from 'react';
import { useCms, type ProjectData, type ProfileData, type ContactLink } from '../../providers/CmsProvider';
import { type DevLog } from '../../data/devlogs';
import { mediaDb, type MediaItem } from '../../utils/mediaDb';
import { optimizeImage } from '../../utils/imageOptimizer';
import styles from './MissionControlCms.module.css';

type TabType = 'about' | 'projects' | 'logs' | 'contacts' | 'media' | 'system';

export const MissionControlCms: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const {
    activeProfileId,
    profiles,
    activeProfile,
    projects,
    devlogs,
    contacts,
    createProfile,
    updateProfile,
    deleteProfile,
    setActiveProfile,
    updateProjects,
    updateDevlogs,
    updateContacts,
    resetToFactorySettings
  } = useCms();

  const [activeTab, setActiveTab] = useState<TabType>('about');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    'SYSTEM SECURE / CMS BOOT PROTOCOL INITIALIZED',
    'DATABASE TYPE: LOCAL_STORAGE / CONNECTED',
    'MISSION CONTROL CMS ONLINE.'
  ]);

  const addTerminalLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTerminalLogs((prev) => [...prev.slice(-20), `[${timestamp}] ${msg}`]);
  };

  const terminalEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLogs]);

  // ==========================================
  // MEDIA LIBRARY STATE & ACTIONS
  // ==========================================
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [mediaSearch, setMediaSearch] = useState('');
  const [mediaFilter, setMediaFilter] = useState<string>('all');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [replacingId, setReplacingId] = useState<string | null>(null);

  // Load and seed media
  const loadMedia = async () => {
    try {
      let items = await mediaDb.getAll();
      if (items.length === 0) {
        addTerminalLog('MEDIA DATABASE EMPTY: INITIATING FACTORY SEEDS...');
        // Seed default presets using Fetch
        const seeds = [
          { id: 'avatar-placeholder', name: 'avatar-placeholder.png', path: profiles[0].profileImage, cat: 'general' },
          { id: 'rakshastra-planet', name: 'rakshastra.png', path: '/src/assets/planets/rakshastra.png', cat: 'planets' },
          { id: 'epsat-planet', name: 'epsat.png', path: '/src/assets/planets/epsat.png', cat: 'planets' },
          { id: 'cyberlab-planet', name: 'cyberlab.png', path: '/src/assets/planets/cyberlab.png', cat: 'planets' },
          { id: 'eznotes-planet', name: 'eznotes.png', path: '/src/assets/planets/eznotes.png', cat: 'planets' },
          { id: 'guardcharge-planet', name: 'guardcharge.png', path: '/src/assets/planets/guardcharge.png', cat: 'planets' }
        ];

        for (const s of seeds) {
          try {
            const res = await fetch(s.path);
            const blob = await res.blob();
            await mediaDb.save({
              id: s.id,
              name: s.name,
              type: blob.type,
              category: s.cat as any,
              blob,
              size: blob.size,
              dimensions: '512 x 512',
              uploadedAt: Date.now()
            });
            addTerminalLog(`SEEDED MEDIA: ${s.name.toUpperCase()} [OK]`);
          } catch (e) {
            console.error('Failed to seed file', s.name, e);
          }
        }
        items = await mediaDb.getAll();
      }
      setMediaItems(items);
    } catch (e) {
      addTerminalLog('ERROR: FAILED TO QUERY INDEXEDDB STORE');
    }
  };

  useEffect(() => {
    loadMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileUpload = async (files: FileList) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const id = `${file.name.split('.')[0].toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;
      
      // Determine category based on extension or prefix
      let category: MediaItem['category'] = 'general';
      const nameLower = file.name.toLowerCase();
      if (nameLower.includes('planet') || nameLower.includes('texture')) category = 'planets';
      else if (nameLower.includes('asteroid') || nameLower.includes('rock')) category = 'asteroids';
      else if (nameLower.includes('cloud')) category = 'clouds';
      else if (nameLower.includes('bg') || nameLower.includes('space') || nameLower.includes('stars')) category = 'backgrounds';
      else if (file.type.startsWith('video/')) category = 'videos';
      else if (nameLower.includes('icon') || nameLower.includes('logo') || file.type.includes('svg')) category = 'icons';

      try {
        if (file.type.startsWith('image/')) {
          addTerminalLog(`OPTIMIZING IMAGE: ${file.name.toUpperCase()}...`);
          const result = await optimizeImage(file);
          
          await mediaDb.save({
            id,
            name: `${file.name.split('.')[0]}.webp`, // Always WebP output
            type: 'image/webp',
            category,
            blob: result.blob,
            size: result.size,
            dimensions: result.dimensions,
            uploadedAt: Date.now()
          });

          addTerminalLog(`UPLOAD SUCCESS: ${file.name.toUpperCase()} COMPRESSED [${(result.originalSize / 1024).toFixed(0)}KB -> ${(result.size / 1024).toFixed(0)}KB] (SAVED ${result.compressionRatio}%)`);
        } else {
          // Raw upload for videos, svgs, icons
          await mediaDb.save({
            id,
            name: file.name,
            type: file.type,
            category,
            blob: file,
            size: file.size,
            uploadedAt: Date.now()
          });
          addTerminalLog(`UPLOAD SUCCESS: ${file.name.toUpperCase()} (RAW ${file.type})`);
        }
      } catch (err) {
        addTerminalLog(`UPLOAD FAILED: ${file.name.toUpperCase()} / ENGINE ABORTED`);
      }
    }
    loadMedia();
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleFileReplace = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!replacingId || !e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    
    try {
      if (file.type.startsWith('image/')) {
        addTerminalLog(`OPTIMIZING IMAGE REPLACEMENT: ${file.name.toUpperCase()}...`);
        const result = await optimizeImage(file);
        await mediaDb.replace(replacingId, result.blob, result.size, result.dimensions);
        addTerminalLog(`REPLACE SUCCESS: ${replacingId.toUpperCase()} [${(result.size / 1024).toFixed(0)}KB / WEBP]`);
      } else {
        await mediaDb.replace(replacingId, file, file.size);
        addTerminalLog(`REPLACE SUCCESS: ${replacingId.toUpperCase()} (RAW)`);
      }
    } catch (err) {
      addTerminalLog(`REPLACE FAILED: FAILED TO REPLACE FILE SEGMENT`);
    }

    setReplacingId(null);
    loadMedia();
  };

  const handleDeleteMedia = async (id: string) => {
    if (confirm(`Confirm permanent vaporisation of asset: '${id}'?`)) {
      try {
        await mediaDb.delete(id);
        addTerminalLog(`ASSET VAPORIZED: ${id.toUpperCase()}`);
        loadMedia();
        if (selectedMedia?.id === id) setSelectedMedia(null);
      } catch (e) {
        addTerminalLog('ERROR: FAILED TO WIPE ASSET DATA');
      }
    }
  };

  const startRename = (item: MediaItem) => {
    setRenamingId(item.id);
    setRenameValue(item.name);
  };

  const saveRename = async () => {
    if (!renamingId || !renameValue.trim()) return;
    try {
      await mediaDb.rename(renamingId, renameValue.trim());
      addTerminalLog(`ASSET RENAMED: -> ${renameValue.trim().toUpperCase()}`);
      setRenamingId(null);
      loadMedia();
    } catch (e) {
      addTerminalLog('ERROR: RENAME PROTOCOL FAILURE');
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const triggerReplaceSelect = (id: string) => {
    setReplacingId(id);
    replaceInputRef.current?.click();
  };

  // Filter & Search computation
  const filteredMedia = mediaItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(mediaSearch.toLowerCase()) || item.id.toLowerCase().includes(mediaSearch.toLowerCase());
    const matchesFilter = mediaFilter === 'all' || item.category === mediaFilter;
    return matchesSearch && matchesFilter;
  });

  const getStorageSize = () => {
    const totalBytes = mediaItems.reduce((acc, curr) => acc + curr.size, 0);
    return `${(totalBytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // ==========================================
  // ABOUT EDITOR (PROFILES CRUD) STATE
  // ==========================================
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(activeProfileId);
  const [profileForm, setProfileForm] = useState<Partial<ProfileData>>({});
  const [isAddingProfile, setIsAddingProfile] = useState(false);

  useEffect(() => {
    if (selectedProfileId) {
      const found = profiles.find(p => p.id === selectedProfileId);
      if (found) {
        setProfileForm({ ...found });
      }
    }
  }, [selectedProfileId, profiles]);

  const selectProfileForEdit = (prof: ProfileData) => {
    setSelectedProfileId(prof.id);
    setProfileForm({ ...prof });
    setIsAddingProfile(false);
    addTerminalLog(`SELECTED PROFILE PROFILE_CELL: '${prof.id.toUpperCase()}'`);
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.id || !profileForm.name) {
      addTerminalLog('ERROR: INVALID PROFILE DATA CONFIG');
      return;
    }

    if (isAddingProfile) {
      if (profiles.some((p) => p.id === profileForm.id)) {
        addTerminalLog(`ERROR: PROFILE ID '${profileForm.id}' ALREADY OCCUPIED`);
        return;
      }
      createProfile(profileForm as ProfileData);
      setSelectedProfileId(profileForm.id);
      setIsAddingProfile(false);
      addTerminalLog(`CREATED NEW DOSSIER SEGMENT: ${profileForm.name.toUpperCase()} [OK]`);
    } else {
      updateProfile(selectedProfileId!, profileForm as ProfileData);
      addTerminalLog(`UPDATED PROFILE DATA FOR '${profileForm.id.toUpperCase()}' [OK]`);
    }
  };

  const handleDeleteProfile = (id: string) => {
    if (profiles.length <= 1) {
      addTerminalLog('ERROR: CRITICAL SECURITY WARNING - ACCREDITED DOSSIER REQUIREMENT OF AT LEAST 1 MEMBER NOT MET');
      alert('Cannot delete last remaining operator profile!');
      return;
    }
    if (confirm(`Confirm disassembly of profile dossier: '${id}'?`)) {
      deleteProfile(id);
      setSelectedProfileId(profiles[0].id);
      setIsAddingProfile(false);
      addTerminalLog(`VAPORIZED PROFILE CELL: ${id.toUpperCase()}`);
    }
  };

  const handleSetActive = (id: string) => {
    setActiveProfile(id);
    addTerminalLog(`SYS_ROUTE: SET ACTIVE OPERATOR -> ${id.toUpperCase()} [OK]`);
  };

  const startNewProfile = () => {
    setIsAddingProfile(true);
    setSelectedProfileId(null);
    setProfileForm({
      id: `operator-${Date.now().toString().slice(-4)}`,
      name: 'NEW OPERATOR',
      title: 'OPERATOR DOSSIER // SECURE TERMINAL',
      subtitle: 'System Administrator / Cadet',
      description: 'Operator credentials bio statement details...',
      skills: 'System Config, Command Triage',
      technologies: 'Terminal Tools, Git',
      resumeLink: '#',
      profileImage: activeProfile.profileImage,
      status: 'ONLINE // ACTIVE',
      experience: '1 Year Academic',
      location: 'Bangalore, India'
    });
    addTerminalLog('INITIATED NEW MISSION OPERATOR REGISTRATION');
  };

  // ==========================================
  // PROJECTS STATE & EDIT & ADD
  // ==========================================
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectForm, setProjectForm] = useState<Partial<ProjectData>>({});
  const [isAddingProject, setIsAddingProject] = useState(false);

  const selectProjectForEdit = (proj: ProjectData) => {
    setSelectedProjectId(proj.id);
    setProjectForm({ ...proj });
    setIsAddingProject(false);
    addTerminalLog(`SELECTED PROJECT '${proj.id.toUpperCase()}' FOR RE-ORBIT CONFIG`);
  };

  const handleProjectSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.id || !projectForm.name) {
      addTerminalLog('ERROR: INVALID CONFIGURATION - MISSING REQUIRED FIELD');
      return;
    }

    let updatedList: ProjectData[];
    if (isAddingProject) {
      if (projects.some((p) => p.id === projectForm.id)) {
        addTerminalLog(`ERROR: ORBIT SEGMENT '${projectForm.id}' ALREADY OCCUPIED`);
        return;
      }
      updatedList = [...projects, projectForm as ProjectData];
      addTerminalLog(`LAUNCHED NEW ORBIT BODY: ${projectForm.name.toUpperCase()} [OK]`);
    } else {
      updatedList = projects.map((p) => (p.id === selectedProjectId ? (projectForm as ProjectData) : p));
      addTerminalLog(`ORBIT DATA MODIFIED FOR '${projectForm.id.toUpperCase()}' [OK]`);
    }

    updateProjects(updatedList);
    setSelectedProjectId(null);
    setProjectForm({});
    setIsAddingProject(false);
  };

  const handleDeleteProject = (id: string) => {
    if (confirm(`Confirm disassembly of orbital body: '${id}'?`)) {
      const updated = projects.filter((p) => p.id !== id);
      const final = updated.map(p => {
        if (p.orbitsParentId === id) {
          addTerminalLog(`CLEANED UP ORBIT DECAY: UNBOUND MOON '${p.name.toUpperCase()}'`);
          const { orbitsParentId, ...rest } = p;
          return { ...rest, size: 'flagship' } as ProjectData;
        }
        return p;
      });
      updateProjects(final);
      setSelectedProjectId(null);
      setProjectForm({});
      setIsAddingProject(false);
      addTerminalLog(`ORBITAL DISASSEMBLY COMPLETE: ${id.toUpperCase()}`);
    }
  };

  const startNewProject = () => {
    setIsAddingProject(true);
    setSelectedProjectId(null);
    setProjectForm({
      id: `project-${Date.now().toString().slice(-4)}`,
      name: 'NEW PLANET',
      size: 'flagship',
      accentColor: 'var(--signal-teal)',
      blurb: 'Orbit description text...',
      githubUrl: '#',
      imagePath: '/src/assets/planets/rakshastra.png'
    });
    addTerminalLog('INITIATED NEW PLANETARY COMPONENT SEGMENT');
  };

  // ==========================================
  // DEVLOGS STATE & EDIT & ADD
  // ==========================================
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [logForm, setLogForm] = useState<Partial<DevLog>>({});
  const [isAddingLog, setIsAddingLog] = useState(false);

  const selectLogForEdit = (log: DevLog) => {
    setSelectedLogId(log.id);
    setLogForm({ ...log });
    setIsAddingLog(false);
    addTerminalLog(`RETRIEVED ARCHIVE CELL '${log.id.toUpperCase()}'`);
  };

  const handleLogSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logForm.id || !logForm.title) {
      addTerminalLog('ERROR: ARCHIVE CELL INVALID');
      return;
    }

    let updatedList: DevLog[];
    if (isAddingLog) {
      if (devlogs.some((l) => l.id === logForm.id)) {
        addTerminalLog(`ERROR: ARCHIVE ID '${logForm.id}' ALREADY REGISTERED`);
        return;
      }
      updatedList = [...devlogs, logForm as DevLog];
      addTerminalLog(`REGISTERED NEW CELL: ${logForm.title.toUpperCase()} [OK]`);
    } else {
      updatedList = devlogs.map((l) => (l.id === selectedLogId ? (logForm as DevLog) : l));
      addTerminalLog(`MODIFIED ARCHIVE CELL '${logForm.id.toUpperCase()}' [OK]`);
    }

    updateDevlogs(updatedList);
    setSelectedLogId(null);
    setLogForm({});
    setIsAddingLog(false);
  };

  const handleDeleteLog = (id: string) => {
    if (confirm(`Confirm cell vaporization: '${id}'?`)) {
      const updated = devlogs.filter((l) => l.id !== id);
      updateDevlogs(updated);
      setSelectedLogId(null);
      setLogForm({});
      setIsAddingLog(false);
      addTerminalLog(`ARCHIVE CELL VAPORIZED: ${id.toUpperCase()}`);
    }
  };

  const startNewLog = () => {
    setIsAddingLog(true);
    setSelectedLogId(null);
    setLogForm({
      id: `log-${Date.now().toString().slice(-4)}`,
      title: 'NEW ASTEROID LOG',
      date: new Date().toISOString().slice(0, 7),
      summary: 'Telemetry log detailed analysis...',
      size: 'medium',
      url: '#'
    });
    addTerminalLog('LAUNCHED NEW ASTEROID SECTOR LOG');
  };

  // ==========================================
  // CONTACTS SAVE
  // ==========================================
  const [contactsForm, setContactsForm] = useState<ContactLink[]>([...contacts]);
  useEffect(() => {
    setContactsForm([...contacts]);
  }, [contacts]);

  const handleContactChange = (index: number, field: keyof ContactLink, value: string) => {
    const updated = contactsForm.map((c, i) => (i === index ? { ...c, [field]: value } : c));
    setContactsForm(updated);
  };

  const handleContactsSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateContacts(contactsForm);
    addTerminalLog('UFO SECURE LINKS RE-CONFIGURED [OK]');
  };

  // ==========================================
  // SYSTEM BACKUPS / RE-SEED
  // ==========================================
  const handleReset = () => {
    if (confirm('VAPORIZE CURRENT DATABASE & LOAD INITIAL seeds.json? This cannot be undone.')) {
      resetToFactorySettings();
      mediaDb.getAll().then(items => {
        items.forEach(i => mediaDb.delete(i.id));
      });
      setSelectedProjectId(null);
      setSelectedLogId(null);
      setSelectedProfileId('arjun-default');
      setProjectForm({});
      setLogForm({});
      setIsAddingProject(false);
      setIsAddingLog(false);
      setIsAddingProfile(false);
      setMediaItems([]);
      addTerminalLog('CRITICAL: DATABASE WIPE COMPLETE / SEEDED DATA RESTORED');
      setTimeout(() => loadMedia(), 1000);
    }
  };

  const exportConfig = () => {
    const dataStr = JSON.stringify({ activeProfileId, profiles, projects, devlogs, contacts }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `cosmos_station_backup_${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    addTerminalLog('EXPORTED FULL SYSTEM CONFIGURATION FILE');
  };

  const importConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.activeProfileId) setActiveProfile(parsed.activeProfileId);
          if (parsed.profiles) updateProfile(parsed.profiles[0].id, parsed.profiles[0]);
          if (parsed.projects) updateProjects(parsed.projects);
          if (parsed.devlogs) updateDevlogs(parsed.devlogs);
          if (parsed.contacts) updateContacts(parsed.contacts);
          
          addTerminalLog('IMPORT COMPLETE: RESTORE SYSTEM CODES STATUS [OK]');
        } catch (error) {
          addTerminalLog('ERROR: CORRUPTED DATA FILE TRANSFERS ABORTED');
        }
      };
    }
  };

  return (
    <div className={styles.adminOverlay}>
      <div className={styles.adminPanel}>
        {/* HUD Top Bar */}
        <div className={styles.topBar}>
          <div className={styles.logoBlock}>
            <span className={styles.glitchLabel}>MISSION CONTROL</span>
            <span className={styles.versionTag}>CMS v1.0.0</span>
          </div>
          <div className={styles.systemStatus}>
            <div className={styles.statusIndicator}>
              <span className={styles.pulseGreen}></span> LOCALSTORAGE: SECURE
            </div>
            <div className={styles.statusIndicator}>
              <span className={styles.pulseGreen}></span> INDEXEDDB: ONLINE
            </div>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Exit Admin Panel">
              [ EXIT_CON ]
            </button>
          </div>
        </div>

        <div className={styles.workspace}>
          {/* Cyber Sidebar */}
          <aside className={styles.sidebar}>
            <nav className={styles.nav}>
              <button
                className={`${styles.navItem} ${activeTab === 'about' ? styles.active : ''}`}
                onClick={() => setActiveTab('about')}
              >
                <span className={styles.icon}>🛰️</span> ABOUT_EDITOR
              </button>
              <button
                className={`${styles.navItem} ${activeTab === 'projects' ? styles.active : ''}`}
                onClick={() => setActiveTab('projects')}
              >
                <span className={styles.icon}>🪐</span> ORBIT_PLANETS
              </button>
              <button
                className={`${styles.navItem} ${activeTab === 'logs' ? styles.active : ''}`}
                onClick={() => setActiveTab('logs')}
              >
                <span className={styles.icon}>☄️</span> ASTEROID_LOGS
              </button>
              <button
                className={`${styles.navItem} ${activeTab === 'contacts' ? styles.active : ''}`}
                onClick={() => setActiveTab('contacts')}
              >
                <span className={styles.icon}>🛸</span> UFO_PORTS
              </button>
              <button
                className={`${styles.navItem} ${activeTab === 'media' ? styles.active : ''}`}
                onClick={() => setActiveTab('media')}
              >
                <span className={styles.icon}>🖼️</span> MEDIA_LIBRARY
              </button>
              <button
                className={`${styles.navItem} ${activeTab === 'system' ? styles.active : ''}`}
                onClick={() => setActiveTab('system')}
              >
                <span className={styles.icon}>💾</span> CORE_SYSTEMS
              </button>
            </nav>

            <div className={styles.gaugeBlock}>
              <div className={styles.gaugeHeader}>
                <span>INDEXEDDB LOAD</span>
                <span>{getStorageSize()}</span>
              </div>
              <div className={styles.gaugeBar}>
                <div className={styles.gaugeFill} style={{ width: `${Math.min(100, (mediaItems.reduce((acc, curr) => acc + curr.size, 0) / (20 * 1024 * 1024)) * 100)}%` }} />
              </div>
            </div>
          </aside>

          {/* Form Content Panel */}
          <main className={styles.content}>
            
            {/* TAB 1: ABOUT EDITOR (PROFILES CRUD) */}
            {activeTab === 'about' && (
              <div className={styles.tabContentGrid}>
                {/* Left Profiles List */}
                <div className={styles.listCol}>
                  <div className={styles.listHeader}>
                    <h4>OPERATOR_PROFILES</h4>
                    <button className={styles.addBtn} onClick={startNewProfile}>
                      [ + CREATE ]
                    </button>
                  </div>
                  <div className={styles.listScroll}>
                    {profiles.map((p) => {
                      const isActive = p.id === activeProfileId;
                      return (
                        <div
                          key={p.id}
                          className={`${styles.listItem} ${selectedProfileId === p.id ? styles.selected : ''}`}
                          onClick={() => selectProfileForEdit(p)}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className={styles.itemTitle}>{p.name}</span>
                            {isActive && <span className={styles.activeBadge}>[ ACTIVE ]</span>}
                          </div>
                          <span className={styles.itemSubtitle}>{p.subtitle}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Profile Form */}
                <div className={styles.formCol}>
                  {selectedProfileId || isAddingProfile ? (
                    <form onSubmit={handleProfileSave} className={styles.form}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed rgba(143, 216, 210, 0.2)', paddingBottom: '12px' }}>
                        <h3 style={{ margin: 0, fontSize: '14px', color: 'var(--signal-teal)' }}>
                          {isAddingProfile ? 'CREATE_OPERATOR_DOSSIER' : `EDIT_OPERATOR: ${profileForm.id?.toUpperCase()}`}
                        </h3>
                        {!isAddingProfile && profileForm.id !== activeProfileId && (
                          <button
                            type="button"
                            className={styles.activateBtn}
                            onClick={() => handleSetActive(profileForm.id!)}
                          >
                            [ SET_AS_ACTIVE_OPERATOR ]
                          </button>
                        )}
                        {profileForm.id === activeProfileId && (
                          <span className={styles.statusOnline}>● LIVE PORTFOLIO ACTIVE</span>
                        )}
                      </div>

                      <div className={styles.inputGroupRow}>
                        <div className={styles.inputGroup}>
                          <label>DOSSIER_SLUG_ID</label>
                          <input
                            type="text"
                            value={profileForm.id || ''}
                            onChange={(e) => setProfileForm({ ...profileForm, id: e.target.value.toLowerCase() })}
                            disabled={!isAddingProfile}
                            required
                          />
                        </div>
                        <div className={styles.inputGroup}>
                          <label>OPERATOR_NAME</label>
                          <input
                            type="text"
                            value={profileForm.name || ''}
                            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value.toUpperCase() })}
                            required
                          />
                        </div>
                      </div>

                      <div className={styles.inputGroupRow}>
                        <div className={styles.inputGroup}>
                          <label>DOSSIER_TITLE</label>
                          <input
                            type="text"
                            value={profileForm.title || ''}
                            onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                            required
                          />
                        </div>
                        <div className={styles.inputGroup}>
                          <label>DOSSIER_SUBTITLE</label>
                          <input
                            type="text"
                            value={profileForm.subtitle || ''}
                            onChange={(e) => setProfileForm({ ...profileForm, subtitle: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className={styles.inputGroupRow}>
                        <div className={styles.inputGroup}>
                          <label>STATUS_STAMP</label>
                          <input
                            type="text"
                            value={profileForm.status || ''}
                            onChange={(e) => setProfileForm({ ...profileForm, status: e.target.value })}
                            required
                          />
                        </div>
                        <div className={styles.inputGroup}>
                          <label>YEARS_OF_EXPERIENCE</label>
                          <input
                            type="text"
                            value={profileForm.experience || ''}
                            onChange={(e) => setProfileForm({ ...profileForm, experience: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className={styles.inputGroupRow}>
                        <div className={styles.inputGroup}>
                          <label>LOCATION_COORDINATES</label>
                          <input
                            type="text"
                            value={profileForm.location || ''}
                            onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                            required
                          />
                        </div>
                        <div className={styles.inputGroup}>
                          <label>RESUME_ARCHIVE_LINK</label>
                          <input
                            type="text"
                            value={profileForm.resumeLink || ''}
                            onChange={(e) => setProfileForm({ ...profileForm, resumeLink: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className={styles.inputGroup}>
                        <label>PROFILE_IMAGE_PATH (Database code db://id or URL)</label>
                        <input
                          type="text"
                          value={profileForm.profileImage || ''}
                          onChange={(e) => setProfileForm({ ...profileForm, profileImage: e.target.value })}
                          required
                        />
                      </div>

                      <div className={styles.inputGroup}>
                        <label>ABOUT_DOSSIER_DESCRIPTION</label>
                        <textarea
                          rows={4}
                          value={profileForm.description || ''}
                          onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
                          required
                        />
                      </div>

                      <div className={styles.inputGroup}>
                        <label>CORE_SKILLS (Comma-Separated)</label>
                        <input
                          type="text"
                          value={profileForm.skills || ''}
                          onChange={(e) => setProfileForm({ ...profileForm, skills: e.target.value })}
                          placeholder="e.g. C/C++, Embedded Software, Telemetry"
                          required
                        />
                      </div>

                      <div className={styles.inputGroup}>
                        <label>TECH_STACK_CHIPS (Comma-Separated)</label>
                        <input
                          type="text"
                          value={profileForm.technologies || ''}
                          onChange={(e) => setProfileForm({ ...profileForm, technologies: e.target.value })}
                          placeholder="e.g. React, Vite, GSAP, Linux"
                          required
                        />
                      </div>

                      <div className={styles.formActions}>
                        <button type="submit" className={styles.saveBtn}>
                          {isAddingProfile ? 'CREATE PROFILE DOSSIER' : 'SAVE PROFILE DATA'}
                        </button>
                        {!isAddingProfile && (
                          <button
                            type="button"
                            className={styles.deleteBtn}
                            onClick={() => handleDeleteProfile(profileForm.id!)}
                          >
                            DELETE PROFILE
                          </button>
                        )}
                      </div>
                    </form>
                  ) : (
                    <div className={styles.placeholderBlock}>
                      <span>[ SELECT AN OPERATOR DOSSIER TO CONFIGURE OR INITIALIZE A NEW PROFILE ]</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: PROJECTS */}
            {activeTab === 'projects' && (
              <div className={styles.tabContentGrid}>
                {/* Left list */}
                <div className={styles.listCol}>
                  <div className={styles.listHeader}>
                    <h4>ORBITAL_BODIES</h4>
                    <button className={styles.addBtn} onClick={startNewProject}>
                      [ + LAUNCH_BODY ]
                    </button>
                  </div>
                  <div className={styles.listScroll}>
                    {projects.map((p) => (
                      <div
                        key={p.id}
                        className={`${styles.listItem} ${selectedProjectId === p.id ? styles.selected : ''}`}
                        onClick={() => selectProjectForEdit(p)}
                      >
                        <span className={styles.itemTitle}>{p.name}</span>
                        <span className={styles.itemSubtitle}>
                          {p.size.toUpperCase()} {p.orbitsParentId ? `(MOON OF ${p.orbitsParentId.toUpperCase()})` : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Form */}
                <div className={styles.formCol}>
                  {selectedProjectId || isAddingProject ? (
                    <form onSubmit={handleProjectSave} className={styles.form}>
                      <h3 className={styles.formTitle}>
                        {isAddingProject ? 'LAUNCH_NEW_ORBIT_BODY' : `RE-ORBIT_BODY: ${projectForm.id?.toUpperCase()}`}
                      </h3>

                      <div className={styles.inputGroupRow}>
                        <div className={styles.inputGroup}>
                          <label>UNIQUE_SLUG_ID</label>
                          <input
                            type="text"
                            value={projectForm.id || ''}
                            onChange={(e) => setProjectForm({ ...projectForm, id: e.target.value.toLowerCase() })}
                            disabled={!isAddingProject}
                            required
                          />
                        </div>
                        <div className={styles.inputGroup}>
                          <label>PLANET_NAME</label>
                          <input
                            type="text"
                            value={projectForm.name || ''}
                            onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className={styles.inputGroupRow}>
                        <div className={styles.inputGroup}>
                          <label>PLANETARY_SIZE</label>
                          <select
                            value={projectForm.size || 'flagship'}
                            onChange={(e) =>
                              setProjectForm({
                                ...projectForm,
                                size: e.target.value as 'flagship' | 'moon',
                                orbitsParentId: e.target.value === 'flagship' ? undefined : projectForm.orbitsParentId
                              })
                            }
                          >
                            <option value="flagship">FLAGSHIP (Main Planet)</option>
                            <option value="moon">MOON (Orbits Flagship)</option>
                          </select>
                        </div>
                        {projectForm.size === 'moon' && (
                          <div className={styles.inputGroup}>
                            <label>ORBITS_PARENT_BODY</label>
                            <select
                              value={projectForm.orbitsParentId || ''}
                              onChange={(e) => setProjectForm({ ...projectForm, orbitsParentId: e.target.value })}
                              required
                            >
                              <option value="">-- SELECT FLAGSHIP --</option>
                              {projects
                                .filter((p) => p.size === 'flagship' && p.id !== selectedProjectId)
                                .map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.name}
                                  </option>
                                ))}
                            </select>
                          </div>
                        )}
                      </div>

                      <div className={styles.inputGroupRow}>
                        <div className={styles.inputGroup}>
                          <label>ACCENT_BORDER_COLOR</label>
                          <input
                            type="text"
                            value={projectForm.accentColor || ''}
                            onChange={(e) => setProjectForm({ ...projectForm, accentColor: e.target.value })}
                            placeholder="e.g. var(--signal-teal), #ff0055"
                            required
                          />
                        </div>
                        <div className={styles.inputGroup}>
                          <label>GITHUB_URL</label>
                          <input
                            type="text"
                            value={projectForm.githubUrl || ''}
                            onChange={(e) => setProjectForm({ ...projectForm, githubUrl: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className={styles.inputGroupRow}>
                        <div className={styles.inputGroup}>
                          <label>PLANET_TEXTURE_PATH (Database code db://id or URL)</label>
                          <input
                            type="text"
                            value={projectForm.imagePath || ''}
                            onChange={(e) => setProjectForm({ ...projectForm, imagePath: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className={styles.inputGroup}>
                        <label>ORBIT_BLURB_SPECIFICATIONS</label>
                        <textarea
                          rows={3}
                          value={projectForm.blurb || ''}
                          onChange={(e) => setProjectForm({ ...projectForm, blurb: e.target.value })}
                          required
                        />
                      </div>

                      <div className={styles.formActions}>
                        <button type="submit" className={styles.saveBtn}>
                          {isAddingProject ? 'LAUNCH PLANET' : 'SAVE ORBITAL DATA'}
                        </button>
                        {!isAddingProject && (
                          <button
                            type="button"
                            className={styles.deleteBtn}
                            onClick={() => handleDeleteProject(projectForm.id!)}
                          >
                            DISASSEMBLE BODY
                          </button>
                        )}
                      </div>
                    </form>
                  ) : (
                    <div className={styles.placeholderBlock}>
                      <span>[ SELECT AN ORBITAL BODY TO RE-CONFIGURE OR LAUNCH A NEW PLANET ]</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: DEVLOGS */}
            {activeTab === 'logs' && (
              <div className={styles.tabContentGrid}>
                {/* Left list */}
                <div className={styles.listCol}>
                  <div className={styles.listHeader}>
                    <h4>ASTEROID_ARCHIVE</h4>
                    <button className={styles.addBtn} onClick={startNewLog}>
                      [ + LAUNCH_LOG ]
                    </button>
                  </div>
                  <div className={styles.listScroll}>
                    {devlogs.map((l) => (
                      <div
                        key={l.id}
                        className={`${styles.listItem} ${selectedLogId === l.id ? styles.selected : ''}`}
                        onClick={() => selectLogForEdit(l)}
                      >
                        <span className={styles.itemTitle}>{l.title}</span>
                        <span className={styles.itemSubtitle}>
                          {l.date} / Size: {l.size.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Form */}
                <div className={styles.formCol}>
                  {selectedLogId || isAddingLog ? (
                    <form onSubmit={handleLogSave} className={styles.form}>
                      <h3 className={styles.formTitle}>
                        {isAddingLog ? 'LAUNCH_NEW_ASTEROID' : `EDIT_LOG_CELL: ${logForm.id?.toUpperCase()}`}
                      </h3>

                      <div className={styles.inputGroupRow}>
                        <div className={styles.inputGroup}>
                          <label>CELL_SLUG_ID</label>
                          <input
                            type="text"
                            value={logForm.id || ''}
                            onChange={(e) => setLogForm({ ...logForm, id: e.target.value })}
                            disabled={!isAddingLog}
                            required
                          />
                        </div>
                        <div className={styles.inputGroup}>
                          <label>LOG_TITLE</label>
                          <input
                            type="text"
                            value={logForm.title || ''}
                            onChange={(e) => setLogForm({ ...logForm, title: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className={styles.inputGroup}>
                        <label>PROJECT_NAME (SHOWN BELOW ASTEROID)</label>
                        <input
                          type="text"
                          value={logForm.project || ''}
                          onChange={(e) => setLogForm({ ...logForm, project: e.target.value })}
                          placeholder="e.g. RAKSHASTRA"
                        />
                      </div>

                      <div className={styles.inputGroupRow}>
                        <div className={styles.inputGroup}>
                          <label>DATE_STAMP (YYYY-MM)</label>
                          <input
                            type="text"
                            value={logForm.date || ''}
                            onChange={(e) => setLogForm({ ...logForm, date: e.target.value })}
                            placeholder="e.g. 2024-03"
                            required
                          />
                        </div>
                        <div className={styles.inputGroup}>
                          <label>ASTEROID_VISUAL_SCALE</label>
                          <select
                            value={logForm.size || 'medium'}
                            onChange={(e) => setLogForm({ ...logForm, size: e.target.value as 'small' | 'medium' | 'large' })}
                          >
                            <option value="small">SMALL ASTEROID</option>
                            <option value="medium">MEDIUM ASTEROID</option>
                            <option value="large">LARGE ASTEROID</option>
                          </select>
                        </div>
                      </div>

                      <div className={styles.inputGroup}>
                        <label>GIT_REPOSITORY_URL</label>
                        <input
                          type="text"
                          value={logForm.url || ''}
                          onChange={(e) => setLogForm({ ...logForm, url: e.target.value })}
                          required
                        />
                      </div>

                      <div className={styles.inputGroup}>
                        <label>LOG_SUMMARY_DECRYPTION</label>
                        <textarea
                          rows={4}
                          value={logForm.summary || ''}
                          onChange={(e) => setLogForm({ ...logForm, summary: e.target.value })}
                          required
                        />
                      </div>

                      <div className={styles.formActions}>
                        <button type="submit" className={styles.saveBtn}>
                          {isAddingLog ? 'LAUNCH ASTEROID' : 'SAVE ARCHIVE CELL'}
                        </button>
                        {!isAddingLog && (
                          <button
                            type="button"
                            className={styles.deleteBtn}
                            onClick={() => handleDeleteLog(logForm.id!)}
                          >
                            VAPORIZE CELL
                          </button>
                        )}
                      </div>
                    </form>
                  ) : (
                    <div className={styles.placeholderBlock}>
                      <span>[ SELECT AN ARCHIVE CELL TO EDIT OR LAUNCH A NEW ASTEROID ]</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: CONTACTS */}
            {activeTab === 'contacts' && (
              <div className={styles.tabContent}>
                <h3 className={styles.sectionTitle}>UFO_PORT_CHANNELS</h3>
                <form onSubmit={handleContactsSave} className={styles.form}>
                  {contactsForm.map((c, index) => (
                    <div key={c.id} className={styles.contactRow}>
                      <span className={styles.contactLabel}>{c.name} Port</span>
                      <div className={styles.contactFields}>
                        <input
                          type="text"
                          value={c.href}
                          onChange={(e) => handleContactChange(index, 'href', e.target.value)}
                          placeholder="Target URL (e.g. mailto:..., https://...)"
                          required
                        />
                        <input
                          type="text"
                          value={c.label}
                          onChange={(e) => handleContactChange(index, 'label', e.target.value)}
                          placeholder="HUD Status Text Description"
                          required
                        />
                      </div>
                    </div>
                  ))}
                  <button type="submit" className={styles.saveBtn}>
                    SAVE LINK CHANNELS
                  </button>
                </form>
              </div>
            )}

            {/* TAB 5: MEDIA LIBRARY */}
            {activeTab === 'media' && (
              <div className={styles.tabContentMedia}>
                <div className={styles.mediaHeaderRow}>
                  <h3 className={styles.sectionTitle} style={{ border: 'none', margin: 0, padding: 0 }}>ORBITAL_MEDIA_VAULT</h3>
                  <div className={styles.mediaControls}>
                    <input
                      type="text"
                      className={styles.mediaSearch}
                      placeholder="Search assets by slug / name..."
                      value={mediaSearch}
                      onChange={(e) => setMediaSearch(e.target.value)}
                    />
                    <select
                      className={styles.mediaFilter}
                      value={mediaFilter}
                      onChange={(e) => setMediaFilter(e.target.value)}
                    >
                      <option value="all">ALL CATEGORIES</option>
                      <option value="planets">🪐 PLANET TEXTURES</option>
                      <option value="asteroids">☄️ ASTEROIDS</option>
                      <option value="clouds">☁️ CLOUDS</option>
                      <option value="backgrounds">🌌 BACKGROUNDS</option>
                      <option value="icons">🔘 ICONS / LOGOS</option>
                      <option value="videos">🎞️ VIDEOS</option>
                      <option value="general">📂 GENERAL</option>
                    </select>
                  </div>
                </div>

                {/* Drag and Drop Zone */}
                <div
                  className={`${styles.dropZone} ${isDragging ? styles.dropZoneActive : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleFileDrop}
                  onClick={triggerFileSelect}
                >
                  <input
                    type="file"
                    multiple
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                  />
                  <span>[ DRAG AND DROP ORBITAL FILES HERE OR CLICK TO BROWSE ]</span>
                  <span className={styles.dropZoneSub}>PNG, JPG, WEBP, SVG, MP4 (Image files compressed auto-WebP)</span>
                </div>

                {/* Hidden input for replace file uploads */}
                <input
                  type="file"
                  ref={replaceInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileReplace}
                />

                {/* Media grid list */}
                <div className={styles.mediaGrid}>
                  {filteredMedia.length > 0 ? (
                    filteredMedia.map((item) => {
                      const isImage = item.type.startsWith('image/');
                      const isVideo = item.type.startsWith('video/');
                      
                      return (
                        <div key={item.id} className={styles.mediaCard}>
                          {/* File Preview */}
                          <div className={styles.mediaPreviewZone} onClick={() => setSelectedMedia(item)}>
                            {isImage ? (
                              <img className={styles.mediaThumb} src={item.url} alt={item.name} loading="lazy" />
                            ) : isVideo ? (
                              <div className={styles.mediaPlaceholderIcon}>🎞️ <span style={{ fontSize: '9px', display: 'block', marginTop: '4px' }}>VIDEO FILE</span></div>
                            ) : (
                              <div className={styles.mediaPlaceholderIcon}>📁 <span style={{ fontSize: '9px', display: 'block', marginTop: '4px' }}>RAW DATA</span></div>
                            )}
                            <div className={styles.mediaCardOverlay}>
                              <span>[ VIEW FULL PREVIEW ]</span>
                            </div>
                          </div>

                          {/* Info & Actions */}
                          <div className={styles.mediaCardDetails}>
                            {renamingId === item.id ? (
                              <div className={styles.inlineRename}>
                                <input
                                  type="text"
                                  value={renameValue}
                                  onChange={(e) => setRenameValue(e.target.value)}
                                  required
                                />
                                <button type="button" onClick={saveRename}>[ OK ]</button>
                              </div>
                            ) : (
                              <span className={styles.mediaCardName} title={item.name}>
                                {item.name}
                              </span>
                            )}
                            <span className={styles.mediaCardMeta}>
                              {(item.size / 1024).toFixed(0)} KB {item.dimensions ? `/ ${item.dimensions}` : ''}
                            </span>
                            <span className={styles.mediaCardSlug} onClick={() => {
                              navigator.clipboard.writeText(`db://${item.id}`);
                              addTerminalLog(`COPIED DATABASE CODE db://${item.id} TO CLIPBOARD`);
                              alert(`Copied db://${item.id} to clipboard! Paste this code in the image path fields.`);
                            }} title="Click to copy DB link code">
                              db://{item.id}
                            </span>

                            <div className={styles.mediaCardActions}>
                              <button type="button" onClick={() => startRename(item)}>[ RENAME ]</button>
                              <button type="button" onClick={() => triggerReplaceSelect(item.id)}>[ REPLACE ]</button>
                              <button type="button" className={styles.mediaDeleteBtn} onClick={() => handleDeleteMedia(item.id)}>[ DELETE ]</button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className={styles.mediaEmptyBlock}>
                      <span>[ NO ASSETS MATCHING SEARCH QUERY OR CATEGORY FILTER ]</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 6: SYSTEM */}
            {activeTab === 'system' && (
              <div className={styles.tabContent}>
                <h3 className={styles.sectionTitle}>STATION_CORE_SYSTEMS</h3>
                <div className={styles.systemGrid}>
                  <div className={styles.sysCard}>
                    <h5>EXPORT DATABASE</h5>
                    <p>Export the current CMS configuration code blocks to a single JSON archive file.</p>
                    <button className={styles.sysBtn} onClick={exportConfig}>
                      RUN EXPORT PROTOCOL
                    </button>
                  </div>

                  <div className={styles.sysCard}>
                    <h5>IMPORT DATABASE</h5>
                    <p>Upload a JSON configuration file to overwrite the entire local database.</p>
                    <label className={styles.sysFileBtn}>
                      SELECT CONFIG JSON
                      <input type="file" accept=".json" onChange={importConfig} />
                    </label>
                  </div>

                  <div className={styles.sysCard}>
                    <h5>FACTORY RESTORE</h5>
                    <p>Vaporize all local storage sectors and reload the factory data seeds.</p>
                    <button className={styles.resetBtn} onClick={handleReset}>
                      VAPORIZE DATABASE [RESET]
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>

        {/* Media Preview Modal Overlay */}
        {selectedMedia && (
          <div className={styles.previewModalOverlay} onClick={() => setSelectedMedia(null)}>
            <div className={styles.previewModal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.previewModalHeader}>
                <span>FILE PREVIEW // ID: {selectedMedia.id}</span>
                <button type="button" onClick={() => setSelectedMedia(null)}>[ CLOSE ]</button>
              </div>
              <div className={styles.previewModalBody}>
                {selectedMedia.type.startsWith('image/') ? (
                  <img src={selectedMedia.url} alt={selectedMedia.name} className={styles.fullPreviewImg} />
                ) : selectedMedia.type.startsWith('video/') ? (
                  <video src={selectedMedia.url} controls className={styles.fullPreviewVideo} />
                ) : (
                  <div className={styles.rawPreviewBlock}>
                    <span>[ BINARY FILE ENCODING NOT DISPLAYABLE IN VISUAL PORT ]</span>
                  </div>
                )}
              </div>
              <div className={styles.previewModalFooter}>
                <div className={styles.previewMeta}>
                  <div><strong>FILE NAME:</strong> {selectedMedia.name}</div>
                  <div><strong>SIZE:</strong> {(selectedMedia.size / 1024).toFixed(2)} KB</div>
                  {selectedMedia.dimensions && <div><strong>DIMENSIONS:</strong> {selectedMedia.dimensions}</div>}
                  <div><strong>DB PATH CODE:</strong> <code style={{ color: 'var(--signal-teal)', border: '1px solid rgba(143, 216, 210, 0.3)', padding: '2px 6px', background: '#000', borderRadius: '3px' }}>db://{selectedMedia.id}</code></div>
                </div>
                <button type="button" className={styles.copyBtn} onClick={() => {
                  navigator.clipboard.writeText(`db://${selectedMedia.id}`);
                  addTerminalLog(`COPIED DATABASE CODE db://${selectedMedia.id} TO CLIPBOARD`);
                  alert(`Copied db://${selectedMedia.id} to clipboard! Paste this code in the image path fields.`);
                }}>
                  COPY DB LINK CODE
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Scrolling Terminal Log Bar */}
        <footer className={styles.terminal}>
          <div className={styles.terminalHeader}>
            <span>OPERATIONAL_SYSTEM_FEED_LOG</span>
            <span className={styles.blink}>_</span>
          </div>
          <div className={styles.terminalLines}>
            {terminalLogs.map((log, i) => (
              <div key={i} className={styles.terminalLine}>
                {log}
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>
        </footer>
      </div>
    </div>
  );
};
export default MissionControlCms;
