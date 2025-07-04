/**
 * Copyright IBM Corp. 2016, 2025
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useRef,
  type ComponentProps,
  type ReactNode,
} from 'react';
import cx from 'classnames';
import { usePrefix } from '../../internal/usePrefix';
import { useMergedRefs } from '../../internal/useMergedRefs';
import PropTypes from 'prop-types';
import { AriaLabelPropType } from '../../prop-types/AriaPropTypes';
import { SwitcherDivider, SwitcherItem } from '.';

export interface BaseSwitcherProps {
  /**
   * expects to receive <SwitcherItem />
   */
  children: ReactNode;
  /**
   * Optionally provide a custom class to apply to the underlying `<ul>` node
   */
  className?: string;
  /**
   * Specify whether the panel is expanded
   */
  expanded?: boolean;
}

interface SwitcherWithAriaLabel extends BaseSwitcherProps {
  'aria-label': string;
  'aria-labelledby'?: never;
}

interface SwitcherWithAriaLabelledBy extends BaseSwitcherProps {
  'aria-label'?: never;
  'aria-labelledby': string;
}

type SwitcherProps = SwitcherWithAriaLabel | SwitcherWithAriaLabelledBy;

const Switcher = forwardRef<HTMLUListElement, SwitcherProps>(
  function Switcher(props, forwardRef) {
    const switcherRef = useRef<HTMLUListElement>(null);
    const ref = useMergedRefs([switcherRef, forwardRef]);

    const prefix = usePrefix();
    const {
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      className: customClassName,
      children,
      expanded,
    } = props;

    const accessibilityLabel = {
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
    };

    const className = cx(`${prefix}--switcher`, {
      [customClassName || '']: !!customClassName,
    });

    const handleSwitcherItemFocus = ({
      currentIndex,
      direction,
    }: {
      currentIndex: number;
      direction: number;
    }) => {
      const enabledIndices = Children.toArray(children).reduce<number[]>(
        (acc, child, i) => {
          if (
            isValidElement<ComponentProps<typeof SwitcherItem>>(child) &&
            child.type === SwitcherItem &&
            Object.keys(child.props).length
          ) {
            acc.push(i);
          }
          return acc;
        },
        []
      );

      const nextValidIndex = (() => {
        const nextIndex = enabledIndices.indexOf(currentIndex) + direction;

        switch (enabledIndices[nextIndex]) {
          case undefined:
            if (direction === -1) {
              return enabledIndices[enabledIndices.length - 1];
            }
            return enabledIndices[0];
          case 0:
            if (direction === 1) {
              return enabledIndices[1];
            }
          default:
            return enabledIndices[nextIndex];
        }
      })();

      const switcherItem = switcherRef.current?.children[nextValidIndex]
        ?.children[0] as HTMLElement;
      if (switcherItem) {
        switcherItem.focus();
      }
    };

    const childrenWithProps = Children.toArray(children).map((child, index) => {
      if (
        isValidElement<ComponentProps<typeof SwitcherItem>>(child) &&
        child.type === SwitcherItem
      ) {
        return cloneElement(child, {
          handleSwitcherItemFocus,
          index,
          key: index,
          expanded,
        });
      }

      if (
        isValidElement<ComponentProps<typeof SwitcherDivider>>(child) &&
        child.type === SwitcherDivider
      ) {
        return cloneElement(child, {
          key: index,
        });
      }

      return child;
    });

    return (
      <ul ref={ref} className={className} {...accessibilityLabel}>
        {childrenWithProps}
      </ul>
    );
  }
);

Switcher.displayName = 'Switcher';
Switcher.propTypes = {
  /**
   * Required props for accessibility label on the underlying menu
   */
  ...AriaLabelPropType,

  /**
   * expects to receive <SwitcherItem />
   */
  children: PropTypes.node.isRequired,

  /**
   * Optionally provide a custom class to apply to the underlying `<ul>` node
   */
  className: PropTypes.string,

  /**
   * Specify whether the panel is expanded
   */
  expanded: PropTypes.bool,
};

export default Switcher;
