import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Put,
} from '@nestjs/common';
import { CardService } from './card.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

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

  @Put('/:boardId/:columnId/:cardId')
  update(
    @Param('boardId') boardId: string,
    @Param('columnId') columnId: string,
    @Param('cardId') cardId: string,
    @Body() updateCardDto: UpdateCardDto,
  ) {
    return this.cardService.update(+boardId, +columnId, +cardId, updateCardDto);
  }

  @Delete('/:boardId/:columnId/:cardId')
  remove(
    @Param('boardId') boardId: string,
    @Param('columnId') columnId: string,
    @Param('cardId') cardId: string,
  ) {
    return this.cardService.remove(+boardId, +columnId, +cardId);
  }
}
