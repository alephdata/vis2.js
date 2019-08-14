import * as React from 'react'
import { Viewport } from '../Viewport';
import { Vertex } from '../layout/Vertex';
import { Point } from '../layout/Point';
import { Rectangle } from '../layout/Rectangle';
import { IGraphContext } from '../GraphContext'
import { Canvas } from './Canvas'
import { EdgeRenderer } from './EdgeRenderer'
import { VertexRenderer } from './VertexRenderer'
import { Edge } from '../layout/Edge';
import { GraphElement } from '../layout';

interface IGraphRendererProps extends IGraphContext {
  animateTransition: boolean
}

export class GraphRenderer extends React.Component<IGraphRendererProps> {
  constructor(props: any) {
    super(props)
    this.updateViewport = this.updateViewport.bind(this);
    this.selectElement = this.selectElement.bind(this);
    this.selectArea = this.selectArea.bind(this);
    this.dragSelection = this.dragSelection.bind(this);
    this.dropSelection = this.dropSelection.bind(this);
    this.clearSelection = this.clearSelection.bind(this);
  }

  updateViewport(viewport: Viewport) {
    this.props.updateViewport(viewport)
  }

  dragSelection(offset: Point) {
    const { layout } = this.props;
    layout.dragSelection(offset)
    this.props.updateLayout(layout)
  }

  dropSelection() {
    const { layout } = this.props;
    const shouldUpdateHistory = layout.dropSelection()
    this.props.updateLayout(layout, {modifyHistory:shouldUpdateHistory})
  }

  clearSelection() {
    const { layout } = this.props;
    layout.clearSelection()
    this.props.updateLayout(layout)
  }

  selectElement(element: GraphElement, additional: boolean = false) {
    const { layout } = this.props;
    layout.selectElement(element, additional)
    this.props.updateLayout(layout)
  }

  selectArea(area: Rectangle) {
    const { layout } = this.props;
    layout.selectArea(area)
    this.props.updateLayout(layout)
  }

  renderEdges() {
    const { layout } = this.props;
    const edges = layout.getEdges().filter((edge) => !edge.isHidden())
    return edges.map((edge) => {
      const source = layout.vertices.get(edge.sourceId);
      const target = layout.vertices.get(edge.targetId);
      return  <EdgeRenderer
          key={edge.id}
          config={layout.config}
          edge={edge}
          highlight={layout.isEdgeHighlighted(edge)}
          source={source}
          target={target}
          selectEdge={this.selectElement}
        />
      }
    )
  }

  renderVertices() {
    const { layout } = this.props;
    const vertices = layout.getVertices().filter((vertex) => !vertex.isHidden())
    return vertices.map((vertex) =>
      <VertexRenderer
        key={vertex.id}
        config={layout.config}
        selected={layout.isElementSelected(vertex)}
        vertex={vertex}
        selectVertex={this.selectElement}
        dragSelection={this.dragSelection}
        dropSelection={this.dropSelection}
      />
    )
  }

  render(){
    const { layout, viewport, animateTransition } = this.props;
    return (
      <Canvas viewport={viewport}
              selectArea={this.selectArea}
              selectionMode={layout.selectionMode}
              clearSelection={this.clearSelection}
              updateViewport={this.updateViewport}
              animateTransition={animateTransition}>
        {this.renderEdges()}
        {this.renderVertices()}
      </Canvas>
    );
  }
}