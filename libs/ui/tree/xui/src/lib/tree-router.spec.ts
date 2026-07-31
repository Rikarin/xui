import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { expectAttributes, render } from '@xui/testing';
import { XuiTreeImports } from '../index';
import type { XuiTreeNode } from './tree.types';

/** A documentation sidebar: sections that are themselves pages, with pages under them. */
const NODES: XuiTreeNode[] = [
  {
    id: 'docs',
    label: 'Docs',
    data: { link: '/docs' },
    children: [
      {
        id: 'ecs',
        label: 'ECS',
        data: { link: '/docs/ecs' },
        children: [{ id: 'queries', label: 'Queries', data: { link: '/docs/ecs/queries' } }]
      },
      { id: 'rendering', label: 'Rendering', data: { link: '/docs/rendering' } }
    ]
  },
  { id: 'tools', label: 'Tools', data: { link: '/tools' } }
];

@Component({ template: '', standalone: true })
class Blank {}

const ROUTES = [{ path: '**', component: Blank }];

const rowById = (id: string) => document.querySelector(`[data-node-id="${id}"]`) as HTMLElement;

const setup = async (url: string, template = '<xui-tree xuiTreeRouter [nodes]="props().nodes" />') => {
  const result = render<{ nodes: XuiTreeNode[] }>(template, {
    imports: [XuiTreeImports],
    props: { nodes: NODES },
    providers: [provideRouter(ROUTES)]
  });

  await TestBed.inject(Router).navigateByUrl(url);
  result.detect();

  return result;
};

describe('XuiTreeRouter', () => {
  afterEach(() => sessionStorage.clear());

  it('marks the node whose link is the current URL', async () => {
    await setup('/docs/ecs/queries');

    expectAttributes(rowById('queries'), { 'aria-current': 'page' });
    expect(rowById('ecs').hasAttribute('aria-current')).toBe(false);
  });

  it('opens the ancestors so the current node is on screen', async () => {
    // Nothing is flagged `isExpanded`, so without the reveal `queries` would not
    // be rendered at all.
    await setup('/docs/ecs/queries');

    expect(rowById('docs')).toBeTruthy();
    expect(rowById('ecs')).toBeTruthy();
    expect(rowById('queries')).toBeTruthy();
  });

  it('prefers the deepest match over the section that merely prefixes it', async () => {
    await setup('/docs/ecs');

    expectAttributes(rowById('ecs'), { 'aria-current': 'page' });
    expect(rowById('docs').hasAttribute('aria-current')).toBe(false);
  });

  it('lights up the section while you are on a page inside it', async () => {
    // `/docs/rendering/materials` is not itself a node; the closest one is.
    await setup('/docs/rendering/materials');

    expectAttributes(rowById('rendering'), { 'aria-current': 'page' });
  });

  it('requires the whole URL when told to match exactly', async () => {
    await setup('/docs/rendering/materials', '<xui-tree xuiTreeRouter match="exact" [nodes]="props().nodes" />');

    expect(document.querySelector('[aria-current="page"]')).toBeNull();
  });

  it('marks nothing when the URL is nowhere in the tree', async () => {
    await setup('/somewhere-else');

    expect(document.querySelector('[aria-current="page"]')).toBeNull();
  });

  it('remembers what is open under a persist key', async () => {
    await setup('/docs/ecs', '<xui-tree xuiTreeRouter persistKey="nav" [nodes]="props().nodes" />');

    expect(JSON.parse(sessionStorage.getItem('xui-tree:nav') ?? '[]')).toContain('docs');
  });

  it('opens what was remembered, over what the flags asked for', async () => {
    sessionStorage.setItem('xui-tree:nav', JSON.stringify(['docs', 'ecs']));

    await setup('/tools', '<xui-tree xuiTreeRouter persistKey="nav" [nodes]="props().nodes" />');

    expect(rowById('queries')).toBeTruthy();
  });
});
