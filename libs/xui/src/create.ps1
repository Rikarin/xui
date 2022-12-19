$name = $args[0]

nx g m $name

$module = "$($name)/$($name).module.ts"
(Get-Content $module).Replace('export class ', 'export class Xui') | Set-Content $module

New-Item $name/$name.types.ts
New-Item $name/index.ts
New-Item $name/index.scss
New-Item $name/variables.scss

Add-Content $name/index.ts "export * from './$name.types';"
Add-Content $name/index.ts "export * from './$name.module';"
Add-Content $name/$name.types.ts "export const _$NAME_PLACEHOLDER = 'PLACEHOLDER';"

# Generate Component
$args | ForEach-Object {
  nx g c $name/$_ --inline-style --skip-tests=true --change-detection=OnPush --flat --export

  # Remove empty styles: []
  $component = "$($name)/$($_).component.ts"
  Get-Content $component | Select-String -Pattern 'styles:' -NotMatch | Set-Content $component

  New-Item $name/$_.scss
  Add-Content $name/index.ts "export * from './$_.component';"
  Add-Content $name/$_.scss @"
@use 'variables' as *;
@use '../xui';

@mixin theme() {
  .x-$_ {

  }
}
"@
}


# Generate index.scss
$args | ForEach-Object {
  $uses += "@use '$_';`n"
}

$args | ForEach-Object {
  $includes += "  @include $_.theme();`n"
}

Add-Content $name/index.scss @"
@forward 'variables';

$uses
@mixin theme() {
$includes}
"@
