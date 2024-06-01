# &lt;delete-account&gt;

A simple custom component that helps the user to delete an account.

## Attributes

- `user-id` insert the user id as an attribute to be sent by the custom event.

```html
<delete-account user-id="123456"></delete-account>
```
## Custom-Events

### `deleteAccount`

Is called when the user wants to delete their account after several confirmations.
