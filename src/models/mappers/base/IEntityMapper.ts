export interface IEntityMapper<DomainModel, Entity> {
  toDomainModel(entity: Entity): DomainModel;
  toEntity(domain: DomainModel): Entity;
}
