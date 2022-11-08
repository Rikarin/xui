export interface SettingsPage {
  // canExit: boolean;
  stateChanged: (state: boolean) => void;

  save(): Promise<boolean>;
  reset(): Promise<boolean>;
}
