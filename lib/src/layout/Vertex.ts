import { Entity, Property, PropertyType, Value } from '@alephdata/followthemoney';
import { Point, IPointData } from './Point'
import { GraphLayout } from './GraphLayout'
import {Edge} from "./Edge";

interface IVertexData {
  id: string
  type: string
  label: string
  fixed: boolean
  hidden: boolean
  position?: IPointData
  entityId?: string
}

export class Vertex {
  public readonly layout: GraphLayout
  public readonly id: string
  public readonly type: string
  public readonly label: string
  public fixed: boolean
  public hidden: boolean
  public position: Point
  public readonly entityId?: string
  public garbage : boolean = false;

  constructor(layout: GraphLayout, data: IVertexData) {
    this.layout = layout
    this.id = data.id
    this.type = data.type
    this.label = data.label
    this.fixed = data.fixed
    this.hidden = data.hidden
    this.position = data.position ? Point.fromJSON(data.position) : new Point()
    this.entityId = data.entityId
  }

  getOwnEdges(): Edge[]{
    return this.layout.getEdges()
      .filter((edge) => edge.sourceId === this.id || edge.targetId === this.id)
  }
  getDegree(): number {
    return this.getOwnEdges()
      .length;
  }

  clone(): Vertex {
    return Vertex.fromJSON(this.layout, this.toJSON())
  }

  setPosition(position: Point): Vertex {
    const vertex = this.clone()
    vertex.position = position
    vertex.fixed = true
    return vertex
  }

  snapPosition(fuzzy: Point): Vertex {
    return this.setPosition(new Point(
      Math.round(fuzzy.x),
      Math.round(fuzzy.y)
    ))
  }

  updateFromEntity(vertex:Vertex){
    return Object.assign(this,
      {
        hidden: vertex.hidden,
        position: vertex.position,
      }
    )

  }

  toJSON(): IVertexData {
    return {
      id: this.id,
      type: this.type,
      label: this.label,
      fixed: this.fixed,
      hidden: this.hidden,
      position: this.position.toJSON(),
      entityId: this.entityId
    }
  }

  static fromJSON(layout: GraphLayout, data: any): Vertex {
    return new Vertex(layout, data as IVertexData)
  }

  static fromEntity(layout: GraphLayout, entity: Entity): Vertex {
    const type = PropertyType.ENTITY;
    if (entity.schema.isEdge) {
      throw new Error("Cannot make vertex from edge entity.")
    }
    return new Vertex(layout, {
      id: `${type}:${entity.id}`,
      type: type,
      label: entity.getCaption() || entity.schema.label,
      fixed: false,
      hidden: false,
      entityId: entity.id
    });
  }

  static fromValue(layout: GraphLayout, property: Property, value: Value): Vertex {
    if (property.type.name === PropertyType.ENTITY || value instanceof Entity) {
      if (value instanceof Entity) {
        return Vertex.fromEntity(layout, value);
      }
      const entity = layout.entities.get(value)
      if (!entity) {
        throw new Error("Dangling entity reference.")
      }
      return Vertex.fromEntity(layout, entity);
    }
    const type = property.type.name;
    return new Vertex(layout, {
      id: `${type}:${value}`,
      type: type,
      label: value,
      fixed: false,
      hidden: false
    });
  }

}
