import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { XuiButtonImports } from '@xui/button';
import { XuiCalloutImports } from '@xui/callout';
import { XuiCardImports } from '@xui/card';
import { XuiFormFieldImports } from '@xui/form-field';
import { XuiInputImports } from '@xui/input';
import { XuiTextImports } from '@xui/text';
import { Session } from '../core/session';

/**
 * The one route outside the shell.
 *
 * It exists for the shape rather than the security — a guarded area needs somewhere to send you,
 * and somewhere to send you back from. Any password is accepted, and the callout says so rather
 * than leaving anyone guessing at a demo credential.
 */
@Component({
  selector: 'app-sign-in',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    XuiButtonImports,
    XuiCalloutImports,
    XuiCardImports,
    XuiFormFieldImports,
    XuiInputImports,
    XuiTextImports
  ],
  host: { class: 'grid min-h-svh place-items-center p-4' },
  template: `
    <div class="w-full max-w-sm">
      <div class="mb-6 flex items-center justify-center gap-2">
        <span class="bg-primary text-primary-foreground grid size-8 place-items-center rounded-lg font-semibold">
          N
        </span>
        <span class="text-lg font-semibold">Northwind Admin</span>
      </div>

      <div xuiCard [elevation]="2" class="p-6">
        <h1 xuiHeading [level]="2" class="mb-1 text-xl">Sign in</h1>
        <p xuiText color="muted" size="sm" class="mb-5">Welcome back. Pick up where you left off.</p>

        <form class="space-y-4" (ngSubmit)="submit()">
          <xui-form-field label="Email" [intent]="emailError() ? 'danger' : 'none'">
            <input
              xuiInput
              name="email"
              type="email"
              autocomplete="username"
              class="w-full"
              placeholder="you@northwind.example"
              [(ngModel)]="email"
            />
            @if (emailError()) {
              <xui-error>{{ emailError() }}</xui-error>
            }
          </xui-form-field>

          <xui-form-field label="Password">
            <input
              xuiInput
              name="password"
              type="password"
              autocomplete="current-password"
              class="w-full"
              placeholder="••••••••"
              [(ngModel)]="password"
            />
          </xui-form-field>

          <button xuiButton type="submit" size="lg" class="w-full" [disabled]="busy()">
            {{ busy() ? 'Signing in…' : 'Sign in' }}
          </button>
        </form>
      </div>

      <xui-callout color="none" class="mt-4">
        <p xuiText size="sm">
          A demonstration, so there is nothing to get wrong: any email and any password will let you in.
        </p>
      </xui-callout>
    </div>
  `
})
export class SignIn {
  protected readonly email = signal('priya@northwind.example');
  protected readonly password = signal('demo');
  protected readonly busy = signal(false);
  protected readonly emailError = signal('');

  private readonly session = inject(Session);
  private readonly router = inject(Router);

  protected submit(): void {
    const email = this.email().trim();

    if (!email.includes('@')) {
      this.emailError.set('That does not look like an email address.');

      return;
    }

    this.emailError.set('');
    this.busy.set(true);

    // A beat of latency, so the disabled state is something you can actually see happen.
    setTimeout(() => {
      this.session.signIn(email);
      this.busy.set(false);

      const next = new URLSearchParams(location.search).get('next');

      void this.router.navigateByUrl(next && next !== '/sign-in' ? next : '/dashboard');
    }, 350);
  }
}
