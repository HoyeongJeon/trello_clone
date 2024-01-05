import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CardService } from './card.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Column } from 'typeorm';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('card')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Post('/:boardId/:columnId')
  create(
    @Param('boardId') boardId: number,
    @Param('columnId') columnId: number,
    @Body() createCardDto: CreateCardDto,
  ) {
    return this.cardService.create(+boardId, +columnId, createCardDto);
  }

  @Get()
  findAll() {
    return this.cardService.findAll();
  }

  @Get('/:boardId/:columnId/:cardId')
  findOne(
    @Param('boardId') boardId: string,
    @Param('columnId') columnId: string,
    @Param('cardId') cardId: string,
  ) {
    return this.cardService.findOne(+boardId, +columnId, +cardId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCardDto: UpdateCardDto) {
    return this.cardService.update(+id, updateCardDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cardService.remove(+id);
  }
}
