# Project Instructions

## React Components

1. Use only functional React components.
2. Prefer arrow functions for all function declarations and expressions.
3. Do not create class-based React components.
4. Do not use `React.FC` or `React.FunctionComponent`.
5. Follow the **one component per file** principle:
   - Each `.tsx` file must contain only one React component declaration.
   - Do not declare additional React components inside another component.
   - Extract additional components into separate files.
   - Helper functions, hooks, and type definitions are allowed in component files when directly related to that component.

## TypeScript

1. Prefer `type` aliases over `interface` for defining types.
2. Use `type` for component props, data models, function signatures, and reusable type definitions.
3. Avoid `interface` unless explicitly required by a third-party API or an existing integration contract.

## Component Props

1. Always define component props using a type alias named `Props`.
2. Declare the `Props` type using the following pattern:

   ```tsx
   type Props = {
     title: string;
     isActive?: boolean;
   };
   ```

3. Always declare React components using the following signature:

   ```tsx
   const SomeComponent = (props: Props) => {
     return <div>{props.title}</div>;
   };
   ```

4. Do not destructure props in the component function signature or body.
5. Access props explicitly through the `props` object (for example, `props.title` and `props.isActive`).

## Event Handlers

1. Always extract event handling logic into a separate named function.
2. Prefer arrow functions for event handlers.
3. Define event handlers outside JSX markup.
4. Use descriptive handler names such as `handleClick`, `handleSubmit`, or `handleInputChange`.
5. Pass function references to event props instead of implementing functions inline.
6. Do not use inline arrow functions or anonymous function expressions as event handlers in JSX.
7. If an event handler requires arguments, create a dedicated handler or extract the relevant UI into a separate component.

## JSX Rules

1. JSX must only describe the UI structure and reference existing functions and values.
2. Do not declare or implement functions inside JSX.
3. Do not use inline arrow functions or anonymous function expressions inside JSX attributes or expressions.
4. Keep event handling and non-trivial business logic outside JSX.
5. Calls to previously declared functions are allowed when their execution during rendering is intentional and they do not cause side effects.

## Code Examples

### Correct

```tsx
type Props = {
  title: string;
  onAction: () => void;
};

export const ActionButton = (props: Props) => {
  const handleClick = () => {
    props.onAction();
  };

  return (
    <button onClick={handleClick}>
      {props.title}
    </button>
  );
};
```

### Incorrect: Inline Event Handler

```tsx
type Props = {
  onAction: () => void;
};

export const ActionButton = (props: Props) => {
  return (
    <button onClick={() => props.onAction()}>
      Click
    </button>
  );
};
```

### Incorrect: Function Implementation Inside JSX

```tsx
type Props = {
  items: string[];
};

export const ItemList = (props: Props) => {
  return (
    <ul>
      {props.items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
};
```

### Correct: Extracted Render Logic

```tsx
type Props = {
  items: string[];
};

export const ItemList = (props: Props) => {
  const renderItem = (item: string) => {
    return <li key={item}>{item}</li>;
  };

  return (
    <ul>
      {props.items.map(renderItem)}
    </ul>
  );
};
```

## Compliance

- Follow these conventions when creating new React components.
- Preserve these conventions when modifying existing components.
- Do not introduce code that violates these rules.
- If existing code violates these conventions, update it when directly relevant to the requested task.
- Avoid unrelated refactoring unless explicitly requested.
