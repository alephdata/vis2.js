import { forceLink, forceManyBody, forceSimulation, forceCollide, forceX } from "d3-force";
import { scaleLinear } from 'd3-scale'
import { Point, Vertex } from "../";
import { IPositioningProps } from './common';
import getForceData from './getForceData';


const alignVertical = (props:IPositioningProps): any => {
  const { center, nodes, links, groupingLinks } = getForceData(props);

  const simulation = forceSimulation(nodes)
    .force("collide", forceCollide().radius(5).strength(.01))
    .force('links', forceLink(links).strength(.03))
    .force("x", forceX(center.x).strength(10))
    .force('groupingLinks', forceLink(groupingLinks).strength(2).distance(2))
    .force("charge", forceManyBody().strength(-2))
    .stop()
    .tick(300)

  const positionVertex = (v:Vertex, i:number) => {
    const node = nodes.find(n => n.id === v.id);
    if (node) {
      return new Point(node.x, node.y)
    }
  };

  const xOffsetScale = scaleLinear()
    .domain([1, 100])
    .range([2, 15]);

  const positionEdge = (e:Edge, i:number) => {
    const source = nodes.find(n => n.id === e.sourceId);
    const target = nodes.find(n => n.id === e.targetId);
    if (source && target) {
      const y = (source.y + target.y)/2;
      const yDistance = Math.abs(source.y - target.y);
      const xOffset = i%2 ? xOffsetScale(yDistance) : -xOffsetScale(yDistance);

      return new Point(center.x + xOffset, y);
    }
  };

  return { positionVertex, positionEdge };
}

export default alignVertical;
