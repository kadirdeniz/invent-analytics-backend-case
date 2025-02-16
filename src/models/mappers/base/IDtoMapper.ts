export interface IDtoMapper<DomainModel, CreateDto, ResponseDto> {
  toDomainModel(dto: CreateDto): Partial<DomainModel>;
  toResponseDto(domain: DomainModel): ResponseDto;
}
