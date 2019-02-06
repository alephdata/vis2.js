import Schema from './schema'
import { Model } from './model'
import { PropertyValue } from './PropertyValue'
import { Edge } from '../core/Edge'

interface IEntity {}

interface IEntityDatum {
  schema: string
  created_at: string
  properties: { name: string[] }
  updated_at: string
  bulk: boolean
  schemata: string[]
  names: string[]
  id: string
  name: string
  links: { self: string; references: string; tags: string; ui: string }
  writeable: boolean
}

export { IEntity }

interface Beh {
  properties: { [x: string]: any }
  id: string
}
export class Entity {
  static generate(schemaName: string, model: Model, behaviour?: Beh): Entity {
    const schema = model.getSchema(schemaName)
    if (!schema) {
      throw console.error(new Error('Schema is not found'))
    }
    return new Entity(schema, behaviour)
  }

  public id: string
  public properties: Map<string, PropertyValue> = new Map()
  public schema: Schema

  constructor(schema: Schema, behaviour?: Beh) {
    if (schema) {
      this.schema = schema
    } else {
      throw console.error(new Error('`schema` name is require'))
    }
    if (behaviour) {
      if (behaviour.id) {
        this.id = behaviour.id
      } else {
        this.id = '' + Math.random() * 1000
      }
      if (behaviour.properties) {
        Object.entries(behaviour.properties).forEach(val => {
          this.setProperty(val[0], val[1])
        })
      }
    } else {
      this.id = '' + Math.random() * 1000
    }
  }

  // getEdge(): { source: PropertyValue, target: PropertyValue } {
  //     const schemaEdge = this.schema.getEdge();
  //     if (schemaEdge) {
  //         return {
  //             source: this.getProperty(schemaEdge.source),
  //             target: this.getProperty(schemaEdge.target),
  //         }
  //     }
  //     throw new Error(`The schema '${this.schema.name}' can be link`);
  // }

  setProperty(name: string, value: any): Entity {
    if (this.schema.hasProperty(name)) {
      const propertyValue = new PropertyValue(name, value, this.schema.getProperty(name))
      this.properties.set(name, propertyValue)
      return this
    } else {
      throw console.error(new Error('This schema doesn"t implement this property'))
    }
  }

  getProperty(name: string): PropertyValue {
    if (this.properties.has(name)) {
      return this.properties.get(name) as PropertyValue
    } else if (this.schema.hasProperty(name)) {
      return new PropertyValue(name, undefined, this.schema.getProperty(name))
    } else {
      throw new Error(`The schema '${this.schema.name}' does not have property ${name}`)
    }
  }

  is(schemaName: string) {
    return this.schema.isA(schemaName)
  }
}