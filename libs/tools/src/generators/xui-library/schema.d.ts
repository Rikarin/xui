export interface XuiLibraryGeneratorSchema {
  name: string;
  story?: boolean;
  generate?: 'component' | 'directive' | 'none';
}
