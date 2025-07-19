import languages from "./languages";

const lang = {
  message: {
    hello: "hello world",
  },
  menu: {
    top: "Home",
    mypage: "MyPage",
    signin: "SignIn",
    signout: "SignOut",
    about: "Abount",
  },
  settings: {
    title: "Settings",
    appSettings: {
      title: "App Settings",
      description: "Configure application settings",
      language: {
        label: "Display Language",
        placeholder: "Select a language",
        description: "Select your preferred display language for the application",
      },
    },
    apiKeys: {
      title: "API Key Settings",
      description: "Configure API keys for external services",
    },
    notifications: {
      success: "Settings saved",
      error: "Failed to save settings",
    },
  },
  languages,
};

export default lang;
