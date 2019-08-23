import * as React from 'react'
import { DraggableCore, DraggableEvent, DraggableData } from 'react-draggable';
import { GraphConfig } from '../GraphConfig';
import { Point } from '../layout/Point'
import { Vertex } from '../layout/Vertex'
import { getRefMatrix, applyMatrix } from './utils';
import { VertexLabelRenderer } from './VertexLabelRenderer';
import {IconRenderer} from "./IconRenderer";
import { modes } from '../interactionModes'


interface IVertexRendererProps {
  vertex: Vertex
  config: GraphConfig
  selected: boolean
  selectVertex: (vertex: Vertex, additional?: boolean) => any
  dragSelection: (offset: Point) => any
  dropSelection: () => any
  interactionMode: string
  actions: any
}

interface IVertexRendererState {
  hovered: boolean
}

export class VertexRenderer extends React.PureComponent<IVertexRendererProps, IVertexRendererState> {
  gRef: React.RefObject<SVGGElement>

  constructor(props: Readonly<IVertexRendererProps>) {
    super(props)

    this.state = { hovered: false }
    this.onPanStart = this.onPanStart.bind(this)
    this.onPanMove = this.onPanMove.bind(this)
    this.onPanEnd = this.onPanEnd.bind(this)
    this.onClick = this.onClick.bind(this)
    this.onDoubleClick = this.onDoubleClick.bind(this)
    this.onMouseOver = this.onMouseOver.bind(this)
    this.onMouseOut = this.onMouseOut.bind(this)
    this.gRef = React.createRef()
  }

  componentDidMount() {
    const g = this.gRef.current;
    if (g !== null) {
      g.addEventListener('dblclick', this.onDoubleClick)
    }
  }

  componentWillUnmount() {
    const g = this.gRef.current;
    if (g !== null) {
      g.removeEventListener('dblclick', this.onDoubleClick)
    }
  }

  private onPanMove(e: DraggableEvent, data: DraggableData) {
    const { config } = this.props
    const matrix = getRefMatrix(this.gRef)
    const current = applyMatrix(matrix, data.x, data.y)
    const last = applyMatrix(matrix, data.lastX, data.lastY)
    const offset = config.pixelToGrid(current.subtract(last))
    if (offset.x || offset.y) {
      this.props.dragSelection(offset)
    }
  }

  onPanEnd(e: DraggableEvent, data: DraggableData) {
    this.props.dropSelection()
  }

  onPanStart(e: DraggableEvent, data: DraggableData) {
    this.onClick(e)
  }

  onClick(e: any) {
    const { vertex, selectVertex, interactionMode, actions } = this.props
    if (interactionMode === modes.EDGE_DRAW) {
      selectVertex(vertex, true)
      actions.setInteractionMode(modes.EDGE_CREATE)
      return
    }
    selectVertex(vertex, e.shiftKey)
  }

  onDoubleClick(e: MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    this.props.actions.setInteractionMode(modes.EDGE_DRAW)
  }

  onMouseOver() {
    this.props.interactionMode === modes.EDGE_DRAW && this.setState({hovered: true})
  }

  onMouseOut() {
    this.setState({hovered: false})
  }

  render() {
    const { vertex, config, selected, interactionMode } = this.props
    const { hovered } = this.state
    const { x, y } = config.gridToPixel(vertex.position)
    const translate = `translate(${x} ${y})`
    const labelPosition = new Point(0, config.VERTEX_RADIUS * config.gridUnit + config.gridUnit/2)
    const groupStyles: React.CSSProperties = {
      cursor: selected ? 'grab' : 'pointer',
    }

    return (
      <DraggableCore
        handle='.handle'
        onStart={this.onPanStart}
        onDrag={this.onPanMove}
        onStop={this.onPanEnd} >
        <g className='vertex' transform={translate} ref={this.gRef} style={groupStyles}>
          <circle
            className="handle"
            r={config.gridUnit * config.VERTEX_RADIUS}
            fill={selected || hovered ? config.SELECTED_COLOR : config.VERTEX_COLOR}
            onMouseOver={this.onMouseOver} onMouseOut={this.onMouseOut}
            />
          <VertexLabelRenderer center={labelPosition} label={vertex.label} onClick={this.onClick} color={selected ? config.SELECTED_COLOR : config.VERTEX_COLOR}/>
          <IconRenderer vertex={vertex}/>
        </g>
      </DraggableCore>
    );
  }
}
