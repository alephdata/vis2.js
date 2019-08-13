import * as React from 'react'
import { Point } from '../layout/Point'

import './EdgeLabelRenderer.scss'

interface IEdgeLabelRendererProps {
  labelText: string,
  center: Point,
  onClick?: (e: any) => void,
  color?: string
}

interface IEdgeLabelRendererState {
  textExtents: any
}

export class EdgeLabelRenderer extends React.PureComponent<IEdgeLabelRendererProps, IEdgeLabelRendererState> {
  text: any

  constructor(props){
    super(props);
    this.state = { textExtents:null };
  }

  componentDidMount() {
    const box = this.text.getBBox();

    this.setState({textExtents:[box.width,box.height]});
  }

  render() {
    const { labelText, center, onClick, color } = this.props;
    const margin = 2;
    const extents = this.state.textExtents;
    const outline = extents ?
         <rect className="EdgeLabel__outline"
            x={-extents[0]/2-margin}
            y={-extents[1]/2-margin}
            stroke={color}
            strokeWidth=".5px"
            width={extents[0]+2*margin}
            height={extents[1]+2*margin}></rect>
         : null;

    return <g
      transform={`translate(${center.x},${center.y})`}
      onClick={onClick}
      className="EdgeLabel" >
        {outline}
        <text
          ref={(t) => { this.text = t; }}
          textAnchor="middle"
          dy={extents?(extents[1]/4):0}
          className="EdgeLabel__text"
          fill={color}>
          {labelText}
        </text>
      </g>;
 }
}
