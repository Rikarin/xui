import { animate, animation, keyframes, style } from '@angular/animations';

export const bounce = animation(
  animate(
    '300ms linear',
    keyframes([
      style({ transform: 'translate3d(-1px, 20px, 0)', offset: 0.1 }),
      style({ transform: 'translate3d(2px, -1px, 0)', offset: 0.2 }),
      style({ transform: 'translate3d(-20px, 2px, 0)', offset: 0.3 }),
      style({ transform: 'translate3d(4px, -2px, 0)', offset: 0.4 }),
      style({ transform: 'translate3d(-4px, -4px, 0)', offset: 0.5 }),
      style({ transform: 'translate3d(4px, 4px, 0)', offset: 0.6 }),
      style({ transform: 'translate3d(-4px, -4px, 0)', offset: 0.7 }),
      style({ transform: 'translate3d(2px, -2px, 0)', offset: 0.8 }),
      style({ transform: 'translate3d(-1px, -1px, 0)', offset: 0.9 })
    ])
  )
);

export const fadeOutBottom = animation(
  animate(
    '800ms ease-in-out',
    keyframes([
      style({ transform: 'translate3d(0, -50px, 0)', offset: 0.3 }),
      style({ transform: 'translate3d(0, -50px, 0)', offset: 0.5 }),
      style({ transform: 'translate3d(0, 150px, 0)', offset: 0.9 })
    ])
  )
);

export const fadeInBottom = animation(
  animate(
    '800ms ease-in-out',
    keyframes([
      style({ transform: 'translate3d(0, 150px, 0)', offset: 0 }),
      style({ transform: 'translate3d(0, -50px, 0)', offset: 0.3 }),
      style({ transform: 'translate3d(0, -50px, 0)', offset: 0.5 }),
      style({ transform: 'translate3d(0, 0, 0)', offset: 0.9 })
    ])
  )
);
