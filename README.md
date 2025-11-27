# React Masonry Component

[![npm version](https://badge.fury.io/js/react-masonry-component.svg)](http://badge.fury.io/js/react-masonry-component)

A React.js Masonry component with full TypeScript support. Works with React 17, 18, and 19. **SSR compatible** with Next.js and other server-side rendering frameworks.

## Table of Contents

1. [Installation](#installation)
2. [Basic Usage](#basic-usage)
3. [Server-Side Rendering (SSR)](#server-side-rendering-ssr)
4. [Responsive Masonry](#responsive-masonry)
5. [TypeScript Support](#typescript-support)
6. [Props](#props)
7. [Custom Props](#custom-props)
8. [Accessing Masonry Instance](#accessing-masonry-instance)
9. [Images Loaded Options](#images-loaded-options)
10. [Events](#events)

## Installation

```bash
npm install --save react-masonry-component
```

The component is bundled with Masonry, so no additional dependencies are needed!

## Basic Usage

```tsx
import React from 'react';
import Masonry from 'react-masonry-component';

const masonryOptions = {
  transitionDuration: 0
};

const imagesLoadedOptions = { background: '.my-bg-image-el' };

interface Element {
  src: string;
}

interface GalleryProps {
  elements: Element[];
}

function Gallery({ elements }: GalleryProps) {
  return (
    <Masonry
      className="my-gallery-class"    // default ''
      elementType="ul"                 // default 'div'
      options={masonryOptions}         // default {}
      disableImagesLoaded={false}      // default false
      updateOnEachImageLoad={false}    // default false and works only if disableImagesLoaded is false
      imagesLoadedOptions={imagesLoadedOptions} // default {}
    >
      {elements.map((element, index) => (
        <li key={index} className="image-element-class">
          <img src={element.src} alt="" />
        </li>
      ))}
    </Masonry>
  );
}

export default Gallery;
```

## Server-Side Rendering (SSR)

This component is fully compatible with server-side rendering frameworks like **Next.js**. The component safely handles the `window` object and browser-only dependencies, so you won't encounter "window is not defined" errors during SSR.

### Next.js Usage

Simply import and use the component - no special configuration needed:

```tsx
// app/page.tsx or pages/gallery.tsx
"use client"; // For Next.js 13+ App Router

import Masonry from '@sy17/react-masonry-component';

export default function Gallery() {
  return (
    <Masonry className="my-gallery">
      <div className="item">Item 1</div>
      <div className="item">Item 2</div>
      <div className="item">Item 3</div>
    </Masonry>
  );
}
```

## Responsive Masonry

Use the `ResponsiveMasonry` component to automatically adjust the layout based on viewport width breakpoints:

```tsx
import React from 'react';
import Masonry, { ResponsiveMasonry } from '@sy17/react-masonry-component';

function Gallery() {
  return (
    <ResponsiveMasonry
      columnsCountBreakPoints={{ 300: 2, 500: 3, 700: 5, 900: 6 }}
      className="p-5"
    >
      {(columnsCount) => (
        <Masonry options={{ columnWidth: `${100 / columnsCount}%` }}>
          <div className="item">Item 1</div>
          <div className="item">Item 2</div>
          <div className="item">Item 3</div>
        </Masonry>
      )}
    </ResponsiveMasonry>
  );
}

export default Gallery;
```

### ResponsiveMasonry Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columnsCountBreakPoints` | `{ [breakpoint: number]: number }` | `{ 350: 1, 750: 2, 900: 3 }` | Breakpoint configuration for responsive columns. Keys are minimum viewport widths in pixels, values are column counts. |
| `children` | `ReactNode \| ((columnsCount: number) => ReactNode)` | - | Children to render. Can be a render prop function that receives the current column count. |

### How Breakpoints Work

The component uses the column count for the largest matching breakpoint. For example, with `{ 300: 2, 500: 3, 700: 5 }`:

- Viewport width < 300px: 1 column (default)
- Viewport width 300-499px: 2 columns
- Viewport width 500-699px: 3 columns
- Viewport width >= 700px: 5 columns

## TypeScript Support

This package includes built-in TypeScript definitions. You can import the types directly:

```tsx
import Masonry, { 
  MasonryProps, 
  MasonryOptions, 
  ImagesLoadedOptions,
  ResponsiveMasonry,
  ResponsiveMasonryProps,
  ColumnsCountBreakPoints
} from '@sy17/react-masonry-component';

const options: MasonryOptions = {
  columnWidth: 200,
  gutter: 10,
  transitionDuration: 0
};

const imagesLoadedOptions: ImagesLoadedOptions = {
  background: '.my-bg-image-el'
};

const breakpoints: ColumnsCountBreakPoints = {
  300: 2,
  500: 3,
  700: 5
};
```

### Available Types

- **`MasonryOptions`** - Configuration options for Masonry layout
- **`MasonryProps`** - Props for the Masonry component
- **`ImagesLoadedOptions`** - Options for imagesloaded library
- **`ResponsiveMasonryProps`** - Props for the ResponsiveMasonry component
- **`ColumnsCountBreakPoints`** - Type for responsive breakpoint configuration

### MasonryOptions

```typescript
interface MasonryOptions {
  columnWidth?: number | string | HTMLElement | null;
  itemSelector?: string;
  gutter?: number | string;
  percentPosition?: boolean;
  horizontalOrder?: boolean;
  stamp?: string;
  fitWidth?: boolean;
  originLeft?: boolean;
  originTop?: boolean;
  containerStyle?: Record<string, string>;
  transitionDuration?: number | string;
  resize?: boolean;
  initLayout?: boolean;
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `elementType` | `ElementType` | `'div'` | The element type to render as the container |
| `options` | `MasonryOptions` | `{}` | Masonry layout options |
| `disableImagesLoaded` | `boolean` | `false` | Disable imagesloaded library |
| `updateOnEachImageLoad` | `boolean` | `false` | Update layout on each image load |
| `imagesLoadedOptions` | `ImagesLoadedOptions` | `{}` | Options for imagesloaded library |
| `enableResizableChildren` | `boolean` | `false` | Enable resize detection on children |
| `onLayoutComplete` | `(items?: unknown[]) => void` | - | Callback when layout completes |
| `onRemoveComplete` | `(items?: unknown[]) => void` | - | Callback when item is removed |
| `onImagesLoaded` | `(instance: ImagesLoaded) => void` | - | Callback when images are loaded |

## Custom Props

You can pass any HTML attributes to the component, including inline styles and event handlers:

```tsx
import React from 'react';
import Masonry from 'react-masonry-component';

const style = {
  backgroundColor: 'tomato'
};

function Gallery() {
  const handleClick = () => {
    console.log('clicked');
  };

  return (
    <Masonry
      className="my-gallery-class"
      style={style}
      onClick={handleClick}
      data-testid="masonry-gallery"
    >
      {/* children */}
    </Masonry>
  );
}

export default Gallery;
```

## Accessing Masonry Instance

You can access the Masonry instance using refs:

```tsx
import React, { useRef, useEffect } from 'react';
import Masonry from 'react-masonry-component';

function Gallery() {
  const masonryRef = useRef<Masonry>(null);

  useEffect(() => {
    if (masonryRef.current?.masonry) {
      // Access the masonry instance
      const masonry = masonryRef.current.masonry;
      
      // Example: manually trigger layout
      masonry.layout();
    }
  }, []);

  return (
    <Masonry ref={masonryRef}>
      {/* children */}
    </Masonry>
  );
}

export default Gallery;
```

## Images Loaded Options

React Masonry Component uses Desandro's `imagesloaded` library to detect when images have loaded. Pass options via the `imagesLoadedOptions` prop.

This is commonly used for detecting when CSS background images have loaded:

```tsx
import React from 'react';
import Masonry from 'react-masonry-component';

function Gallery() {
  const imagesLoadedOptions = { background: '.my-bg-image-el' };
  
  return (
    <Masonry
      className="my-gallery-class"
      elementType="ul"
      imagesLoadedOptions={imagesLoadedOptions}
    >
      <li className="my-bg-image-el" style={{ backgroundImage: 'url(image.jpg)' }}></li>
    </Masonry>
  );
}

export default Gallery;
```

More info available on the [imagesloaded website](https://imagesloaded.desandro.com/#background).

## Events

The component provides three event callbacks:

- **`onImagesLoaded`** - Triggered when all images are loaded (or after each image when `updateOnEachImageLoad` is `true`)
- **`onLayoutComplete`** - Triggered after layout and positioning transitions complete
- **`onRemoveComplete`** - Triggered after an item element is removed

```tsx
import React, { useState } from 'react';
import Masonry from 'react-masonry-component';

function Gallery() {
  const [isVisible, setIsVisible] = useState(false);

  const handleImagesLoaded = () => {
    setIsVisible(true);
  };

  const handleLayoutComplete = (laidOutItems?: unknown[]) => {
    console.log('Layout complete', laidOutItems);
  };

  const handleRemoveComplete = (removedItems?: unknown[]) => {
    console.log('Remove complete', removedItems);
  };

  return (
    <Masonry
      onImagesLoaded={handleImagesLoaded}
      onLayoutComplete={handleLayoutComplete}
      onRemoveComplete={handleRemoveComplete}
      style={{ opacity: isVisible ? 1 : 0 }}
    >
      {/* children */}
    </Masonry>
  );
}

export default Gallery;
```

## License

MIT
