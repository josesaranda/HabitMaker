# HabitMakerUI

This library was generated with [Nx](https://nx.dev).

## Modal

The modal requires an accessible `label`. Pass the element that opens it to
`openFrom` so the entrance and exit transition use that element as their origin:

```html
<button #openModal type="button" (click)="modal.openFrom(openModal)">
  Open dialog
</button>

<hm-modal #modal label="Create a habit">
  <h2>Create a habit</h2>
  <p>Projected content is rendered inside the dialog.</p>
</hm-modal>
```

The modal uses a native modal dialog for keyboard and focus behavior, includes
an accessible close button, closes on Escape or backdrop click, and returns
focus to the opening element. Entrance and exit animations respect the user's
reduced-motion preference.

## Running unit tests

Run `nx test HabitMakerUI` to execute the unit tests.
