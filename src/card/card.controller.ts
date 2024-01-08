import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Put,
  Patch,
} from '@nestjs/common';
import { CardService } from './card.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { MoveCardDto } from './dto/move-card.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('card')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  // 카드 생성
  @Post('/:boardId/:columnId')
  create(
    @Param('boardId') boardId: string,
    @Param('columnId') columnId: string,
    @Body() createCardDto: CreateCardDto,
  ) {
    return this.cardService.create(+boardId, +columnId, createCardDto);
  }

  //카드 조회
  @Get()
  findAll() {
    return this.cardService.findAll();
  }

  //카드 상세 조회
  @Get('/:boardId/:columnId/:cardId')
  findOne(
    @Param('boardId') boardId: string,
    @Param('columnId') columnId: string,
    @Param('cardId') cardId: string,
  ) {
    return this.cardService.findOne(+boardId, +columnId, +cardId);
  }

  //카드수정
  //title?, members?, description?, color?
  @Put('/:boardId/:columnId/:cardId')
  update(
    @Param('boardId') boardId: string,
    @Param('columnId') columnId: string,
    @Param('cardId') cardId: string,
    @Body() updateCardDto: UpdateCardDto,
  ) {
    return this.cardService.update(+boardId, +columnId, +cardId, updateCardDto);
  }

  //카드삭제
  @Delete('/:boardId/:columnId/:cardId')
  remove(
    @Param('boardId') boardId: string,
    @Param('columnId') columnId: string,
    @Param('cardId') cardId: string,
  ) {
    return this.cardService.remove(+boardId, +columnId, +cardId);
  }

  //카드이동
  @Patch('/:boardId/:columnId/:cardId')
  move(
    @Param('boardId') boardId: string,
    @Param('columnId') columnId: string,
    @Param('cardId') cardId: string,
    @Body() moveCardDto: MoveCardDto,
  ) {
    return this.cardService.move(+boardId, +columnId, +cardId, moveCardDto);
  }
}
