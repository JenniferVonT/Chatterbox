# &lt;delete-account&gt;

A simple custom component that helps the user to delete an account.

## Attributes

- `user-id` insert the user id as an attribute to be sent by the custom event.

```html
<delete-account user-id="123456"></delete-account>
```
## Custom-Events

### `deleteAccount`

Is called when the user wants to delete their account.
Includes the user-id to delete.

The user-id will be dispatched under `detail: { userID }`

#### example (to get payload):
```javascript
// First pass the custom event through an eventlistener to the method handling said event.
const data = event.detail
const userID = data.userID
```

## Example

<!--- ![Example](insert example img) --->
<!--- ![Example](insert example gif) --->