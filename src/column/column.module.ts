import { Module, forwardRef } from '@nestjs/common';
import { ColumnService } from './column.service';
import { ColumnController } from './column.controller';
import { BoardModel } from 'src/board/entities/board.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ColumnModel } from './entities/column.entity';
import { CardModule } from 'src/card/card.module';
import { BoardModule } from 'src/board/board.module';

@Module({
  exports: [ColumnService],
  imports: [
    TypeOrmModule.forFeature([BoardModel, ColumnModel]),
    CardModule,
    forwardRef(() => BoardModule),
  ],
  controllers: [ColumnController],
  providers: [ColumnService],
})
export class ColumnModule {}
