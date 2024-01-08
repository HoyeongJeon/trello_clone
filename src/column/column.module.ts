import { Module } from '@nestjs/common';
import { ColumnService } from './column.service';
import { ColumnController } from './column.controller';
import { BoardModel } from 'src/board/entities/board.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ColumnModel } from './entities/column.entity';

@Module({
  exports: [ColumnService],
  imports: [TypeOrmModule.forFeature([BoardModel, ColumnModel])],
  controllers: [ColumnController],
  providers: [ColumnService],
})
export class ColumnModule {}
