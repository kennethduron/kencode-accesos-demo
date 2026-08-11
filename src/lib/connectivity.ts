export interface InstallEnvironment {
  userAgent: string;
  navigatorStandalone?: boolean;
  displayModeStandalone?: boolean;
}

export function isOnlineState(value: boolean | undefined): boolean {
  return value !== false;
}

export function isStandaloneMode(environment: InstallEnvironment): boolean {
  return environment.navigatorStandalone === true || environment.displayModeStandalone === true;
}

export function isIosSafari(environment: InstallEnvironment): boolean {
  const { userAgent } = environment;
  const iosDevice = /iPad|iPhone|iPod/i.test(userAgent)
    || (/Macintosh/i.test(userAgent) && /Mobile/i.test(userAgent));
  const competingBrowser = /CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo/i.test(userAgent);
  return iosDevice && /Safari/i.test(userAgent) && !competingBrowser;
}

export function shouldShowIosInstallHelp(environment: InstallEnvironment): boolean {
  return isIosSafari(environment) && !isStandaloneMode(environment);
}
