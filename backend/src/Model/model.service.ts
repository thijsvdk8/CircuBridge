import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class ModelService {
  private jsonData: any;

  constructor() {
    const filePath = join('./smallBridgeModel.json');
    const fileContent = readFileSync(filePath, 'utf8')
    this.jsonData = JSON.parse(fileContent).data; // accessing the 'data' array
  }

  getAllVolumeData(): { globalId: string; volume: number }[] {
    return this.jsonData.map((propertySet: any) => {
      const globalId = propertySet.globalId;

      if (propertySet.hasProperties && Array.isArray(propertySet.hasProperties)) {
        const volumeProperty = propertySet.hasProperties.find(
          (item: any) => item.name === 'Volume',
        );

        if (volumeProperty && volumeProperty.nominalValue && volumeProperty.nominalValue.value !== null) {
          const volume = volumeProperty.nominalValue.value;
          return { globalId, volume };
        }
      }

      // If volume is not found or is null, don't include it in the result
      return null;
    }).filter(Boolean)
  }

  getVolumeByGlobalId(globalId: string): { data: { globalId: string; volume: number } } | { data: null } {
    const propertySet = this.jsonData.find(
      (item: any) => item.globalId === globalId,
    );

    if (propertySet && propertySet.hasProperties && Array.isArray(propertySet.hasProperties)) {
      const volumeProperty = propertySet.hasProperties.find(
        (item: any) => item.name === 'Volume',
      );

      if (volumeProperty && volumeProperty.nominalValue !== null && volumeProperty.nominalValue.value !== null) {
        const volume = volumeProperty.nominalValue.value;
        return { data: { globalId, volume } };
      }
    }

    // If volume is not found or is null, return null
    return { data: null };
  }
}
