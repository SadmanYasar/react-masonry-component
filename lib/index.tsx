import React, { Component, createRef, ReactNode, HTMLAttributes, ElementType } from 'react';
import type { Erd } from 'element-resize-detector';
import type MasonryLayoutType from 'masonry-layout';
import type imagesloadedType from 'imagesloaded';

// Re-export namespace types for external use
type ImagesLoaded = imagesloadedType.ImagesLoaded;
type ImagesLoadedFn = typeof imagesloadedType;

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Lazy load browser-only dependencies to avoid SSR issues
// These modules access `window` at module evaluation time
let MasonryLayout: typeof MasonryLayoutType | null = null;
let imagesloaded: ImagesLoadedFn | null = null;
let elementResizeDetectorMaker: typeof import('element-resize-detector') | null = null;

if (isBrowser) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  MasonryLayout = require('masonry-layout');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  imagesloaded = require('imagesloaded');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  elementResizeDetectorMaker = require('element-resize-detector');
}

// Type definitions for masonry-layout
declare global {
  interface Window {
    Masonry?: typeof MasonryLayoutType;
  }
}

/**
 * Options for configuring Masonry layout behavior
 */
export interface MasonryOptions {
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

/**
 * Options for imagesloaded library
 */
export interface ImagesLoadedOptions {
  background?: boolean | string;
}

/**
 * Props for the Masonry component
 */
export interface MasonryProps extends Omit<HTMLAttributes<HTMLElement>, 'ref'> {
  enableResizableChildren?: boolean;
  disableImagesLoaded?: boolean;
  updateOnEachImageLoad?: boolean;
  onImagesLoaded?: (instance: ImagesLoaded) => void;
  options?: MasonryOptions;
  imagesLoadedOptions?: ImagesLoadedOptions;
  elementType?: ElementType;
  onLayoutComplete?: (laidOutItems?: unknown[]) => void;
  onRemoveComplete?: (removedItems?: unknown[]) => void;
  children?: ReactNode;
}

interface DiffResult {
  old: Element[];
  new: Element[];
  removed: Element[];
  appended: Element[];
  prepended: Element[];
  moved: Element[];
  forceItemReload: boolean;
}

// Debounce utility function
function debounce<T extends (...args: Parameters<T>) => void>(
  func: T,
  wait: number
): T & { cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  const debounced = function(this: unknown, ...args: Parameters<T>) {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func.apply(this, args);
      timeoutId = null;
    }, wait);
  } as T & { cancel: () => void };
  
  debounced.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };
  
  return debounced;
}

// Get Masonry constructor (prefer window.Masonry if available for compatibility)
function getMasonryConstructor() {
  if (!isBrowser) return null;
  return window.Masonry || MasonryLayout;
}

// Get imagesloaded library
function getImagesLoaded() {
  if (!isBrowser) return null;
  return imagesloaded;
}

// Get element resize detector
function getElementResizeDetectorMaker() {
  if (!isBrowser) return null;
  return elementResizeDetectorMaker;
}

/**
 * React component wrapper for Masonry layout library
 */
class MasonryComponent extends Component<MasonryProps> {
  static displayName = 'MasonryComponent';

  static defaultProps: Partial<MasonryProps> = {
    enableResizableChildren: false,
    disableImagesLoaded: false,
    updateOnEachImageLoad: false,
    options: {},
    imagesLoadedOptions: {},
    className: '',
    elementType: 'div',
    onLayoutComplete: () => {},
    onRemoveComplete: () => {},
  };

  public masonry: MasonryLayoutType | null = null;
  private erd: Erd | null = null;
  private latestKnownDomChildren: Element[] = [];
  private imagesLoadedCancelRef?: () => void;
  private masonryContainerRef = createRef<HTMLElement>();

  private get masonryContainer(): HTMLElement | null {
    return this.masonryContainerRef.current;
  }

  componentDidMount(): void {
    this.initializeMasonry();
    this.initializeResizableChildren();
    this.imagesLoaded();
  }

  componentDidUpdate(): void {
    this.performLayout();
    this.imagesLoaded();
  }

  componentWillUnmount(): void {
    this.destroyErd();

    // Unregister events
    if (this.props.onLayoutComplete && this.masonry) {
      this.masonry.off('layoutComplete', this.props.onLayoutComplete);
    }

    if (this.props.onRemoveComplete && this.masonry) {
      this.masonry.off('removeComplete', this.props.onRemoveComplete);
    }

    if (this.imagesLoadedCancelRef) {
      this.derefImagesLoaded();
    }

    if (this.masonry) {
      this.masonry.destroy();
    }
  }

  private initializeMasonry(force?: boolean): void {
    const Masonry = getMasonryConstructor();
    if (!Masonry || !this.masonryContainer) {
      return;
    }

    if (!this.masonry || force) {
      this.masonry = new Masonry(
        this.masonryContainer,
        this.props.options
      );

      if (this.props.onLayoutComplete) {
        this.masonry.on('layoutComplete', this.props.onLayoutComplete);
      }

      if (this.props.onRemoveComplete) {
        this.masonry.on('removeComplete', this.props.onRemoveComplete);
      }

      this.latestKnownDomChildren = this.getCurrentDomChildren();
    }
  }

  private getCurrentDomChildren(): Element[] {
    const node = this.masonryContainer;
    if (!node) return [];
    
    const children = this.props.options?.itemSelector 
      ? node.querySelectorAll(this.props.options.itemSelector) 
      : node.children;
    return Array.prototype.slice.call(children);
  }

  private diffDomChildren(): DiffResult {
    let forceItemReload = false;

    const knownChildrenStillAttached = this.latestKnownDomChildren.filter((element) => {
      /*
       * Take only elements attached to DOM
       * (aka the parent is the masonry container, not null)
       * otherwise masonry would try to "remove it" again from the DOM
       */
      return !!element.parentNode;
    });

    /*
     * If not all known children are attached to the dom - we have no other way of notifying
     * masonry to remove the ones not still attached besides invoking a complete item reload.
     * Basically all the rest of the code below does not matter in that case.
     */
    if (knownChildrenStillAttached.length !== this.latestKnownDomChildren.length) {
      forceItemReload = true;
    }

    const currentDomChildren = this.getCurrentDomChildren();

    /*
     * Since we are looking for a known child which is also attached to the dom AND
     * not attached to the dom at the same time - this would *always* produce an empty array.
     */
    const removed = knownChildrenStillAttached.filter((attachedKnownChild) => {
      return currentDomChildren.indexOf(attachedKnownChild) === -1;
    });

    /*
     * This would get any children which are attached to the dom but are *unknown* to us
     * from previous renders
     */
    const newDomChildren = currentDomChildren.filter((currentChild) => {
      return knownChildrenStillAttached.indexOf(currentChild) === -1;
    });

    let beginningIndex = 0;

    // Get everything added to the beginning of the DOMNode list
    const prepended = newDomChildren.filter((newChild) => {
      const prepend = beginningIndex === currentDomChildren.indexOf(newChild);

      if (prepend) {
        // Increase the index
        beginningIndex++;
      }

      return prepend;
    });

    // We assume that everything else is appended
    const appended = newDomChildren.filter((el) => {
      return prepended.indexOf(el) === -1;
    });

    // Get everything added to the end of the DOMNode list
    let moved: Element[] = [];

    /*
     * This would always be true (see above about the logic for "removed")
     */
    if (removed.length === 0) {
      /*
       * 'moved' will contain some random elements (if any) since the "knownChildrenStillAttached" is a filter
       * of the "known" children which are still attached - All indexes could basically change. (for example
       * if the first element is not attached)
       * Don't trust this array.
       */
      moved = knownChildrenStillAttached.filter((child, index) => {
        return index !== currentDomChildren.indexOf(child);
      });
    }

    this.latestKnownDomChildren = currentDomChildren;

    return {
      old: knownChildrenStillAttached, // Not used
      new: currentDomChildren, // Not used
      removed,
      appended,
      prepended,
      moved,
      forceItemReload,
    };
  }

  private performLayout(): void {
    if (!this.masonry) return;

    const diff = this.diffDomChildren();
    let reloadItems = diff.forceItemReload || diff.moved.length > 0;

    // Would never be true. (see comments of 'diffDomChildren' about 'removed')
    if (diff.removed.length > 0) {
      if (this.props.enableResizableChildren && this.erd) {
        diff.removed.forEach((el) => this.erd!.removeAllListeners(el as HTMLElement));
      }
      this.masonry.remove(diff.removed);
      reloadItems = true;
    }

    if (diff.appended.length > 0) {
      this.masonry.appended(diff.appended);

      if (diff.prepended.length === 0) {
        reloadItems = true;
      }

      if (this.props.enableResizableChildren) {
        diff.appended.forEach((el) => this.listenToElementResize(el as HTMLElement));
      }
    }

    if (diff.prepended.length > 0) {
      this.masonry.prepended(diff.prepended);

      if (this.props.enableResizableChildren) {
        diff.prepended.forEach((el) => this.listenToElementResize(el as HTMLElement));
      }
    }

    if (reloadItems) {
      this.masonry.reloadItems();
    }

    this.masonry.layout();
  }

  private derefImagesLoaded(): void {
    if (this.imagesLoadedCancelRef) {
      this.imagesLoadedCancelRef();
      this.imagesLoadedCancelRef = undefined;
    }
  }

  private imagesLoaded(): void {
    const imagesLoadedLib = getImagesLoaded();
    if (this.props.disableImagesLoaded || !imagesLoadedLib || !this.masonryContainer) {
      return;
    }

    if (this.imagesLoadedCancelRef) {
      this.derefImagesLoaded();
    }

    const event = this.props.updateOnEachImageLoad ? 'progress' : 'always';
    const handler = debounce((instance: ImagesLoaded) => {
      if (this.props.onImagesLoaded) {
        this.props.onImagesLoaded(instance);
      }
      if (this.masonry) {
        this.masonry.layout();
      }
    }, 100);

    const imgLoad = imagesLoadedLib(this.masonryContainer, this.props.imagesLoadedOptions || {});
    imgLoad.on(event, handler);

    this.imagesLoadedCancelRef = () => {
      imgLoad.off(event, handler);
      handler.cancel();
    };
  }

  private initializeResizableChildren(): void {
    if (!this.props.enableResizableChildren) {
      return;
    }

    const erdMaker = getElementResizeDetectorMaker();
    if (!erdMaker) return;

    this.erd = erdMaker({
      strategy: 'scroll',
    });

    this.latestKnownDomChildren.forEach((el) => this.listenToElementResize(el as HTMLElement));
  }

  private listenToElementResize(el: HTMLElement): void {
    if (this.erd) {
      this.erd.listenTo(el, () => {
        if (this.masonry) {
          this.masonry.layout();
        }
      });
    }
  }

  private destroyErd(): void {
    if (this.erd) {
      this.latestKnownDomChildren.forEach((el) => this.erd!.uninstall(el as HTMLElement));
    }
  }

  render(): ReactNode {
    const {
      enableResizableChildren: _enableResizableChildren,
      disableImagesLoaded: _disableImagesLoaded,
      updateOnEachImageLoad: _updateOnEachImageLoad,
      onImagesLoaded: _onImagesLoaded,
      options: _options,
      imagesLoadedOptions: _imagesLoadedOptions,
      elementType: ElementType = 'div',
      onLayoutComplete: _onLayoutComplete,
      onRemoveComplete: _onRemoveComplete,
      children,
      ...restProps
    } = this.props;

    return React.createElement(
      ElementType as string,
      { ...restProps, ref: this.masonryContainerRef },
      children
    );
  }
}

// Export ResponsiveMasonry and its types
export { ResponsiveMasonry } from './ResponsiveMasonry';
export type {
  ResponsiveMasonryProps,
  ColumnsCountBreakPoints,
} from './ResponsiveMasonry';

export default MasonryComponent;
export { MasonryComponent };
