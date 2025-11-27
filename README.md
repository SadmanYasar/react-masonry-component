# React Masonry Component

[![npm version](https://badge.fury.io/js/react-masonry-component.svg)](http://badge.fury.io/js/react-masonry-component)

A React.js Masonry component with full TypeScript support. Works with React 17, 18, and 19.

## Table of Contents

1. [Installation](#installation)
2. [Basic Usage](#basic-usage)
3. [TypeScript Support](#typescript-support)
4. [Props](#props)
5. [Custom Props](#custom-props)
6. [Accessing Masonry Instance](#accessing-masonry-instance)
7. [Images Loaded Options](#images-loaded-options)
8. [Events](#events)

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

## TypeScript Support

This package includes built-in TypeScript definitions. You can import the types directly:

```tsx
import Masonry, { MasonryProps, MasonryOptions, ImagesLoadedOptions } from 'react-masonry-component';

const options: MasonryOptions = {
  columnWidth: 200,
  gutter: 10,
  transitionDuration: 0
};

const imagesLoadedOptions: ImagesLoadedOptions = {
  background: '.my-bg-image-el'
};
```

### Available Types

- **`MasonryOptions`** - Configuration options for Masonry layout
- **`MasonryProps`** - Props for the Masonry component
- **`ImagesLoadedOptions`** - Options for imagesloaded library

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
