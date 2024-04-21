# &lt;profile-selector&gt;

A Custom web component that displays up to 5 slotted profile images.

## Custom-Events

### `profileImageChanged`

Is called when the user picks a profile image, includes the img elements src value.

## Customization

Insert up to 5 img elements with slot attributes to fill the component.

`slot="profile#"` - The profile images to pick from, switch # to a number between 1-5.
`current` - The attribute put on the current image (the image to be shown at the top).

```html
<profile-selector>
  <img slot="profile1" src="./your/image/route/or/url.png" alt="first image" current>
  <img slot="profile2" src="./your/image/route/or/url.png" alt="second image">
  <img slot="profile3" src="./your/image/route/or/url.png" alt="third image">
  <img slot="profile4" src="./your/image/route/or/url.png" alt="fourth image">
  <img slot="profile5" src="./your/image/route/or/url.png" alt="fifth image">
</profile-selector>
```

## Example

<!--- ![Example](img/url.gif) --->
<!--- ![Example](img/url.png) --->