import React, { createContext, useContext, useState, useEffect } from 'react';
import { devlogs as initialLogs, type DevLog } from '../data/devlogs';
import { projects as initialProjects } from '../data/projects';
import defaultAvatar from '../assets/avatar-placeholder.png';

// Expanded Profile Data Interface for the About Editor
export interface ProfileData {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  description: string;
  skills: string; // Comma-separated list for easy user input editing
  technologies: string; // Comma-separated list for easy user input editing
  resumeLink: string;
  profileImage: string;
  status: string;
  experience: string;
  location: string;
}

// Project Data Interface
export interface ProjectData {
  id: string;
  name: string;
  size: 'flagship' | 'moon';
  orbitsParentId?: string;
  accentColor: string;
  blurb: string;
  githubUrl: string;
  imagePath: string;
}

// Contact Link Interface
export interface ContactLink {
  id: string;
  name: string;
  href: string;
  label: string;
}

// Full CMS State Interface
interface CmsContextType {
  activeProfileId: string;
  profiles: ProfileData[];
  activeProfile: ProfileData; // Helper getter for the active profile
  projects: ProjectData[];
  devlogs: DevLog[];
  contacts: ContactLink[];
  
  // Profile CRUD
  createProfile: (profile: ProfileData) => void;
  updateProfile: (id: string, profile: ProfileData) => void;
  deleteProfile: (id: string) => void;
  setActiveProfile: (id: string) => void;
  
  updateProjects: (projects: ProjectData[]) => void;
  updateDevlogs: (devlogs: DevLog[]) => void;
  updateContacts: (contacts: ContactLink[]) => void;
  resetToFactorySettings: () => void;
}

const CmsContext = createContext<CmsContextType | undefined>(undefined);

const PROFILES_LIST_KEY = 'cosmos_cms_profiles_list';
const ACTIVE_PROFILE_ID_KEY = 'cosmos_cms_active_profile_id';
const PROJECTS_KEY = 'cosmos_cms_projects';
const DEVLOGS_KEY = 'cosmos_cms_devlogs';
const CONTACTS_KEY = 'cosmos_cms_contacts';
const PROFILES_VERSION_KEY = 'cosmos_cms_profiles_version';
const PROFILES_VERSION = '4'; // Bump this whenever DEFAULT_PROFILES description changes

const DEFAULT_PROFILES: ProfileData[] = [
  {
    id: 'arjun-default',
    name: 'ARJUN V',
    title: 'OPERATOR DOSSIER // SECURE TERMINAL',
    subtitle: 'Cybersecurity and IoT Specialist',
    description: "Hello! I'm Arjun, a 2nd year Computer Science & Engineering student at EPCET, Bengaluru. My passion for Space and cybersecurity began in 7th grade, and I am currently leveling up my skills in embedded systems and security systems.",
    skills: 'C/C++, Embedded Software, Network Security, Telemetry Ingestion, CanSat Systems, Scripting',
    technologies: 'React, Vite, GSAP, RTOS, Linux Kernel, Git, Canvas API',
    resumeLink: '#',
    profileImage: defaultAvatar,
    status: 'ONLINE // ACTIVE DUTY',
    experience: '2 Years Academic & Projects',
    location: 'Bangalore, India'
  },
  {
    id: 'guest-commander',
    name: 'GUEST COMMANDER',
    title: 'MISSION ARCHITECT // TEMPLATE',
    subtitle: 'Cloud Architect & DevOps Engineer',
    description: 'Welcome to the simulator. This is a secondary profile template that can be toggled in the CMS. It demonstrates multi-profile swap capabilities in the cosmic workspace.',
    skills: 'Cloud Infrastructure, Kubernetes Orchestration, CI/CD Automations, Docker, Security Auditing',
    technologies: 'AWS Cloud, Terraform, Go Lang, Python, Bash Scripting, Prometheus Monitoring',
    resumeLink: '#',
    profileImage: defaultAvatar,
    status: 'SIMULATION RUNNING',
    experience: '5 Years Enterprise',
    location: 'Remote Orbit / Earth'
  }
];

const DEFAULT_CONTACTS: ContactLink[] = [
  {
    id: 'email',
    name: 'Email',
    href: 'mailto:arjun.v@example.com',
    label: 'Establish direct secure email transmission'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    href: '#',
    label: 'Establish connection via LinkedIn'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    href: '#',
    label: 'Establish connection via Instagram'
  },
  {
    id: 'github',
    name: 'GitHub',
    href: 'https://github.com/Arjun0r1gin',
    label: 'Explore engineering archive on GitHub'
  },
  {
    id: 'x',
    name: 'X',
    href: '#',
    label: 'Establish connection via X'
  }
];

export const CmsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeProfileId, setActiveProfileIdState] = useState<string>('arjun-default');
  const [profiles, setProfilesState] = useState<ProfileData[]>([]);
  const [projects, setProjectsState] = useState<ProjectData[]>([]);
  const [devlogs, setDevlogsState] = useState<DevLog[]>([]);
  const [contacts, setContactsState] = useState<ContactLink[]>(DEFAULT_CONTACTS);

  // Initialize data on mount
  useEffect(() => {
    // 1. Profiles & Active Profile ID
    const savedActiveId = localStorage.getItem(ACTIVE_PROFILE_ID_KEY);
    const savedProfiles = localStorage.getItem(PROFILES_LIST_KEY);
    const savedVersion = localStorage.getItem(PROFILES_VERSION_KEY);

    // Force-reset if version mismatch (description/defaults changed)
    const isStale = savedVersion !== PROFILES_VERSION;

    if (!isStale && savedActiveId && savedProfiles) {
      try {
        setProfilesState(JSON.parse(savedProfiles));
        setActiveProfileIdState(savedActiveId);
      } catch (e) {
        console.error('Failed to parse saved profiles data', e);
        setProfilesState(DEFAULT_PROFILES);
        setActiveProfileIdState('arjun-default');
        localStorage.setItem(PROFILES_LIST_KEY, JSON.stringify(DEFAULT_PROFILES));
        localStorage.setItem(ACTIVE_PROFILE_ID_KEY, 'arjun-default');
        localStorage.setItem(PROFILES_VERSION_KEY, PROFILES_VERSION);
      }
    } else {
      setProfilesState(DEFAULT_PROFILES);
      setActiveProfileIdState('arjun-default');
      localStorage.setItem(PROFILES_LIST_KEY, JSON.stringify(DEFAULT_PROFILES));
      localStorage.setItem(ACTIVE_PROFILE_ID_KEY, 'arjun-default');
      localStorage.setItem(PROFILES_VERSION_KEY, PROFILES_VERSION);
    }

    // 2. Projects
    const savedProjects = localStorage.getItem(PROJECTS_KEY);
    if (savedProjects) {
      try {
        setProjectsState(JSON.parse(savedProjects));
      } catch (e) {
        console.error('Failed to parse saved projects', e);
      }
    } else {
      const castProjects = initialProjects as ProjectData[];
      setProjectsState(castProjects);
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(castProjects));
    }

    // 3. DevLogs
    const savedDevlogs = localStorage.getItem(DEVLOGS_KEY);
    if (savedDevlogs) {
      try {
        setDevlogsState(JSON.parse(savedDevlogs));
      } catch (e) {
        console.error('Failed to parse saved devlogs', e);
      }
    } else {
      setDevlogsState(initialLogs);
      localStorage.setItem(DEVLOGS_KEY, JSON.stringify(initialLogs));
    }

    // 4. Contacts
    const savedContacts = localStorage.getItem(CONTACTS_KEY);
    if (savedContacts) {
      try {
        setContactsState(JSON.parse(savedContacts));
      } catch (e) {
        console.error('Failed to parse saved contacts', e);
      }
    } else {
      localStorage.setItem(CONTACTS_KEY, JSON.stringify(DEFAULT_CONTACTS));
    }
  }, []);

  // Get current active profile
  const activeProfile = profiles.find((p) => p.id === activeProfileId) || DEFAULT_PROFILES[0];

  // Profile CRUD
  const createProfile = (newProfile: ProfileData) => {
    const updated = [...profiles, newProfile];
    setProfilesState(updated);
    localStorage.setItem(PROFILES_LIST_KEY, JSON.stringify(updated));
  };

  const updateProfile = (id: string, updatedProfile: ProfileData) => {
    const updated = profiles.map((p) => (p.id === id ? updatedProfile : p));
    setProfilesState(updated);
    localStorage.setItem(PROFILES_LIST_KEY, JSON.stringify(updated));
  };

  const deleteProfile = (id: string) => {
    // Prevent deleting the last remaining profile
    if (profiles.length <= 1) {
      return;
    }
    const updated = profiles.filter((p) => p.id !== id);
    setProfilesState(updated);
    localStorage.setItem(PROFILES_LIST_KEY, JSON.stringify(updated));

    // If we deleted the currently active profile, select the first available one as active
    if (activeProfileId === id) {
      const nextActiveId = updated[0].id;
      setActiveProfileIdState(nextActiveId);
      localStorage.setItem(ACTIVE_PROFILE_ID_KEY, nextActiveId);
    }
  };

  const setActiveProfile = (id: string) => {
    setActiveProfileIdState(id);
    localStorage.setItem(ACTIVE_PROFILE_ID_KEY, id);
  };

  const updateProjects = (newProjects: ProjectData[]) => {
    setProjectsState(newProjects);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(newProjects));
  };

  const updateDevlogs = (newLogs: DevLog[]) => {
    setDevlogsState(newLogs);
    localStorage.setItem(DEVLOGS_KEY, JSON.stringify(newLogs));
  };

  const updateContacts = (newContacts: ContactLink[]) => {
    setContactsState(newContacts);
    localStorage.setItem(CONTACTS_KEY, JSON.stringify(newContacts));
  };

  const resetToFactorySettings = () => {
    setProfilesState(DEFAULT_PROFILES);
    setActiveProfileIdState('arjun-default');
    localStorage.setItem(PROFILES_LIST_KEY, JSON.stringify(DEFAULT_PROFILES));
    localStorage.setItem(ACTIVE_PROFILE_ID_KEY, 'arjun-default');

    const castProjects = initialProjects as ProjectData[];
    setProjectsState(castProjects);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(castProjects));

    setDevlogsState(initialLogs);
    localStorage.setItem(DEVLOGS_KEY, JSON.stringify(initialLogs));

    setContactsState(DEFAULT_CONTACTS);
    localStorage.setItem(CONTACTS_KEY, JSON.stringify(DEFAULT_CONTACTS));
  };

  return (
    <CmsContext.Provider
      value={{
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
      }}
    >
      {children}
    </CmsContext.Provider>
  );
};

export const useCms = () => {
  const context = useContext(CmsContext);
  if (context === undefined) {
    throw new Error('useCms must be used within a CmsProvider');
  }
  return context;
};
