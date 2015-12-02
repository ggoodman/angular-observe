# Introducing the `observe` directive

Subscribe to an observable and render different markup depending on the observable's state.

### Example with all four states defined:

```html
<div async-bind="observable">
    <loading>Loading...</loading>
    <active>The latest value is: <code>{{$value}}</code>.</active>
    <complete>The observable completed. It's final value was <code>{{$value}}</code>.</complete>
    <error>The observable fired an error with the message: <code>{{$error.message}}</code>.</error>
</div>
```

### Example using only the implicit `active` state:

```html
<div async-bind="observable">
    <span>Current value: <code>{{$value}}</code></span>
</div>
```


## How it works

The `observe` directive will `subscribe` to an `Observable` and will render different content depending on the state of that `Observable`.
The different states are as follows:

State | Explanation
----- | -----------
`loading` | The `Observable` has not yet yielded its first value.
`active` | The `Observable` has yielded at least one value but has not yet completed or errored. The current value is available in the scope as `$value`.
`error` | The `Observable` has errored. If a previous valid value was yielded, that will still be available on `$value`. The error will be available as `$error`.
`complete` | The `Observable` has completed. If a previous valid value was yielded, that will still be available on `$value`.

Each of the following states can have its own markup nested in an element with the same name as the state. For example, to show the current value, you would use:

```html
<div async-bind="observable">
    <active>Currrent value: {{$value}}</active>
</div>
```