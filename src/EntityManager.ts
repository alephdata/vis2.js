import { defaultModel, Entity, Model, IEntityDatum } from '@alephdata/followthemoney'


export interface IEntityManagerOverload {
  createEntity?: (entityData: IEntityDatum) => IEntityDatum,
  undeleteEntity?: (entityId: string) => void,
  updateEntity?: (entity: Entity) => void,
  deleteEntity?: (entityId: string) => void,
}

export class EntityManager {
  public readonly model: Model
  private overload: IEntityManagerOverload | undefined

  constructor(props?: IEntityManagerOverload) {
    this.model = new Model(defaultModel);
    this.overload = props;
  }

  async createEntity(entityData: any) {
    console.log('ENTITY MANAGER: create')
    if (this.overload?.createEntity) {
      const entityWithId: IEntityDatum = await this.overload.createEntity(entityData);
      return new Entity(this.model, entityWithId);
    } else {
      const { schema, properties } = entityData;
      const entity = this.model.createEntity(schema);
      if (properties) {
        Object.entries(properties).forEach(([prop, value]: [string, any]) => (
          entity.setProperty(prop, value)
        ));
      }

      return entity;
    }
  }

  // not called externally, only used when undoing/redoing entity changes from history
  undeleteEntity(entityId: string) {
    console.log('ENTITY MANAGER: undelete')

    if (this.overload?.undeleteEntity) {
      this.overload.undeleteEntity(entityId);
    }
  }

  updateEntity(entity: Entity) {
    console.log('ENTITY MANAGER: update')

    if (this.overload?.updateEntity) {
      this.overload.updateEntity(entity);
    }
  }

  deleteEntity(entityId: string) {
    console.log('ENTITY MANAGER: delete')

    if (this.overload?.deleteEntity) {
      this.overload.deleteEntity(entityId);
    }
  }

  // FIXME: no guarantee that entity will be created/deleted with the same ID
  // entity changes in the reverse direction require undoing create/delete operations
  applyEntityChanges(entityChanges: any, factor: number) {
    const { created, updated, deleted } = entityChanges;

    created && created.forEach((entity: Entity) => factor > 0 ? this.undeleteEntity(entity.id) : this.deleteEntity(entity.id));
    updated && updated.forEach((entity: Entity) => this.updateEntity(entity));
    deleted && deleted.forEach((entity: Entity) => factor > 0 ? this.deleteEntity(entity.id) : this.undeleteEntity(entity.id));
  }
}