import { Controller, Get, Param } from '@nestjs/common';
import { ModelService } from './model.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Property-sets')
@Controller('property-sets')
export class ModelController {
  constructor(private readonly appService: ModelService) {}

  // @Get()
  // getAllPropertySets(): { data: { globalId: string; density: number; volume: number }[] } {
  //   const allPropertySetsData = this.appService.getAllPropertySetsData();
  //   return { data: allPropertySetsData };
  // }

  // @Get('density')
  // getAllDensity(): { data: { globalId: string; density: number }[] } {
  //   const allDensityData = this.appService.getAllDensityData();
  //   return { data: allDensityData };
  // }

  @Get('volume')
getAllVolume(): { data: { globalId: string; volume: number }[] } {
  const allVolumeData = this.appService.getAllVolumeData();
  return { data: allVolumeData };
}

@Get('volume/:globalId')
getVolumeByGlobalId(@Param('globalId') globalId: string): { data: { globalId: string; volume: number } } | { data: any } {
  const volumeData = this.appService.getVolumeByGlobalId(globalId);
  return volumeData ? { data: volumeData } : { data: null };
}

}