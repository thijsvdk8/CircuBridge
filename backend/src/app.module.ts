import { Module } from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { AppService } from './app.service';
//import { MaterialsModule } from './Materials/materials.module';
import { ModelModule } from './Model/model.module';

@Module({
  imports: [ModelModule ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {} 