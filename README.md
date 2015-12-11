# Introducing the `observe` directive

Subscribe to an observable and render different markup depending on the observable's state.

### Example with all four states defined:

Here, `angular-observe` will convert `$scope.observable` into an `Observable` and subscribe to that observable.

```html
<div async-bind="observable">
    <loading>Loading...</loading>
    <active>The latest value is: <code>{{$value}}</code>.</active>
    <complete>The observable completed. It's final value was <code>{{$value}}</code>.</complete>
    <error>The observable fired an error with the message: <code>{{$error.message}}</code>.</error>
</div>
```

### Example using only the implicit `active` state and default scope alias

```html
<div async-bind="observable">
    <span>Current value: <code>{{$value}}</code></span>
</div>
```

### Example using only the implicit `active` state and a custom scope alias

```html
<div async-bind="observable as currentValue">
    <span>Current value: <code>{{currentValue}}</code></span>
</div>
```

### Example traversing a tree of higher-order `Observable`s

```html
<div async-bind="currentUser$.posts$.0.title as latestBlogTitle">
    <span>The current user's latest blog post as the title: {{latestBlogTitle}}</span>
</div>
```


## How it works

The `observe` directive will `subscribe` to an `Observable` and will render different content depending on the state of that `Observable`.
The different states are as follows:

State | Explanation
----- | -----------
`loading` | The `Observable` has not yet yielded its first value.
`active` | The `Observable` has yielded at least one value but has not yet completed or errored. The current value is available in the scope as `$value` or the provided `alias`.
`error` | The `Observable` has errored. If a previous valid value was yielded, that will still be available on `$value` or the provided `alias`. The error will be available as `$error`.
`complete` | The `Observable` has completed. If a previous valid value was yielded, that will still be available on `$value` or the provided `alias`.

Each of the following states can have its own markup nested in an element with the same name as the state. For example, to show the current value, you would use:

```html
<div async-bind="observable">
    <active>Currrent value: {{$value}}</active>
</div>
```