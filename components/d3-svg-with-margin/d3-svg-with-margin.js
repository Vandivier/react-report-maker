// ref: https://github.com/AnalyticalFlavorSystems/d3ReactExample/blob/master/src/components/SVGWithMargin/index.js
// ref: https://hackernoon.com/how-and-why-to-use-d3-with-react-d239eb1ea274

import React from 'react';
import getContentContainerStyle from './getContentContainerStyle';
import getSVGDimensions from './getSVGDimensions';

/*
type Props = {
    children: React$Element | React$Element[],
    contentContainerBackgroundRectClassName: ?string,
    contentContainerGroupClassName: ?string,
    height: number,
    margin: Object | number,
    width: number,
};
*/

export default ({
    children,
    contentContainerBackgroundRectClassName,
    contentContainerGroupClassName,
    height,
    margin,
    renderContentContainerBackground,
    width,
    ...rest
}) => (
    <svg
        {...rest}
        {...getSVGDimensions({
            height,
            margin,
            width,
        })}
    >
        <g className={contentContainerGroupClassName} style={getContentContainerStyle({ margin })}>
            {!!contentContainerBackgroundRectClassName && (
                <rect className={contentContainerBackgroundRectClassName} height={height} width={width} x={0} y={0} />
            )}
            {children}
        </g>
    </svg>
);
