export interface SettingsPage {
  // canExit: boolean;
  stateChanged: (state: boolean) => void;

  save(): Promise<void>;
  reset(): Promise<void>;
}
