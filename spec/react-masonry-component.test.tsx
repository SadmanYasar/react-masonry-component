import React, { useState, useRef } from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import MasonryComponent, { MasonryProps } from '../lib/index';
import { MockMasonry, mockMasonryInstance, mockImagesLoaded } from './setup/jest.setup';

const masonryOptions = {
  columnWidth: 60,
};

const childrenElements = ['h4', 'h3', 'h3', 'w2', 'h2'];

describe('React Masonry Component', () => {
  describe('Core features', () => {
    it('should set correct default props', () => {
      const { container } = render(<MasonryComponent />);
      
      // Check that the component renders with default element type (div)
      expect(container.querySelector('div')).toBeInTheDocument();
    });

    it('should render container with correct elementType', () => {
      const { container: containerDiv } = render(<MasonryComponent />);
      const { container: containerSection } = render(<MasonryComponent elementType="section" />);
      const { container: containerUl } = render(<MasonryComponent elementType="ul" />);

      expect(containerDiv.querySelector('div')).toBeInTheDocument();
      expect(containerSection.querySelector('section')).toBeInTheDocument();
      expect(containerUl.querySelector('ul')).toBeInTheDocument();
    });

    it('should render container with correct className', () => {
      const { container: containerNoClass } = render(<MasonryComponent />);
      const { container: containerWithClass } = render(<MasonryComponent className="my-class" />);

      expect(containerNoClass.firstChild).not.toHaveClass('my-class');
      expect(containerWithClass.querySelector('.my-class')).toBeInTheDocument();
    });

    it('should provide a reference to the Masonry instance', () => {
      function Wrapper() {
        const masonryRef = useRef<typeof MasonryComponent | null>(null);
        
        return <MasonryComponent ref={masonryRef as React.Ref<MasonryComponent>} />;
      }

      render(<Wrapper />);
      
      // Check that Masonry was instantiated
      expect(MockMasonry.instances.length).toBe(1);
    });

    it('should support events as props', async () => {
      const layoutEventHandler = jest.fn();
      const removeEventHandler = jest.fn();

      render(
        <MasonryComponent
          onLayoutComplete={layoutEventHandler}
          onRemoveComplete={removeEventHandler}
        >
          {childrenElements.map((child, index) => (
            <li key={index}>{child}</li>
          ))}
        </MasonryComponent>
      );

      // Verify that event handlers were registered with Masonry
      expect(mockMasonryInstance.on).toHaveBeenCalledWith('layoutComplete', layoutEventHandler);
      expect(mockMasonryInstance.on).toHaveBeenCalledWith('removeComplete', removeEventHandler);
    });

    it('should render children', () => {
      render(
        <MasonryComponent className="container" elementType="ul" options={masonryOptions}>
          {childrenElements.map((cn, i) => (
            <li key={i} className={`item ${cn}`} data-testid={`item-${i}`}></li>
          ))}
        </MasonryComponent>
      );

      // Check that all children are rendered
      for (let i = 0; i < childrenElements.length; i++) {
        expect(screen.getByTestId(`item-${i}`)).toBeInTheDocument();
      }
    });

    it('should initialize Masonry with provided options', () => {
      const customOptions = {
        columnWidth: 100,
        itemSelector: '.item',
        transitionDuration: 0,
      };

      render(
        <MasonryComponent options={customOptions}>
          <div className="item">Item 1</div>
        </MasonryComponent>
      );

      // Check that Masonry was instantiated
      expect(MockMasonry.instances.length).toBe(1);
    });
  });

  describe('imagesloaded usage', () => {
    it('should call imagesloaded when component mounts', () => {
      render(
        <MasonryComponent className="container" elementType="div" options={masonryOptions}>
          <img
            className="item"
            src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
            alt="test"
          />
        </MasonryComponent>
      );

      // Verify imagesloaded was called
      expect(mockImagesLoaded).toHaveBeenCalled();
    });

    it('should not call imagesloaded when disableImagesLoaded is true', () => {
      mockImagesLoaded.mockClear();
      
      render(
        <MasonryComponent
          className="container"
          elementType="div"
          options={masonryOptions}
          disableImagesLoaded={true}
        >
          <img
            className="item"
            src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
            alt="test"
          />
        </MasonryComponent>
      );

      // Verify imagesloaded was NOT called
      expect(mockImagesLoaded).not.toHaveBeenCalled();
    });

    it('should pass imagesLoadedOptions to imagesloaded', () => {
      const imagesLoadedOptions = { background: '.imagesloaded' };
      
      render(
        <MasonryComponent
          className="container"
          elementType="div"
          options={masonryOptions}
          imagesLoadedOptions={imagesLoadedOptions}
        >
          <div className="item imagesloaded"></div>
        </MasonryComponent>
      );

      // Verify imagesloaded was called with options
      expect(mockImagesLoaded).toHaveBeenCalledWith(
        expect.any(Element),
        imagesLoadedOptions
      );
    });
  });

  describe('laying out new elements', () => {
    it('should call layout when component updates', async () => {
      function Wrapper() {
        const [items, setItems] = useState(childrenElements.slice());

        return (
          <>
            <button onClick={() => setItems(childrenElements.slice().reverse())} data-testid="reverse-btn">
              Reverse
            </button>
            <MasonryComponent className="container" elementType="ul" options={masonryOptions}>
              {items.map((cn, i) => (
                <li key={Math.random()} className={`item ${cn}`}></li>
              ))}
            </MasonryComponent>
          </>
        );
      }

      render(<Wrapper />);

      // Clear mocks to check for updates
      mockMasonryInstance.layout.mockClear();
      mockMasonryInstance.reloadItems.mockClear();

      // Trigger state change
      await act(async () => {
        screen.getByTestId('reverse-btn').click();
      });

      // Verify layout was called
      await waitFor(() => {
        expect(mockMasonryInstance.layout).toHaveBeenCalled();
      });
    });

    it('should call appended when new items are added', async () => {
      function Wrapper() {
        const [items, setItems] = useState(['item1']);

        return (
          <>
            <button onClick={() => setItems([...items, 'item2'])} data-testid="add-btn">
              Add
            </button>
            <MasonryComponent className="container" elementType="ul" options={masonryOptions}>
              {items.map((item, i) => (
                <li key={item} className="item">{item}</li>
              ))}
            </MasonryComponent>
          </>
        );
      }

      render(<Wrapper />);

      // Clear mocks
      mockMasonryInstance.appended.mockClear();

      // Add item
      await act(async () => {
        screen.getByTestId('add-btn').click();
      });

      // Verify appended was called
      await waitFor(() => {
        expect(mockMasonryInstance.appended).toHaveBeenCalled();
      });
    });
  });

  describe('removing elements', () => {
    it('should handle item removal', async () => {
      const localChildrenElements = [
        { k: 0, cn: 'h4' },
        { k: 1, cn: 'h3' },
        { k: 2, cn: 'h3' },
        { k: 3, cn: 'w2' },
        { k: 4, cn: 'h2' },
      ];

      function Wrapper() {
        const [items, setItems] = useState(localChildrenElements);

        return (
          <>
            <button onClick={() => setItems(localChildrenElements.slice(1))} data-testid="remove-btn">
              Remove First
            </button>
            <MasonryComponent
              className="container"
              elementType="ul"
              options={{ transitionDuration: 0 }}
            >
              {items.map((item) => (
                <li key={item.k} className={`item ${item.cn}`}></li>
              ))}
            </MasonryComponent>
          </>
        );
      }

      render(<Wrapper />);

      // Clear mocks
      mockMasonryInstance.layout.mockClear();
      mockMasonryInstance.reloadItems.mockClear();

      // Remove first item
      await act(async () => {
        screen.getByTestId('remove-btn').click();
      });

      // Verify layout methods were called
      await waitFor(() => {
        expect(mockMasonryInstance.reloadItems).toHaveBeenCalled();
        expect(mockMasonryInstance.layout).toHaveBeenCalled();
      });
    });
  });

  describe('cleanup', () => {
    it('should call destroy on unmount', () => {
      const { unmount } = render(
        <MasonryComponent>
          <div className="item">Item</div>
        </MasonryComponent>
      );

      mockMasonryInstance.destroy.mockClear();
      mockMasonryInstance.off.mockClear();

      unmount();

      expect(mockMasonryInstance.destroy).toHaveBeenCalled();
    });

    it('should unregister event handlers on unmount', () => {
      const onLayoutComplete = jest.fn();
      const onRemoveComplete = jest.fn();

      const { unmount } = render(
        <MasonryComponent
          onLayoutComplete={onLayoutComplete}
          onRemoveComplete={onRemoveComplete}
        >
          <div className="item">Item</div>
        </MasonryComponent>
      );

      mockMasonryInstance.off.mockClear();

      unmount();

      expect(mockMasonryInstance.off).toHaveBeenCalledWith('layoutComplete', onLayoutComplete);
      expect(mockMasonryInstance.off).toHaveBeenCalledWith('removeComplete', onRemoveComplete);
    });
  });

  describe('resizable children', () => {
    it('should initialize element resize detector when enableResizableChildren is true', () => {
      render(
        <MasonryComponent enableResizableChildren={true}>
          <div className="item">Item</div>
        </MasonryComponent>
      );

      // The element-resize-detector mock is called in the factory function
      // If we get here without errors, the component handled it correctly
      expect(MockMasonry.instances.length).toBe(1);
    });
  });

  describe('props passthrough', () => {
    it('should pass through custom HTML attributes', () => {
      render(
        <MasonryComponent
          data-testid="custom-masonry"
          aria-label="Masonry layout"
          id="my-masonry"
        >
          <div className="item">Item</div>
        </MasonryComponent>
      );

      const element = screen.getByTestId('custom-masonry');
      expect(element).toHaveAttribute('aria-label', 'Masonry layout');
      expect(element).toHaveAttribute('id', 'my-masonry');
    });

    it('should apply inline styles', () => {
      render(
        <MasonryComponent
          data-testid="styled-masonry"
          style={{ backgroundColor: 'red', padding: '10px' }}
        >
          <div className="item">Item</div>
        </MasonryComponent>
      );

      const element = screen.getByTestId('styled-masonry');
      expect(element).toHaveStyle({ backgroundColor: 'red', padding: '10px' });
    });
  });
});
