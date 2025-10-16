export type DailySectionThemeKey = "lightWork" | "deepWork";

export interface SubtaskThemeConfig {
  colors: {
    text: string;
    border: string;
    input: string;
    textSecondary: string;
  };
}

export interface DailySectionTheme {
  id: DailySectionThemeKey;
  card: {
    text: string;
    background: string;
    border: string;
    surfaceMuted: string;
    divider: string;
    heading: string;
    subheading: string;
    body: string;
  };
  skeleton: {
    accent: string;
    accentSoft: string;
    muted: string;
    faint: string;
  };
  task: {
    containerBg: string;
    containerBorder: string;
    containerHoverBg: string;
    containerHoverBorder: string;
    containerHoverShadow: string;
    title: string;
    titleHover: string;
    input: string;
    toggleHoverBg: string;
    toggleIcon: string;
    statusIcon: {
      completed: string;
      inProgress: string;
    };
    progressText: string;
    progressHoverText: string;
  };
  button: {
    primaryBg: string;
    primaryHoverBg: string;
    ghostText: string;
    ghostHoverText: string;
    ghostBorder: string;
    ghostHoverBorder: string;
    ghostHoverBg: string;
  };
  subtask: SubtaskThemeConfig;
  metadata: {
    dueDateBase: string;
    timeInput: string;
    timeDisplay: string;
    moveButton: string;
    moveButtonHover: string;
    modalBackground: string;
    modalBorder: string;
    filterActive: string;
    filterInactive: string;
    filterCheck: string;
  };
}

export const dailySectionThemes: Record<DailySectionThemeKey, DailySectionTheme> = {
  lightWork: {
    id: "lightWork",
    card: {
      text: "text-green-50",
      background: "bg-green-900/20",
      border: "border-green-700/50",
      surfaceMuted: "bg-green-900/30",
      divider: "border-green-600/50",
      heading: "text-green-400",
      subheading: "text-green-300",
      body: "text-green-200",
    },
    skeleton: {
      accent: "bg-green-500/30",
      accentSoft: "bg-green-500/20",
      muted: "bg-green-400/20",
      faint: "bg-green-400/10",
    },
    task: {
      containerBg: "bg-green-900/10",
      containerBorder: "border-green-700/30",
      containerHoverBg: "hover:bg-green-900/15",
      containerHoverBorder: "hover:border-green-600/40",
      containerHoverShadow: "hover:shadow-green-500/5",
      title: "text-green-100",
      titleHover: "hover:text-green-50",
      input: "bg-green-900/40 text-green-100 border-green-600/50 focus:border-green-400",
      toggleHoverBg: "hover:bg-green-900/20",
      toggleIcon: "text-green-300",
      statusIcon: {
        completed: "text-green-400",
        inProgress: "text-green-400",
      },
      progressText: "text-green-400",
      progressHoverText: "hover:text-green-300",
    },
    button: {
      primaryBg: "bg-green-600",
      primaryHoverBg: "hover:bg-green-700",
      ghostText: "text-green-300",
      ghostHoverText: "hover:text-green-200",
      ghostBorder: "border-green-700/30",
      ghostHoverBorder: "hover:border-green-600/40",
      ghostHoverBg: "hover:bg-green-900/20",
    },
    subtask: {
      colors: {
        text: "text-green-400",
        border: "border-green-400",
        input: "border-gray-600 focus:border-green-400",
        textSecondary: "text-green-300",
      },
    },
    metadata: {
      dueDateBase: "text-green-200/80 bg-green-900/20 hover:bg-green-900/30",
      timeInput: "bg-green-900/40 text-green-100 border-green-600/50 focus:border-green-300",
      timeDisplay: "text-green-200/90 bg-green-900/20 hover:bg-green-900/30",
      moveButton: "border-green-700/40 text-green-300",
      moveButtonHover: "hover:bg-green-900/25",
      modalBackground: "bg-green-950/95",
      modalBorder: "border-green-700/60",
      filterActive: "bg-green-800/40 text-green-100",
      filterInactive: "text-green-200 hover:bg-green-800/30",
      filterCheck: "text-green-300",
    },
  },
  deepWork: {
    id: "deepWork",
    card: {
      text: "text-blue-50",
      background: "bg-blue-900/20",
      border: "border-blue-700/50",
      surfaceMuted: "bg-blue-900/30",
      divider: "border-blue-600/50",
      heading: "text-blue-400",
      subheading: "text-blue-300",
      body: "text-blue-200",
    },
    skeleton: {
      accent: "bg-blue-500/30",
      accentSoft: "bg-blue-500/20",
      muted: "bg-blue-400/20",
      faint: "bg-blue-400/10",
    },
    task: {
      containerBg: "bg-blue-900/10",
      containerBorder: "border-blue-700/30",
      containerHoverBg: "hover:bg-blue-900/15",
      containerHoverBorder: "hover:border-blue-600/40",
      containerHoverShadow: "hover:shadow-blue-500/5",
      title: "text-blue-100",
      titleHover: "hover:text-blue-50",
      input: "bg-blue-900/40 text-blue-100 border-blue-600/50 focus:border-blue-400",
      toggleHoverBg: "hover:bg-blue-900/20",
      toggleIcon: "text-blue-300",
      statusIcon: {
        completed: "text-green-400",
        inProgress: "text-blue-400",
      },
      progressText: "text-blue-400",
      progressHoverText: "hover:text-blue-300",
    },
    button: {
      primaryBg: "bg-blue-600",
      primaryHoverBg: "hover:bg-blue-700",
      ghostText: "text-blue-300",
      ghostHoverText: "hover:text-blue-200",
      ghostBorder: "border-blue-700/30",
      ghostHoverBorder: "hover:border-blue-600/40",
      ghostHoverBg: "hover:bg-blue-900/20",
    },
    subtask: {
      colors: {
        text: "text-blue-400",
        border: "border-blue-400",
        input: "border-gray-600 focus:border-blue-400",
        textSecondary: "text-blue-300",
      },
    },
    metadata: {
      dueDateBase: "text-blue-200/80 bg-blue-900/20 hover:bg-blue-900/30",
      timeInput: "bg-blue-900/40 text-blue-100 border-blue-600/60 focus:border-blue-300",
      timeDisplay: "text-blue-200/90 bg-blue-900/20 hover:bg-blue-900/30",
      moveButton: "border-blue-700/40 text-blue-300",
      moveButtonHover: "hover:bg-blue-900/25",
      modalBackground: "bg-blue-950/95",
      modalBorder: "border-blue-700/60",
      filterActive: "bg-blue-800/40 text-blue-100",
      filterInactive: "text-blue-200 hover:bg-blue-800/30",
      filterCheck: "text-blue-300",
    },
  },
};

export function getDailySectionTheme(section: DailySectionThemeKey): DailySectionTheme {
  return dailySectionThemes[section];
}
