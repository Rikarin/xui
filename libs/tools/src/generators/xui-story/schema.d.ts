export interface XuiStoryGeneratorSchema {
  project: string;
  componentName: string;
  /** Whether the story renders an element selector or an attribute directive. */
  kind?: 'component' | 'directive';
}
