declare module 'masonry-layout' {
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

  type MasonryEventCallback = (items?: unknown[]) => void;

  class Masonry {
    constructor(element: string | Element, options?: MasonryOptions);
    
    layout(): void;
    layoutItems(items: Element[], isInstant?: boolean): void;
    stamp(elements: Element | Element[] | NodeList): void;
    unstamp(elements: Element | Element[] | NodeList): void;
    appended(elements: Element | Element[] | NodeList): void;
    prepended(elements: Element | Element[] | NodeList): void;
    addItems(elements: Element | Element[] | NodeList): void;
    remove(elements: Element | Element[] | NodeList): void;
    reloadItems(): void;
    destroy(): void;
    getItemElements(): Element[];
    
    on(event: string, callback: MasonryEventCallback): void;
    off(event: string, callback: MasonryEventCallback): void;
    once(event: string, callback: MasonryEventCallback): void;
    
    static data(element: Element): Masonry | undefined;
  }

  export = Masonry;
}

declare module 'imagesloaded' {
  namespace imagesloaded {
    interface ImagesLoaded {
      images: ImageLoadingImage[];
      elements: HTMLElement[];
      options: ImagesLoadedOptions;
      isComplete: boolean;
      hasAnyBroken: boolean;
      progressedCount: number;
      
      on(event: 'always' | 'done' | 'fail' | 'progress', callback: (instance: ImagesLoaded, image?: ImageLoadingImage) => void): ImagesLoaded;
      off(event: 'always' | 'done' | 'fail' | 'progress', callback: (instance: ImagesLoaded, image?: ImageLoadingImage) => void): ImagesLoaded;
      once(event: 'always' | 'done' | 'fail' | 'progress', callback: (instance: ImagesLoaded, image?: ImageLoadingImage) => void): ImagesLoaded;
    }

    interface ImageLoadingImage {
      img: HTMLImageElement;
      isLoaded: boolean;
    }

    interface ImagesLoadedOptions {
      background?: boolean | string;
    }
  }

  function imagesloaded(
    element: HTMLElement | NodeList | Element | string,
    options?: imagesloaded.ImagesLoadedOptions,
    callback?: (instance: imagesloaded.ImagesLoaded) => void
  ): imagesloaded.ImagesLoaded;

  function imagesloaded(
    element: HTMLElement | NodeList | Element | string,
    callback?: (instance: imagesloaded.ImagesLoaded) => void
  ): imagesloaded.ImagesLoaded;

  export = imagesloaded;
}

declare module 'element-resize-detector' {
  interface Erd {
    listenTo(element: HTMLElement, callback: (element: HTMLElement) => void): void;
    removeListener(element: HTMLElement, callback: (element: HTMLElement) => void): void;
    removeAllListeners(element: HTMLElement): void;
    uninstall(element: HTMLElement): void;
  }

  interface ErdOptions {
    strategy?: 'scroll' | 'object';
    callOnAdd?: boolean;
    debug?: boolean;
  }

  function elementResizeDetectorMaker(options?: ErdOptions): Erd;

  export = elementResizeDetectorMaker;
  export { Erd, ErdOptions };
}
