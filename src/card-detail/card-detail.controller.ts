import {
  Controller,
  Get,
  Post,
  Body,
  // Patch,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
  Put,
} from '@nestjs/common';
import { CardDetailService } from './card-detail.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { User } from 'src/user/decorators/user.decorator';
import { CardDetailReviewDto } from './dto/card-detail-reviwe.dto';

@ApiTags('Card 상세')
@UseGuards(AuthGuard('jwt'))
@Controller('cardDetail')
export class CardDetailController {
  constructor(private readonly cardDetailService: CardDetailService) {}

  @ApiBearerAuth()
  @Post(':cardId')
  @UseGuards(AuthGuard('jwt'))
  async createReview(
    @User() user,
    @Param('cardId') cardId: number,
    @Body() cardDetailReviewDto: CardDetailReviewDto,
  ) {
    const data = await this.cardDetailService.create(
      user.id,
      cardId,
      cardDetailReviewDto,
    );

    return {
      statusCode: HttpStatus.CREATED,
      message: '댓글이 생성되었습니다.',
      data,
    };
  }

  @ApiBearerAuth()
  @Get(':cardId')
  @UseGuards(AuthGuard('jwt'))
  async findAll(@Param('cardId') cardId: number) {
    const data = await this.cardDetailService.getReviewByCardDetail(cardId);

    return {
      statusCode: HttpStatus.OK,
      message: '카드 전체 조회를 성공했습니다.',
      data,
    };
  }

  @ApiBearerAuth()
  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  async updateReview(
    @User() user,
    @Param('id') id: number,
    @Body() cardDetailReviewDto: CardDetailReviewDto,
  ) {
    const data = await this.cardDetailService.update(
      user.id,
      id,
      cardDetailReviewDto,
    );

    return {
      statusCode: HttpStatus.OK,
      message: '카드를 수정하였습니다.',
      data,
    };
  }

  @Delete(':id')
  remove(@User() user, @Param('id') id: number) {
    const data = this.cardDetailService.deleteReview(user.id, id);

    return {
      statusCode: HttpStatus.OK,
      message: '카드를 삭제하였습니다.',
      data,
    };
  }
}
